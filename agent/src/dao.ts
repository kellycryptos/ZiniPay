/**
 * dao.ts — Sputnik DAO / near-api-js wrapper
 *
 * Wraps the key Sputnik DAO v2 contract methods:
 *   add_proposal, act_proposal, get_policy, get_proposals, get_proposal
 *
 * The agent uses a function-call key, not a full-access key.
 * This limits what the key can do to only the allowed methods.
 */

import { connect, KeyPair, keyStores, utils } from 'near-api-js';
import type { ConnectConfig } from 'near-api-js';

// ─── Types mirroring Sputnik DAO v2 ABI ────────────────────────────────────

export type ProposalKind =
  | { Transfer: { token_id: string; receiver_id: string; amount: string; msg?: string } }
  | { FunctionCall: { receiver_id: string; actions: FunctionCallAction[] } }
  | { AddMemberToRole: { member_id: string; role: string } }
  | { RemoveMemberFromRole: { member_id: string; role: string } }
  | 'ChangePolicy'
  | 'Vote';

export interface FunctionCallAction {
  method_name: string;
  args: string; // base64-encoded JSON
  deposit: string;
  gas: string;
}

export interface ProposalInput {
  description: string;
  kind: ProposalKind;
}

export type VoteAction = 'VoteApprove' | 'VoteReject' | 'VoteRemove' | 'Finalize';

export interface Proposal {
  id: number;
  proposer: string;
  description: string;
  kind: ProposalKind;
  status: 'InProgress' | 'Approved' | 'Rejected' | 'Removed' | 'Expired' | 'Moved' | 'Failed';
  vote_counts: Record<string, number[]>;
  votes: Record<string, string>;
  submission_time: string;
}

export interface DaoPolicy {
  roles: PolicyRole[];
  default_vote_policy: VotePolicy;
  proposal_bond: string;
  proposal_period: string;
  bounty_bond: string;
  bounty_forgiveness_period: string;
}

export interface PolicyRole {
  name: string;
  kind: { Everyone: null } | { Member: string[] } | { Group: string[] };
  permissions: string[];
  vote_policy: Record<string, VotePolicy>;
}

export interface VotePolicy {
  weight_kind: 'RoleWeight' | 'TokenWeight';
  quorum: string;
  threshold: number[] | string;
}

// ─── DAO Client ─────────────────────────────────────────────────────────────

export class SputnikDAO {
  private networkId: string;
  private contractId: string;
  private accountId: string;
  private privateKey: string;
  private proposalBond: string;

  constructor(opts: {
    networkId: string;
    contractId: string;
    accountId: string;
    privateKey: string;
    proposalBond: string;
  }) {
    this.networkId = opts.networkId;
    this.contractId = opts.contractId;
    this.accountId = opts.accountId;
    this.privateKey = opts.privateKey;
    this.proposalBond = opts.proposalBond;
  }

  /** Build a NEAR connection with the agent's key injected. */
  private async getAccount() {
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(this.privateKey as `ed25519:${string}`);
    await keyStore.setKey(this.networkId, this.accountId, keyPair);

    const config: ConnectConfig = {
      networkId: this.networkId,
      keyStore,
      nodeUrl:
        this.networkId === 'mainnet'
          ? 'https://rpc.mainnet.near.org'
          : 'https://rpc.testnet.near.org',
    };

    const near = await connect(config);
    return near.account(this.accountId);
  }

  /**
   * Submit a new proposal to the DAO.
   * Attaches the proposal bond (default 1 NEAR).
   * Returns the proposal ID.
   */
  async addProposal(proposal: ProposalInput): Promise<number> {
    const account = await this.getAccount();
    const result = await account.functionCall({
      contractId: this.contractId,
      methodName: 'add_proposal',
      args: { proposal },
      gas: BigInt('100000000000000'),       // 100 TGas
      attachedDeposit: BigInt(this.proposalBond),
    });

    // The return value is the proposal ID
    const id = JSON.parse(Buffer.from((result.status as any).SuccessValue, 'base64').toString());
    return id as number;
  }

  /**
   * Vote on a proposal. Requires the account to have the right role.
   */
  async actProposal(id: number, action: VoteAction): Promise<void> {
    const account = await this.getAccount();
    await account.functionCall({
      contractId: this.contractId,
      methodName: 'act_proposal',
      args: { id, action },
      gas: BigInt('100000000000000'),
    });
  }

  /**
   * Read the DAO's governance policy (roles, bonds, voting rules).
   */
  async getPolicy(): Promise<DaoPolicy> {
    const account = await this.getAccount();
    return account.viewFunction({
      contractId: this.contractId,
      methodName: 'get_policy',
      args: {},
    }) as Promise<DaoPolicy>;
  }

  /**
   * Fetch a paginated list of proposals.
   */
  async getProposals(fromIndex = 0, limit = 50): Promise<Proposal[]> {
    const account = await this.getAccount();
    return account.viewFunction({
      contractId: this.contractId,
      methodName: 'get_proposals',
      args: { from_index: fromIndex, limit },
    }) as Promise<Proposal[]>;
  }

  /**
   * Fetch a single proposal by ID.
   */
  async getProposal(id: number): Promise<Proposal> {
    const account = await this.getAccount();
    return account.viewFunction({
      contractId: this.contractId,
      methodName: 'get_proposal',
      args: { id },
    }) as Promise<Proposal>;
  }

  /**
   * Human-readable NEAR amount from yoctoNEAR string.
   */
  static formatNear(yocto: string): string {
    return utils.format.formatNearAmount(yocto, 4);
  }

  /**
   * Parse NEAR amount to yoctoNEAR string.
   */
  static parseNear(near: string): string {
    return utils.format.parseNearAmount(near) ?? '0';
  }
}
