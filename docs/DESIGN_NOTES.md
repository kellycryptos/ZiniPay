# ZiniPay /app Redesign Plan & Design System Notes

## 1. Context & Job to be Done
The `/app` dashboard is a payout approval queue for a community treasury governed by Sputnik DAO v2 and constrained by the ZiniPay PolicyHelper smart contract.
- **Primary user**: A DAO council member whose job is to review pending payout releases, verify the deliverables and policy checks, and vote approve/reject; or an agent/contributor submitting a verified payout.
- **The hero**: The cryptographic **release receipt**. Every other element on the page stays quiet and supports this singular focal point.

---

## 2. Color Palette ("Paper on a Dark Desk")
Rather than another generic Web3 dark theme or copying GitHub Primer dark tokens, the design embodies **"Paper on a Dark Desk"**: the council member sits at a quiet, dark midnight-slate desk (`#121721`), while the release receipt rests in the center as a physical, high-contrast bone-paper document (`#FDFDFE`) with deep slate ink (`#0F172A`).

| Token Name | Hex Code | Semantic Role | Contrast Ratio & WCAG AA Verification |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#121721` | Midnight slate desk canvas. Quiet, deep blue-gray. | Canvas base |
| `--bg-panel` | `#1A2230` | Left rail and secondary panel surfaces. | 1.3:1 subtle depth separation from canvas |
| `--bg-panel-alt`| `#222C3D` | Interactive controls, inputs, and selected states. | 1.8:1 elevation |
| `--border-subtle`| `#28354A` | Hairline ruling pen borders on dark surfaces. | Contrast with canvas 2.1:1 |
| `--text-primary` | `#E2E8F0` | Off-white text on dark panels. | **11.4:1** on `#121721` (Exceeds WCAG AAA 7:1) |
| `--text-secondary`| `#8D9EBA`| Secondary text on dark panels. | **5.3:1** on `#121721` (Exceeds WCAG AA 4.5:1) |
| `--text-muted`   | `#64758F` | Captions, footnotes on dark panels. | **3.6:1** on `#121721` (Exceeds WCAG AA for UI graphics) |
| `--bg-receipt`   | `#FDFDFE` | Crisp bone paper sheet for release receipts (The Hero). | Visual pop against dark desk |
| `--text-receipt` | `#0F172A` | Deep slate ink for receipt headings and key values. | **15.2:1** on `#FDFDFE` (Exceeds WCAG AAA 7:1) |
| `--text-receipt-secondary` | `#334155` | Secondary ink for summaries and data fields. | **9.1:1** on `#FDFDFE` (Exceeds WCAG AAA 7:1) |
| `--text-receipt-muted` | `#64748B` | Field label captions on paper (Recipient, Amount, etc.). | **4.7:1** on `#FDFDFE` (Exceeds WCAG AA 4.5:1) |
| `--color-passed` | `#0D7A5F` | Deep spruce green. Used for verified pass & execute states. | **4.8:1** on paper tag `#EDF7F4` (Exceeds WCAG AA) |
| `--color-blocked`| `#B91C1C` | Carmine red. Used strictly for invariant violations. | **5.2:1** on paper tag `#FEF2F2` (Exceeds WCAG AA) |
| `--color-pending`| `#B45309` | Warm amber. Used for awaiting votes & claimed hashes. | **4.6:1** on paper tag `#FFFBEB` (Exceeds WCAG AA) |

---

## 3. Typography Hierarchy
- **Primary Sans**: `Plus Jakarta Sans` (weights: 400, 500, 600, 700). Used for all headings, body text, explanations, tabs, buttons, and form labels.
  - Heading 1 (Page/Receipt): 18px / line-height 24px, weight 700.
  - Heading 2 (Card title): 14px / line-height 20px, weight 600.
  - Body text: 13px / line-height 19px, weight 400.
  - Microcopy / Labels: 12px / line-height 16px, weight 500, sentence case.
- **Monospace (Data Only)**: `IBM Plex Mono` (weights: 400, 500, 600).
  - Used **strictly** for:
    1. Account IDs (e.g., `alice.testnet`, `zinipay.sputnikv2.testnet`)
    2. Hashes & CIDs (e.g., `bafybeig...`, `sha256:7f8a...`)
    3. Numerical amounts (e.g., `4.50 NEAR`, `97.66 NEAR`)
    4. Code identifiers and contract method names (`release`, `check_policy`)

---

## 4. Layout Architecture & Wireframes

### Layout Concept
"A quiet council desk where the pending release receipt is the solitary focus, supported by a compact left rail for live contract limits and an on-demand security audit drawer."

### Desktop Wireframe (1440px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Z] ZiniPay                                           [Connection]  [Connect Wallet]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌─ Left Rail (250px) ─┐  ┌─ Main Area (Hero, 880px) ──────────────────────────────────┐│
│  │                     │  │  Pending approval (2)   Paid (14)   All   New payout       ││
│  │  Treasury balance   │  │  ────────────────────                                      ││
│  │  97.66 NEAR         │  │  How the three release gates work    [Filter: All]   [↻]   ││
│  │                     │  │                                                            ││
│  │  Policy limits      │  │  ╔═ Release Receipt #104 ════════════════════════════════╗ ││
│  │  Per payout: 10 N   │  │  ║ (Light bone paper sheet resting on dark desk)         ║ ││
│  │  Daily limit: 50 N  │  │  ║ Cross-chain Intent Router            Pending approval ║ ││
│  │  Cooldown: 4.0 h    │  │  ║ Verified GitHub PR #88 with passing test suite.       ║ ││
│  │                     │  │  ║ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  ║ ││
│  │  Security audit     │  │  ║ Recipient      alice.testnet                          ║ ││
│  │  [View audit log]   │  │  ║ Amount         4.50 NEAR                              ║ ││
│  │                     │  │  ║ Deliverable    bafybeig...                            ║ ││
│  │                     │  │  ║ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  ║ ││
│  │                     │  │  ║ Proof          Claimed in description (not on-chain)  ║ ││
│  │                     │  │  ║ Policy         Passed · Would pass if executed now    ║ ││
│  │                     │  │  ║ Council quorum Pending · 2 of 3 council votes         ║ ││
│  │                     │  │  ║                                                       ║ ││
│  │                     │  │  ║ [Approve payout]   [Reject]   [Deliverable proof]     ║ ││
│  │                     │  │  ╚═══════════════════════════════════════════════════════╝ ││
│  └─────────────────────┘  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Wireframe (390px)
```
┌───────────────────────────────────────┐
│ [Z] ZiniPay        [Config]  [Wallet] │
├───────────────────────────────────────┤
│ Treasury: 97.66 NEAR  ·  Cap: 10.0 N  │
├───────────────────────────────────────┤
│ [Pending (2)] [Paid] [All] [New]      │
│ ─────────────                         │
│ How the three release gates work      │
│                                       │
│ ╔═ Release Receipt #104 ════════════╗ │
│ ║ Intent Router Implementation      ║ │
│ ║ Status: Pending approval          ║ │
│ ║ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ║ │
│ ║ Recipient: alice.testnet          ║ │
│ ║ Amount: 4.50 NEAR                 ║ │
│ ║ Deliverable: bafybeig...          ║ │
│ ║ Proof: Claimed in description     ║ │
│ ║ Policy: Passed · Would pass now   ║ │
│ ║ Quorum: Pending (2 of 3 votes)    ║ │
│ ║                                   ║ │
│ ║ [Approve payout]  [Reject]        ║ │
│ ╚═══════════════════════════════════╝ │
└───────────────────────────────────────┘
```

---

## 5. Review & Revisions Against Stock Defaults

| Previous Default / Habit | Why It Failed | What Was Changed & Why |
| :--- | :--- | :--- |
| **Stock GitHub Dark Tokens** | Used GitHub Primer dark tokens (`#0D1117`, `#161B22`, `#E6EDF3`). Looked identical to GitHub or generic developer tooling. | Designed custom "Paper on a Dark Desk" palette. Midnight slate desk (`#121721`) with bone-paper receipt (`#FDFDFE`), deep slate ink (`#0F172A`), and botanical spruce (`#0D7A5F`). |
| **Receipt Disguised as Card** | Dark receipts blended into the dark background and had no physical presence. | Styled receipts as crisp paper sheets with hairline dashed perforations, inverted paper status stamps, and 15.2:1 contrast ink. |
| **Arrow Glyphs on Legend (`›`, `▸`, `▾`)** | Generic chevron icons look busy and distract from the document. | Clean underlined text button: `How the three release gates work` / `Hide gate verification details` with zero arrow glyphs. |
| **Mobile Horizontal Overflow at 390px** | Native scrollbars under tabs and fixed-width input rows clipped outside the 390px screen. | Added `.no-scrollbar` utility and made forms responsive with vertical stacking (`flex-col sm:flex-row`). |
| **Competing Green Primary Actions** | Two bright green buttons on the same screen ("Connect wallet" in navbar and "Connect" in onboarding) confused visual priority. | Made navbar connect wallet button a clean secondary button (`btn-secondary`); reserved primary spruce (`#0D7A5F`) for the view's single main action. |
| **Static Status Badges** | Badges like "Active Guardrail" or "FAIL-CLOSED PIPELINE" showed green regardless of contract connectivity. | Deleted all static assertion badges. Only dynamic on-chain reads produce status tags. |
| **All-Monospace Body Text** | Monospace text across paragraphs fatigued reading and destroyed visual hierarchy. | Switched to `Plus Jakarta Sans` for all UI text, headings, and body copy. Reserved `IBM Plex Mono` exclusively for hashes, IDs, and numeric tokens. |
| **Capitalized Tracked Micro-Labels** | `GATE 01 [PROOF]:`, `RECIPIENT:`, `AMOUNT:` felt like a template. | Clean sentence case: `Recipient`, `Amount`, `Deliverable CID`, `Proof`, `Policy`, `Council quorum`. |
