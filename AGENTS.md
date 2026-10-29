# ZiniPay Design System & Landing Page Rules

> Tailored from the `landing-page-design` system for ZiniPay's NEAR-aligned treasury governance interface.
> Applies to all frontend components in `frontend/src/` (Landing Page, Three-Way Gate, Dashboard `/app`, and Modals).

---

## 1. Strategy & Structure (Part A)

### Core Mandate
**One Offer • One Audience • One Primary Action**
- **Audience**: DAO councils, treasury managers, and technical contributors on NEAR Protocol (Sputnik DAO v2 / Trezu).
- **Offer**: A fail-closed, multi-agent evaluation layer that verifies GitHub PRs/IPFS CIDs, tests on-chain spend caps, and dispatches multi-sig proposals to Sputnik DAO with mathematical safety.
- **Primary CTA**: `Open Dashboard` (`/app`).
- **Secondary CTA**: `View Contracts & Code` (links directly to verified GitHub / Explorer). Never let secondary CTAs compete visually with the primary action.

### Banned Copy / Anti-Hype Filter
Never use generic web3 hype words:
❌ *revolutionize, seamless, effortless, supercharge, next-gen, game-changing, ultimate, unleash, leverage, robust, streamline*

Use concrete, verifiable mechanism copy:
- ✅ "Prevents agent runaway spending via Rust `PolicyHelper` spend caps and cooldowns."
- ✅ "Validates merged PR commit hash and IPFS CID uniqueness before proposal creation."
- ✅ "Requires 2-of-3 human council multi-sig quorum before any payout executes."

### Mandatory Page Flow
1. **Hero**: Outcome + Audience headline (`max-w-2xl`), technical subheadline, single primary CTA, live testnet proof signal, and the signature interactive `ReleaseReceiptCard`.
2. **Three-Way Release Gate**: Interactive/visual pipeline showing:
   - Gate 1: Deliverable Verification (GitHub PR / IPFS CID)
   - Gate 2: Policy & Spend Limits (Tier cap, cooldown, CID anti-replay)
   - Gate 3: Human Council Quorum (Sputnik DAO 2-of-3 multi-sig)
3. **Tagline Reveal (Scroll-triggered)**: 2+ lines stating the core governance thesis with word-by-word scroll reveal.
4. **Attacks That Fail**: Concrete attack vectors (Prompt Injection, Unbounded Drain, Replay Attack, Hallucinated Deliverable) and how ZiniPay's fail-closed architecture stops each.
5. **Verified Testnet Receipts**: Real transaction hashes, block explorer links, and Sputnik DAO proposal IDs.
6. **How It Works (3 Steps)**: Submit deliverable -> Multi-agent deliberation & policy check -> Human council approval.
7. **Objection-Handling FAQ**: Concrete answers on agent boundaries, council authority, and failure recovery.
8. **Final CTA**: Mirrors the hero primary CTA.

---

## 2. Visual System & Tokens (Part B)

### Typography
- **Primary Sans**: Inter, Geist Sans, or Plus Jakarta Sans.
- **Monospace**: Geist Mono, JetBrains Mono, or Space Mono for all tx hashes, account IDs (`*.testnet`), CIDs, and yoctoNEAR amounts.
- **Weight Limits**: Regular (400), Medium (500), Semibold (600), Bold (700). **No ultra-bold (800/900)**. **No italics**.
- **Max Widths**: Headline `max-w-2xl` (680px), body paragraphs `max-w-prose` (65ch). Use `text-balance` on headlines to avoid orphaned single words.
- **Scale**:
  - Micro / Meta: `text-xs` (12px, font-mono)
  - UI Labels / Controls: `text-sm` (14px)
  - Body Copy: `text-base` (16px)
  - Card Titles: `text-lg` (18px) to `text-xl` (20px)
  - Section Headings: `text-3xl` (30px) to `text-4xl` (36px)
  - Hero Headline: `text-4xl` (36px) to `text-5xl` (48px)

### Spacing & Layout
- Strictly adhere to 4px / 8px grid tokens:
  - Micro gaps: `gap-1.5` (6px), `gap-2` (8px), `gap-3` (12px)
  - Component padding: `p-3` (12px), `p-4` (16px), `p-6` (24px)
  - Section vertical spacing: `py-16` (mobile) to `py-24` (desktop). Never random spacing values.

### Concentric Corner Radii
Outer radius $R$, child padding $P$ $\rightarrow$ inner child radius $r = R - P$:
- Container: `rounded-xl` (12px) with `p-3` (12px) $\rightarrow$ inner item `rounded-md` (6px).
- Container: `rounded-2xl` (16px) with `p-4` (16px) $\rightarrow$ inner item `rounded-lg` (8px).

### Card Surfaces & Borders
- Canvas: Deep neutral dark (`#0A0A0C` or `var(--bg-canvas)`).
- Cards: Elevated neutral panel (`#12141A` / `#161922`), never pure gradient backgrounds.
- Borders: Full 1px border on all sides (`border border-white/[0.08]` or `border-[var(--border-subtle)]`). Never single-sided borders on cards.
- Accent: NEAR green (`#00EC97` / `var(--color-passed)`) used deliberately for verified/passed states, not splashed everywhere.

### Icons
- Use **Lucide React** consistently across the entire app.
- Icon sizing: strictly `size={16}` (inline/labels) or `size={20}` (section headers/action buttons). Stroke width: 1.75 - 2px.

### Motion & Transitions
- Standard transition ease: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy spring out), duration 200ms - 300ms.
- Tagline reveal section: words transition from 30% opacity to 100% opacity on scroll using `IntersectionObserver` or `requestAnimationFrame`. No raw unthrottled scroll listeners.

### Complete Interactive States
Every interactive element must define:
- Normal, `:hover`, `:active`, `:focus-visible` (with clear keyboard outline), `:disabled`.
- Dashboards and lists must implement complete **Loading**, **Empty** (with actionable trigger button), and **Error** states with clear human-readable messages.
