use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault};

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    LastRelease,
    UsedCids,
    ReputationScores,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct PolicyHelper {
    /// Owner (the DAO or admin account that can update policy)
    owner: AccountId,
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
        per_proposal_cap: U128,
        cooldown_seconds: u64,
        min_reputation: u32,
    ) -> Self {
        Self {
            owner,
            per_proposal_cap: per_proposal_cap.0,
            cooldown_seconds,
            last_release: LookupMap::new(StorageKey::LastRelease),
            used_cids: UnorderedSet::new(StorageKey::UsedCids),
            reputation_scores: LookupMap::new(StorageKey::ReputationScores),
            min_reputation,
        }
    }

    // ─── Policy checks ────────────────────────────────────────────────

    /// Called by the agent before submitting a Sputnik proposal.
    /// Returns true if all checks pass; panics with reason if not.
    pub fn check_policy(
        &self,
        recipient: AccountId,
        amount: U128,
        cid: String,
    ) -> bool {
        // 1. Amount cap
        require!(
            amount.0 <= self.per_proposal_cap,
            format!(
                "Amount {} exceeds per-proposal cap {}",
                amount.0, self.per_proposal_cap
            )
        );

        // 2. Cooldown
        if let Some(last_ts) = self.last_release.get(&recipient) {
            let elapsed_secs = (env::block_timestamp() - last_ts) / 1_000_000_000;
            require!(
                elapsed_secs >= self.cooldown_seconds,
                format!(
                    "Cooldown not elapsed. {} seconds remaining.",
                    self.cooldown_seconds - elapsed_secs
                )
            );
        }

        // 3. CID uniqueness (double-release prevention)
        require!(
            !self.used_cids.contains(&cid),
            "CID already used — duplicate release attempt blocked"
        );

        // 4. Reputation gate
        if self.min_reputation > 0 {
            let rep = self.reputation_scores.get(&recipient).unwrap_or(0);
            require!(
                rep >= self.min_reputation,
                format!(
                    "Recipient reputation {} below minimum {}",
                    rep, self.min_reputation
                )
            );
        }

        true
    }

    /// Called by the DAO (or agent) after a proposal is successfully executed.
    /// Records the release and marks the CID as used.
    pub fn record_release(&mut self, recipient: AccountId, cid: String) {
        self.assert_owner_or_dao();
        self.last_release
            .insert(&recipient, &env::block_timestamp());
        self.used_cids.insert(&cid);
    }

    /// Update reputation score for an account (owner/DAO only).
    pub fn update_reputation(&mut self, account: AccountId, delta: i32) {
        self.assert_owner_or_dao();
        let current = self.reputation_scores.get(&account).unwrap_or(0) as i32;
        let updated = (current + delta).max(0) as u32;
        self.reputation_scores.insert(&account, &updated);
    }

    // ─── Admin ────────────────────────────────────────────────────────

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

    // ─── Views ────────────────────────────────────────────────────────

    pub fn get_reputation(&self, account: AccountId) -> u32 {
        self.reputation_scores.get(&account).unwrap_or(0)
    }

    pub fn get_policy(&self) -> serde_json::Value {
        serde_json::json!({
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
        require!(
            caller == self.owner || caller.to_string().contains(".sputnik"),
            "Only owner or DAO can call this"
        );
    }
}
