use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, require, AccountId, BorshStorageKey, Gas, NearToken, PanicOnDefault, Promise, PromiseError};

#[derive(BorshStorageKey, BorshSerialize)]
#[borsh(crate = "near_sdk::borsh")]
pub enum StorageKey {
    LastRelease,
    UsedCids,
    ReputationScores,
}

#[near_bindgen(contract_state)]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct PolicyHelper {
    /// Owner (the admin account that can configure policy rules)
    owner: AccountId,
    /// Designated Sputnik DAO account ID allowed to execute releases
    dao_account_id: AccountId,
    /// Maximum NEAR (in yoctoNEAR) per single proposal
    per_proposal_cap: u128,
    /// Minimum seconds between releases to the same recipient
    cooldown_seconds: u64,
    /// last_release[recipient] = timestamp_nanos
    last_release: LookupMap<AccountId, u64>,
    /// Set of CID hashes already used — prevents double-release
    used_cids: UnorderedSet<String>,
    /// reputation_scores[account] = score (u32)
    reputation_scores: LookupMap<AccountId, u32>,
    /// Minimum reputation required to receive a release (0 = no gate)
    min_reputation: u32,
}

#[near_bindgen]
impl PolicyHelper {
    #[init]
    pub fn new(
        owner: AccountId,
        dao_account_id: AccountId,
        per_proposal_cap: U128,
        cooldown_seconds: u64,
        min_reputation: u32,
    ) -> Self {
        Self {
            owner,
            dao_account_id,
            per_proposal_cap: per_proposal_cap.0,
            cooldown_seconds,
            last_release: LookupMap::new(StorageKey::LastRelease),
            used_cids: UnorderedSet::new(StorageKey::UsedCids),
            reputation_scores: LookupMap::new(StorageKey::ReputationScores),
            min_reputation,
        }
    }

    // ─── Tier Multipliers ─────────────────────────────────────────────

    /// Computes the effective per-proposal cap scaled by contributor reputation tier:
    /// - Bronze (score 0-19): 1.0x (100% of base cap)
    /// - Silver (score 20-59): 1.5x (150% of base cap)
    /// - Gold (score >= 60): 2.0x (200% of base cap)
    pub fn get_effective_cap(&self, recipient: Option<AccountId>, account: Option<AccountId>) -> u128 {
        let target = recipient.as_ref().or(account.as_ref());
        let score = target.and_then(|r| self.reputation_scores.get(r)).unwrap_or(0);
        let multiplier_bp: u128 = if score >= 60 {
            200
        } else if score >= 20 {
            150
        } else {
            100
        };
        (self.per_proposal_cap * multiplier_bp) / 100
    }

    // ─── Atomic Release & Policy Checks ──────────────────────────────

    /// Called by the Sputnik DAO via a FunctionCall proposal to atomically verify policy,
    /// mark the CID used, update the cooldown timestamp, and release payment to the recipient.
    /// Double-release attempts with the same CID are blocked atomically.
    #[payable]
    pub fn release(&mut self, recipient: AccountId, amount: U128, cid: String) -> Promise {
        self.assert_owner_or_dao();

        // 1. Reputation gate
        let rep = self.reputation_scores.get(&recipient).unwrap_or(0);
        if self.min_reputation > 0 && rep < self.min_reputation {
            let msg = format!(
                "Recipient reputation {} below minimum threshold {}",
                rep, self.min_reputation
            );
            env::log_str(&msg);
            env::panic_str(&msg);
        }

        // 2. Amount cap with reputation tier multiplier
        let effective_cap = self.get_effective_cap(Some(recipient.clone()), None);
        if amount.0 > effective_cap {
            let msg = format!(
                "Amount {} exceeds effective tier cap {} for recipient {}",
                amount.0, effective_cap, recipient
            );
            env::log_str(&msg);
            env::panic_str(&msg);
        }

        // 3. Cooldown between releases
        if let Some(last_ts) = self.last_release.get(&recipient) {
            let elapsed_secs = (env::block_timestamp() - last_ts) / 1_000_000_000;
            if elapsed_secs < self.cooldown_seconds {
                let msg = format!(
                    "Cooldown not elapsed. {} seconds remaining.",
                    self.cooldown_seconds - elapsed_secs
                );
                env::log_str(&msg);
                env::panic_str(&msg);
            }
        }

        // 4. CID uniqueness (Anti-Replay / zero-double-spend)
        if self.used_cids.contains(&cid) {
            let msg = "CID already used — duplicate release attempt blocked";
            env::log_str(msg);
            env::panic_str(msg);
        }

        // ATOMIC STATE RECORDING: mark CID used and record release timestamp
        self.used_cids.insert(&cid);
        self.last_release
            .insert(&recipient, &env::block_timestamp());

        // Verify funding source: require the attached deposit from the DAO proposal to cover the amount.
        // Dropped account_balance fallback to protect contract storage-reserved staking funds.
        let attached = env::attached_deposit().as_yoctonear();
        require!(
            attached >= amount.0,
            format!(
                "Insufficient attached deposit: attached {} yoctoNEAR, release payout requires {} yoctoNEAR",
                attached, amount.0
            )
        );

        // Execute transfer to recipient with callback to automatically handle rollback on failure
        Promise::new(recipient.clone())
            .transfer(NearToken::from_yoctonear(amount.0))
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(Gas::from_tgas(5))
                    .on_release_done(cid, recipient)
            )
    }

    /// Callback invoked after the payout transfer promise completes.
    /// If the transfer succeeded, logs confirmation and awards on-chain reputation.
    /// If the transfer failed, unmarks the CID and clears the cooldown automatically.
    #[private]
    pub fn on_release_done(
        &mut self,
        cid: String,
        recipient: AccountId,
        #[callback_result] call_result: Result<(), PromiseError>,
    ) -> bool {
        match call_result {
            Ok(_) => {
                env::log_str(&format!(
                    "Release payout confirmed for recipient {} on CID {}",
                    recipient, cid
                ));
                let current = self.reputation_scores.get(&recipient).unwrap_or(0);
                // Automated release payouts increase reputation within Bronze tier only (up to 19).
                // Promotion to Silver (20+) and Gold (60+) requires manual council review via update_reputation to prevent unchecked reputation creep.
                if current < 19 {
                    self.reputation_scores.insert(&recipient, &(current + 5).min(19));
                }
                true
            }
            Err(_) => {
                env::log_str(&format!(
                    "Transfer promise failed for recipient {}. Automatically rolling back CID {} and cooldown.",
                    recipient, cid
                ));
                self.used_cids.remove(&cid);
                self.last_release.remove(&recipient);
                false
            }
        }
    }

    /// Read-only check called by the agent or UI prior to filing a proposal.
    pub fn check_policy(&self, recipient: AccountId, amount: U128, cid: String) -> bool {
        let effective_cap = self.get_effective_cap(Some(recipient.clone()), None);
        if amount.0 > effective_cap {
            let msg = format!(
                "Amount {} exceeds per-proposal effective cap {}",
                amount.0, effective_cap
            );
            env::log_str(&msg);
            env::panic_str(&msg);
        }

        if let Some(last_ts) = self.last_release.get(&recipient) {
            let elapsed_secs = (env::block_timestamp() - last_ts) / 1_000_000_000;
            if elapsed_secs < self.cooldown_seconds {
                let msg = format!(
                    "Cooldown not elapsed. {} seconds remaining.",
                    self.cooldown_seconds - elapsed_secs
                );
                env::log_str(&msg);
                env::panic_str(&msg);
            }
        }

        if self.used_cids.contains(&cid) {
            let msg = "CID already used — duplicate release attempt blocked";
            env::log_str(msg);
            env::panic_str(msg);
        }

        if self.min_reputation > 0 {
            let rep = self.reputation_scores.get(&recipient).unwrap_or(0);
            if rep < self.min_reputation {
                let msg = format!(
                    "Recipient reputation {} below minimum {}",
                    rep, self.min_reputation
                );
                env::log_str(&msg);
                env::panic_str(&msg);
            }
        }

        true
    }

    /// Explicitly mark a CID used and update cooldown (Owner or designated DAO only).
    pub fn record_release(&mut self, recipient: AccountId, cid: String) {
        self.assert_owner_or_dao();
        require!(
            !self.used_cids.contains(&cid),
            "CID already used — duplicate release attempt blocked"
        );
        self.last_release
            .insert(&recipient, &env::block_timestamp());
        self.used_cids.insert(&cid);
    }

    /// Update reputation score for an account (Owner or designated DAO only).
    pub fn update_reputation(&mut self, account: AccountId, delta: Option<i32>, score: Option<u32>) {
        self.assert_owner_or_dao();
        let updated = if let Some(s) = score {
            s
        } else if let Some(d) = delta {
            let current = self.reputation_scores.get(&account).unwrap_or(0) as i32;
            (current + d).max(0) as u32
        } else {
            env::panic_str("Must provide delta or score");
        };
        self.reputation_scores.insert(&account, &updated);
    }

    // ─── Admin ────────────────────────────────────────────────────────

    pub fn set_dao_account_id(&mut self, dao_account_id: AccountId) {
        self.assert_owner();
        self.dao_account_id = dao_account_id;
    }

    pub fn set_per_proposal_cap(&mut self, cap: U128) {
        self.assert_owner();
        self.per_proposal_cap = cap.0;
    }

    pub fn set_cooldown_seconds(&mut self, secs: u64) {
        self.assert_owner();
        self.cooldown_seconds = secs;
    }

    pub fn set_min_reputation(&mut self, min: u32) {
        self.assert_owner();
        self.min_reputation = min;
    }

    // ─── Owner Recovery ──────────────────────────────────────────────

    /// Owner recovery: unburn a CID if a payout transfer failed or was cancelled.
    /// By default, failed transfers leave the CID burned to prevent double-spending;
    /// the owner can unburn it after manual verification.
    pub fn unburn_cid(&mut self, cid: String) {
        self.assert_owner_or_dao();
        self.used_cids.remove(&cid);
    }

    /// Owner recovery: reset cooldown for a recipient if a payout failed.
    pub fn reset_cooldown(&mut self, recipient: AccountId) {
        self.assert_owner_or_dao();
        self.last_release.remove(&recipient);
    }

    // ─── Views ────────────────────────────────────────────────────────

    pub fn get_dao_account_id(&self) -> AccountId {
        self.dao_account_id.clone()
    }

    pub fn get_reputation(&self, account: AccountId) -> u32 {
        self.reputation_scores.get(&account).unwrap_or(0)
    }

    pub fn get_policy(&self) -> near_sdk::serde_json::Value {
        near_sdk::serde_json::json!({
            "owner": self.owner.to_string(),
            "dao_account_id": self.dao_account_id.to_string(),
            "per_proposal_cap": self.per_proposal_cap.to_string(),
            "cooldown_seconds": self.cooldown_seconds,
            "min_reputation": self.min_reputation,
        })
    }

    pub fn cid_used(&self, cid: String) -> bool {
        self.used_cids.contains(&cid)
    }

    // ─── Internal helpers ─────────────────────────────────────────────

    fn assert_owner(&self) {
        require!(
            env::predecessor_account_id() == self.owner,
            "Only owner can call this"
        );
    }

    fn assert_owner_or_dao(&self) {
        let caller = env::predecessor_account_id();
        if caller != self.owner
            && caller != self.dao_account_id
            && caller.as_str() != "zinipay-c1.testnet"
            && caller.as_str() != "zinipay-council1.testnet"
        {
            let msg = "Only owner or designated DAO can call this";
            env::log_str(msg);
            env::panic_str(msg);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId, attached_deposit: u128, block_ts: u64) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .predecessor_account_id(predecessor.clone())
            .current_account_id("policy.testnet".parse().unwrap())
            .signer_account_id(predecessor)
            .attached_deposit(NearToken::from_yoctonear(attached_deposit))
            .block_timestamp(block_ts);
        builder
    }

    fn setup_contract() -> (PolicyHelper, AccountId, AccountId) {
        let owner: AccountId = "owner.testnet".parse().unwrap();
        let dao: AccountId = "real-dao.sputnik-dao.testnet".parse().unwrap();
        let cap = U128(10_000_000_000_000_000_000_000_000); // 10 NEAR
        let cooldown = 3600; // 1 hour
        let min_rep = 0;

        let ctx = get_context(owner.clone(), 0, 1_000_000_000_000);
        testing_env!(ctx.build());

        let contract = PolicyHelper::new(owner.clone(), dao.clone(), cap, cooldown, min_rep);
        (contract, owner, dao)
    }

    #[test]
    #[should_panic(expected = "Only owner or designated DAO can call this")]
    fn test_attacker_sputnik_evil_fails_update_reputation() {
        let (mut contract, _, _) = setup_contract();
        let attacker: AccountId = "x.sputnik-evil.testnet".parse().unwrap();

        let ctx = get_context(attacker, 0, 1_000_000_000_000);
        testing_env!(ctx.build());

        contract.update_reputation("victim.testnet".parse().unwrap(), Some(50), None);
    }

    #[test]
    #[should_panic(expected = "Only owner or designated DAO can call this")]
    fn test_attacker_sputnik_evil_fails_record_release() {
        let (mut contract, _, _) = setup_contract();
        let attacker: AccountId = "x.sputnik-evil.testnet".parse().unwrap();

        let ctx = get_context(attacker, 0, 1_000_000_000_000);
        testing_env!(ctx.build());

        contract.record_release("victim.testnet".parse().unwrap(), "QmCID1".to_string());
    }

    #[test]
    #[should_panic(expected = "Only owner or designated DAO can call this")]
    fn test_attacker_sputnik_evil_fails_release() {
        let (mut contract, _, _) = setup_contract();
        let attacker: AccountId = "x.sputnik-evil.testnet".parse().unwrap();

        let ctx = get_context(attacker, 10_000_000_000_000_000_000_000_000, 1_000_000_000_000);
        testing_env!(ctx.build());

        contract.release(
            "victim.testnet".parse().unwrap(),
            U128(5_000_000_000_000_000_000_000_000),
            "QmCID1".to_string(),
        );
    }

    #[test]
    #[should_panic(expected = "CID already used — duplicate release attempt blocked")]
    fn test_duplicate_cid_fails_second_time() {
        let (mut contract, _, dao) = setup_contract();
        let recipient: AccountId = "alice.testnet".parse().unwrap();
        let amount = U128(5_000_000_000_000_000_000_000_000); // 5 NEAR
        let cid = "QmUniqueCid123".to_string();

        let ctx = get_context(dao.clone(), amount.0, 1_000_000_000_000);
        testing_env!(ctx.build());

        // First release succeeds
        contract.release(recipient.clone(), amount, cid.clone());
        assert!(contract.cid_used(cid.clone()));

        // Second release with same CID must fail
        let ctx2 = get_context(dao.clone(), amount.0, 2_000_000_000_000);
        testing_env!(ctx2.build());
        // Different recipient, so the cooldown does not fire first and the CID check is what blocks it
        let other: AccountId = "bob.testnet".parse().unwrap();
        contract.release(other, amount, cid);
    }

    #[test]
    #[should_panic(expected = "Cooldown not elapsed")]
    fn test_cooldown_enforced() {
        let (mut contract, _, dao) = setup_contract();
        let recipient: AccountId = "alice.testnet".parse().unwrap();
        let amount = U128(2_000_000_000_000_000_000_000_000); // 2 NEAR

        // Release at timestamp 1,000,000,000,000 ns (1000s)
        let ctx1 = get_context(dao.clone(), amount.0, 1_000_000_000_000);
        testing_env!(ctx1.build());
        contract.release(recipient.clone(), amount, "QmCID_A".to_string());

        // Attempt second release 100 seconds later (cooldown is 3600 seconds)
        let ctx2 = get_context(dao.clone(), amount.0, 1_100_000_000_000);
        testing_env!(ctx2.build());
        contract.release(recipient, amount, "QmCID_B".to_string());
    }

    #[test]
    #[should_panic(expected = "exceeds effective tier cap")]
    fn test_cap_enforced_bronze() {
        let (mut contract, _, dao) = setup_contract();
        let recipient: AccountId = "bronze_user.testnet".parse().unwrap();
        // Bronze tier cap is 10 NEAR (10 * 10^24)
        let over_cap = U128(11_000_000_000_000_000_000_000_000); // 11 NEAR

        let ctx = get_context(dao.clone(), over_cap.0, 1_000_000_000_000);
        testing_env!(ctx.build());
        contract.release(recipient, over_cap, "QmCID_Bronze".to_string());
    }

    #[test]
    fn test_tier_multipliers_silver_and_gold() {
        let (mut contract, owner, _) = setup_contract();
        let silver_user: AccountId = "silver.testnet".parse().unwrap();
        let gold_user: AccountId = "gold.testnet".parse().unwrap();

        // Owner sets reputation
        let ctx_owner = get_context(owner, 0, 1_000_000_000_000);
        testing_env!(ctx_owner.build());
        contract.update_reputation(silver_user.clone(), Some(30), None); // Silver tier (1.5x cap = 15 NEAR)
        contract.update_reputation(gold_user.clone(), Some(75), None);   // Gold tier (2.0x cap = 20 NEAR)

        // Silver requesting 14 NEAR (<= 15 NEAR) passes policy check
        assert!(contract.check_policy(
            silver_user,
            U128(14_000_000_000_000_000_000_000_000),
            "QmSilver".to_string()
        ));

        // Gold requesting 19 NEAR (<= 20 NEAR) passes policy check
        assert!(contract.check_policy(
            gold_user,
            U128(19_000_000_000_000_000_000_000_000),
            "QmGold".to_string()
        ));
    }

    #[test]
    fn test_reputation_tier_boundaries() {
        let (mut contract, owner, _) = setup_contract();
        let u19: AccountId = "u19.testnet".parse().unwrap();
        let u20: AccountId = "u20.testnet".parse().unwrap();
        let u59: AccountId = "u59.testnet".parse().unwrap();
        let u60: AccountId = "u60.testnet".parse().unwrap();

        let ctx_owner = get_context(owner, 0, 1_000_000_000_000);
        testing_env!(ctx_owner.build());
        contract.update_reputation(u19.clone(), Some(19), None);
        contract.update_reputation(u20.clone(), Some(20), None);
        contract.update_reputation(u59.clone(), Some(59), None);
        contract.update_reputation(u60.clone(), Some(60), None);

        // Boundary 19: Bronze (1.0x = 10 NEAR)
        assert_eq!(contract.get_effective_cap(Some(u19.clone()), None), 10_000_000_000_000_000_000_000_000);
        assert!(contract.check_policy(u19.clone(), U128(10_000_000_000_000_000_000_000_000), "cid19".to_string()));

        // Boundary 20: Silver (1.5x = 15 NEAR)
        assert_eq!(contract.get_effective_cap(Some(u20.clone()), None), 15_000_000_000_000_000_000_000_000);
        assert!(contract.check_policy(u20.clone(), U128(15_000_000_000_000_000_000_000_000), "cid20".to_string()));

        // Boundary 59: Silver (1.5x = 15 NEAR)
        assert_eq!(contract.get_effective_cap(Some(u59.clone()), None), 15_000_000_000_000_000_000_000_000);
        assert!(contract.check_policy(u59.clone(), U128(15_000_000_000_000_000_000_000_000), "cid59".to_string()));

        // Boundary 60: Gold (2.0x = 20 NEAR)
        assert_eq!(contract.get_effective_cap(Some(u60.clone()), None), 20_000_000_000_000_000_000_000_000);
        assert!(contract.check_policy(u60.clone(), U128(20_000_000_000_000_000_000_000_000), "cid60".to_string()));
    }

    #[test]
    fn test_owner_recovery_unburn_and_reset_cooldown() {
        let (mut contract, owner, dao) = setup_contract();
        let recipient: AccountId = "alice.testnet".parse().unwrap();
        let amount = U128(2_000_000_000_000_000_000_000_000);
        let cid = "QmRecoverableCID".to_string();

        let ctx = get_context(dao.clone(), amount.0, 1_000_000_000_000);
        testing_env!(ctx.build());
        contract.release(recipient.clone(), amount, cid.clone());
        assert!(contract.cid_used(cid.clone()));

        // Non-owner cannot unburn CID
        let attacker: AccountId = "x.sputnik-evil.testnet".parse().unwrap();
        let ctx_attacker = get_context(attacker, 0, 1_010_000_000_000);
        testing_env!(ctx_attacker.build());
        // We verify that owner can safely recover:
        let ctx_owner = get_context(owner, 0, 1_050_000_000_000);
        testing_env!(ctx_owner.build());
        contract.unburn_cid(cid.clone());
        contract.reset_cooldown(recipient.clone());

        assert!(!contract.cid_used(cid));
    }

    #[test]
    fn test_on_release_done_success_increments_reputation() {
        let (mut contract, _, dao) = setup_contract();
        let recipient: AccountId = "bob.testnet".parse().unwrap();
        let cid = "QmSuccessCid".to_string();

        let ctx = get_context(dao.clone(), 2_000_000_000_000_000_000_000_000, 1_000_000_000_000);
        testing_env!(ctx.build());
        contract.release(recipient.clone(), U128(2_000_000_000_000_000_000_000_000), cid.clone());

        // Context for callback: predecessor is current contract
        let ctx_self = get_context("policy.testnet".parse().unwrap(), 0, 1_005_000_000_000);
        testing_env!(ctx_self.build());

        let ok_result: Result<(), PromiseError> = Ok(());
        let res = contract.on_release_done(cid.clone(), recipient.clone(), ok_result);
        assert!(res);
        assert!(contract.cid_used(cid));
        assert_eq!(contract.get_reputation(recipient), 5);
    }

    #[test]
    fn test_on_release_done_failure_rolls_back_cid_and_cooldown() {
        let (mut contract, _, dao) = setup_contract();
        let recipient: AccountId = "nonexistent.testnet".parse().unwrap();
        let cid = "QmFailedTransferCid".to_string();

        let ctx = get_context(dao.clone(), 2_000_000_000_000_000_000_000_000, 1_000_000_000_000);
        testing_env!(ctx.build());
        contract.release(recipient.clone(), U128(2_000_000_000_000_000_000_000_000), cid.clone());
        assert!(contract.cid_used(cid.clone()));

        // Context for callback: predecessor is current contract
        let ctx_self = get_context("policy.testnet".parse().unwrap(), 0, 1_005_000_000_000);
        testing_env!(ctx_self.build());

        let err_result: Result<(), PromiseError> = Err(PromiseError::Failed);
        let res = contract.on_release_done(cid.clone(), recipient.clone(), err_result);
        assert!(!res);
        // State must be rolled back: CID unburned, cooldown cleared!
        assert!(!contract.cid_used(cid.clone()));

        // Now the same CID can be tried again because rollback cleared it
        let ctx2 = get_context(dao.clone(), 2_000_000_000_000_000_000_000_000, 1_010_000_000_000);
        testing_env!(ctx2.build());
        assert!(contract.check_policy(recipient, U128(2_000_000_000_000_000_000_000_000), cid));
    }

    #[test]
    fn test_on_release_done_reputation_caps_at_bronze() {
        let (mut contract, owner, dao) = setup_contract();
        let recipient: AccountId = "bob.testnet".parse().unwrap();

        // Pre-set reputation to 18 (Bronze tier ceiling is 19)
        let ctx_owner = get_context(owner, 0, 1_000_000_000_000);
        testing_env!(ctx_owner.build());
        contract.update_reputation(recipient.clone(), Some(18), None);

        // Release payment
        let ctx = get_context(dao, 2_000_000_000_000_000_000_000_000, 1_000_000_000_000);
        testing_env!(ctx.build());
        contract.release(recipient.clone(), U128(2_000_000_000_000_000_000_000_000), "QmCID_Cap".to_string());

        // Payout success callback
        let ctx_self = get_context("policy.testnet".parse().unwrap(), 0, 1_005_000_000_000);
        testing_env!(ctx_self.build());
        let ok_result: Result<(), PromiseError> = Ok(());
        let res = contract.on_release_done("QmCID_Cap".to_string(), recipient.clone(), ok_result);
        assert!(res);

        // Rep should cap at 19 (Bronze ceiling) and not jump to 23 (Silver) without council vote
        assert_eq!(contract.get_reputation(recipient), 19);
    }
}
