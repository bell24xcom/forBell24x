# Blockchain Recovery & Extraction Report

**Compiled:** 2026-08-03. Scope: every blockchain-related artifact across the current repository, the old `digitex-erp/bell24h` repository, its `feature/blockchain-integration` branch, and related documentation. Report-only — no code changed, nothing migrated.

Tags: **VERIFIED / INFERRED / UNKNOWN**.

---

## 1. Complete Artifact Inventory

| Artifact | Location | Repository | Purpose | Status |
|---|---|---|---|---|
| `contracts/BellEscrow.sol` | current repo root | current + old (identical, confirmed prior pass) | Milestone-based escrow: `ReentrancyGuard`+`Ownable`+`Pausable` (OpenZeppelin), events for `EscrowCreated`/`MilestoneCompleted`/`MilestoneReleased`/`EscrowDisputed`/`EscrowResolved`. Real, competent Solidity — not a stub. | **VERIFIED**, dormant |
| `contracts/BellToken.sol` | current repo root | current + old | `ERC20`+`ERC20Burnable`+`ERC20Pausable`+`Ownable`+`ReentrancyGuard` (OpenZeppelin). Staking (`TokensStaked`/`TokensUnstaked`), liquidity mining events defined. Real, competent Solidity. | **VERIFIED**, dormant |
| `contracts/Escrow.sol` | current repo root | current | A second, simpler escrow contract, distinct from `BellEscrow.sol` — has a compiled artifact (`artifacts/contracts/Escrow.sol/Escrow.json`) referenced by `blockchainDeployment.ts` | **VERIFIED**, dormant |
| `_archive/bell24h-main/contracts_backup/TradeEscrow.sol` | current repo, archived | current (archived copy) | A **third**, separately-named escrow contract variant, sitting in a folder literally named `contracts_backup` | **VERIFIED** exists; content not diffed against the other two this pass — **UNKNOWN** how it differs |
| `hardhat.config.js` / `hardhat.config.cjs` | current repo root | current + old | Build/network configuration | **VERIFIED** — see §2 for the precise network mismatch found |
| `scripts/deploy-escrow.cjs` | current repo, also archived | current + old | Deployment script for `BellEscrow` | **VERIFIED**, targets **Sepolia** (an Ethereum L1 testnet), reads `PRIVATE_KEY`/`SEPOLIA_RPC_URL`/`ESCROW_PLATFORM_FEE` from env |
| `src/lib/services/escrowService.ts` | current repo | current | A TypeScript class explicitly commented "Mock smart contract integration (production would use actual blockchain)" | **VERIFIED**, zero importers anywhere in `src/app`/`src/components` — dead code |
| `src/lib/services/blockchainDeployment.ts` | current repo | current | A real, well-structured deployment utility — imports `ethers`, loads the compiled `Escrow.json` artifact, defines `DeploymentConfig`/`DeploymentResult` interfaces | **VERIFIED**, zero importers anywhere in `src/app` — dead code, confirmed this pass |
| `n8n/workflows/escrow.workflow.json` | current repo root, also archived | current + old | n8n automation: webhook → email seller ("Escrow Released") → POST to `http://analytics.bell24h.com/log` | **VERIFIED** exists; **UNKNOWN** whether it was ever activated in a live n8n instance |
| `BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md` | current repo root, also old repo | both | The vision document: Polygon mainnet (chainId 137), BELL token economics, ₹156cr/369-day revenue projection, subscription tiers gated by blockchain features | **VERIFIED** |
| `BELL24H_BLOCKCHAIN_IMPLEMENTATION_COMPLETE.md` | current repo root, also old repo | both | A completion-announcement document, not independently re-read in full this pass — cross-referenced from Pass 2A | **VERIFIED exists**; content **NOT independently re-verified** this pass |
| `BELL24H_BLOCKCHAIN_DEPLOYMENT_GUIDE.md` | current repo root, also old repo | both | A deployment how-to document, not independently re-read in full this pass | **VERIFIED exists**; content **NOT independently re-verified** this pass |
| `feature/blockchain-integration` branch (old repo) | old repo, remote | old | 391 unique commits vs. `main`. **Merged into old-repo `main` via PR #12, 2025-10-19** (confirmed via `gh pr list` in the prior recovery pass) | **VERIFIED**, merged — corrects this recovery project's own earlier assumption that it was left unmerged |
| `package.json` scripts: `compile`, `test`, `deploy:polygon`, `deploy:mumbai`, `verify:polygon`, `verify:mumbai`, `coverage`, `gas-report` | current repo root | current | Hardhat task wrappers | **VERIFIED**, and **broken as written** — see §2 |
| `ethers@5.7.2`, `@openzeppelin/contracts@4.9.3`, `@nomicfoundation/hardhat-toolbox`, `@nomicfoundation/hardhat-verify` | `package.json` dependencies | current | Real, still-installed blockchain tooling dependencies | **VERIFIED** present in `package.json` |

## 2. A precise, newly-confirmed contradiction: the deploy scripts don't even match the network config

- `BELL24H_BLOCKCHAIN_IMPLEMENTATION_PLAN.md` specifies **Polygon mainnet, chainId 137**.
- `hardhat.config.cjs`'s actual `networks` block defines only **`sepolia`** (chainId 11155111) and **`mumbai`** (Polygon's testnet, chainId 80001) — **no mainnet network is configured at all**, Polygon or otherwise.
- `package.json`'s own scripts reference network names `polygon` and `polygonMumbai` (`hardhat run scripts/deploy.js --network polygon`, `--network polygonMumbai`) — **neither of these names exists in `hardhat.config.cjs`**, which only defines `sepolia`, `mumbai`, `localhost`, and `hardhat`. Running `npm run deploy:polygon` or `npm run deploy:mumbai` as written today would fail immediately with a Hardhat "network not found" error.
- `scripts/deploy-escrow.cjs` (a separate script from the `deploy.js` the package.json scripts reference) targets Sepolia specifically.

**Confidence: VERIFIED, directly read.** This isn't one contradiction, it's three layers of the same drift — the vision document, the actual network config, and the npm script wrappers all disagree with each other. **No evidence found anywhere that any contract was ever actually deployed to any network** — no deployment address, transaction hash, or verified-contract link exists in any document or code file read across this entire recovery project.

## 3. Dependency Graph — Blockchain vs. Wallet / Escrow / Ledger / Payments

```
BellEscrow.sol ─┐
BellToken.sol ──┤
Escrow.sol ─────┤── compiled via hardhat.config.cjs ── deploy-escrow.cjs (targets Sepolia)
                │                                        │
                │                                        └── NO EVIDENCE of successful deployment to any network
                │
                ├── escrowService.ts (mock wrapper) ─── ZERO importers ─── does not reach any live route
                ├── blockchainDeployment.ts (real deploy utility) ─── ZERO importers ─── does not reach any live route
                └── n8n/escrow.workflow.json (notification only) ─── UNKNOWN if ever activated ─── would fire on a release
                     event that nothing currently produces, since no contract is live

                                    ╔══════════════════════════════════════╗
                                    ║   THE ACTUAL LIVE PRODUCTION PATH    ║
                                    ╚══════════════════════════════════════╝
Deal.status transitions (src/app/api/dashboard/deals/route.ts)
        │
        ├── 'pay_wallet' action → WalletTransaction(type: ESCROW_LOCK) → Deal.status = ESCROW_LOCKED
        │       (Prisma-native, no blockchain involved anywhere in this path)
        │
        └── 'complete' action → WalletTransaction(type: ESCROW_RELEASE), Wallet.balance credited
                (Prisma-native, no blockchain involved anywhere in this path)

Ledger = WalletTransaction rows in Neon Postgres via Prisma. No on-chain ledger exists or is read from anywhere.
Payments (Razorpay) = deposit transactions only, feeding the Wallet.balance field directly. No blockchain intersection.
```

**Reading the graph:** the blockchain column and the live-production column do not intersect anywhere. Every blockchain artifact is a dead end — compiled but undeployed contracts, deployment tooling with zero callers, a notification workflow with no event source to listen to. The entire real escrow/wallet/ledger/payments system that's actually live today was built independently of all of it, using Prisma and Razorpay exclusively.

## 4. Per-Artifact Disposition

| Artifact | Reusable? | Bell24h-OS or VyaparSethu ownership | Keep / Remove / Rewrite / Superseded |
|---|---|---|---|
| `BellEscrow.sol` | **Yes, technically** — real OpenZeppelin-based code, would need a security audit and gas-cost review before any real deployment, but isn't broken code | If ever revived: **Bell24h-OS** (blockchain infrastructure is exactly the kind of shared, reusable service layer the target architecture below describes) | **Keep, dormant** — no reason to delete working Solidity, but don't treat it as ready-to-deploy without a fresh audit |
| `BellToken.sol` | **Yes, technically**, same caveats | **Bell24h-OS**, if the token-economics direction is ever revisited | **Keep, dormant** |
| `Escrow.sol` | Overlaps with `BellEscrow.sol` — **two escrow contracts is redundant**, not clearly differentiated in scope from what was read this pass | **Bell24h-OS**, if kept at all | **Superseded by `BellEscrow.sol`, or rewrite to clarify which is canonical** — having both without a clear reason is a code-hygiene problem regardless of blockchain status |
| `_archive/.../TradeEscrow.sol` | **Unconfirmed** — not diffed against the other two this pass | N/A — archived | **Superseded** (archived location itself signals this) |
| `escrowService.ts` | **No** — explicitly a mock, and dead code | N/A | **Remove**, or clearly re-label as a test fixture if kept for any reason |
| `blockchainDeployment.ts` | **Yes, as tooling** — it's real, working deployment code, just unused | **Bell24h-OS**, if blockchain deployment is ever operationalized | **Keep, dormant**, but fix the network-naming mismatch (§2) before ever relying on it |
| `n8n/escrow.workflow.json` | **Partially** — the webhook→email pattern is reusable, but it was designed for a blockchain release event that doesn't exist | **VyaparSethu**, if adapted to fire on the real Prisma `ESCROW_RELEASE` event instead | **Rewrite** — the pattern (notify seller on release) is worth keeping; the trigger source needs to change entirely |
| `hardhat.config.cjs` | **Yes**, but broken as documented | **Bell24h-OS** | **Rewrite** — fix the network-name mismatch with `package.json`'s scripts before this is trustworthy |
| Vision/planning docs (`BELL24H_BLOCKCHAIN_*`) | N/A | N/A | **Keep as historical record only** — already explicitly deprioritized in `docs/VYAPARSETHU_VISION.md` |

## 5. Proposed Target Architecture (proposal only — nothing below is implemented or migrated)

**Principle, as directed:** Bell24h-OS owns all reusable blockchain infrastructure; VyaparSethu owns only marketplace transaction workflows and consumes Bell24h-OS blockchain services if and when they're needed.

```
┌─────────────────────────────────────────────────────────────┐
│                        Bell24h-OS                            │
│  (would own, if this direction is ever revived)               │
│                                                                │
│   BellEscrow.sol / BellToken.sol   ── audited, redeployed     │
│   blockchainDeployment.ts (fixed network naming)               │
│   hardhat.config.cjs (fixed network naming)                    │
│   A defined "Blockchain Service" API surface                   │
│   (e.g. createEscrow(), releaseMilestone(), getEscrowState())   │
│         │                                                       │
│         │  Bell24h-OS exposes this as an internal service —     │
│         │  VyaparSethu never talks to a contract directly.      │
│         ▼                                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          │  (service boundary — does not exist today,
                          │   proposed only)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       VyaparSethu                             │
│  (owns today, unchanged)                                       │
│                                                                │
│   Deal lifecycle (src/app/api/dashboard/deals/route.ts)         │
│   Wallet / WalletTransaction (Prisma, Neon)                     │
│   Razorpay deposit integration                                 │
│   RFQ / Quote / Deal marketplace workflows                     │
│                                                                │
│   If/when Bell24h-OS blockchain services are revived,          │
│   VyaparSethu would call the Bell24h-OS service boundary        │
│   from within the existing 'pay_wallet'/'complete' Deal          │
│   actions, rather than reimplementing blockchain logic locally. │
└─────────────────────────────────────────────────────────────┘
```

**Why this split, specifically:** the current dormant blockchain code is already, functionally, "infrastructure that VyaparSethu doesn't touch" — it just doesn't have a formal home or API boundary. Assigning it to Bell24h-OS doesn't require moving any files today; it requires (in a future implementation pass, not this one) defining a small service interface so that VyaparSethu's Deal-lifecycle code could call `Bell24hOS.escrow.release(dealId)` instead of writing `WalletTransaction` rows directly — while Bell24h-OS decides internally whether that call is served by the Prisma simulation (as today) or a real contract (if ever revived), without VyaparSethu's code needing to know or care which.

**What this proposal does NOT require:** deleting the current wallet-simulation escrow (it keeps working exactly as-is, just conceptually "behind" the future service boundary), deploying any contract, or making any decision today about whether blockchain is ever actually revived. It's a shape for *if* that decision is made later, not a recommendation to make it now.

## 6. Confidence Assessment

Highest confidence: the artifact inventory (§1), the network-mismatch finding (§2), and the dependency graph (§3) — all directly read this pass or confirmed in the immediately prior recovery pass via `gh pr list`. Medium confidence: the exact differentiation between `BellEscrow.sol`, `Escrow.sol`, and the archived `TradeEscrow.sol` — not diffed line-by-line this pass, so their precise relationship (three drafts of the same idea vs. genuinely different designs) is **UNKNOWN**. The target architecture in §5 is a proposal, not a finding, and is labeled as such.

No code implemented. No migration performed. Stopping here per the brief.
