# SatsProcure

Decentralized B2B procurement and settlement on Bitcoin, powered by Midl.

SatsProcure lets suppliers create invoices and buyers settle them on-chain through a Solidity contract on Midl Regtest. Wallet connection and transaction signing are handled with Xverse.

Live demo: https://sats-procure.vercel.app

## What Is Implemented

- Xverse wallet connection through Midl connector.
- Real Midl executor flow in app:
  - `addTxIntention`
  - `finalizeBTCTransaction`
  - `signIntentions`
  - `sendBTCTransactions`
- Solidity invoice lifecycle:
  - `createInvoice`
  - `payInvoice` (partial and full)
  - `confirmReceipt`
  - `cancelInvoice`
- On-chain transaction proof via Blockscout tx hash links.
- UI state updates after each on-chain action.
- Supplier and buyer role flow.
- Responsive dark UI and EN/ID localization.

## Hackathon Requirement Mapping (Midl VibeHack)

- Proper front-end design: done.
- Xverse wallet connection: done.
- User action from UI: done.
- Action hits Midl RPC/SDK and executes Solidity contract: done.
- Transaction appears on-chain with hash: done.
- UI updates with new state: done.

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS
- Solidity `^0.8.28`
- `@midl/core`, `@midl/react`, `@midl/connectors`
- `@midl/executor`, `@midl/executor-react`
- `sats-connect`
- `viem` (via `@midl/viem`) + `wagmi`

## Smart Contract Notes

Contract file: `contracts/SatsProcure.sol`

- Buyer authorization enforced:
  - `payInvoice`: only invoice buyer can pay.
  - `confirmReceipt`: only invoice buyer can confirm.
- Status flow: `Pending -> Partial -> Escrowed -> Paid`.

## Environment Variables

Create `.env` in project root:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_BLOCKSCOUT_URL=https://blockscout.regtest.midl.xyz
VITE_MEMPOOL_URL=https://mempool.regtest.midl.xyz
```

Notes:
- `VITE_CONTRACT_ADDRESS` is required for real on-chain calls.
- If contract address is missing or invalid, app falls back to zero address and write calls will fail safely.

## Getting Started

Requirements:
- Node.js 18+
- Xverse wallet extension
- Midl Regtest BTC for gas/tx fees

Install and run:

```bash
git clone https://github.com/panzauto46-bot/SatsProcure-atau-BtcInventory-.git
cd "SatsProcure (atau BtcInventory)"
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Usage Flow

1. Connect Xverse wallet on Regtest.
2. Choose role (Supplier or Buyer).
3. Supplier creates invoice:
   - Buyer name
   - Buyer EVM address (`0x...`) for smart contract buyer field
   - Items, quantity, due date
4. Buyer pays invoice (full or partial).
5. Buyer confirms receipt when status is `Escrowed`.
6. Verify tx hash on Blockscout.

## Project Structure

```text
contracts/
  SatsProcure.sol
src/
  components/
  context/AppContext.tsx
  lib/contract.ts
  lib/midlConfig.ts
  lib/midlService.ts
  lib/xverse.ts
```

## Current Limitation

- `loadInvoicesFromChain` is still a placeholder (`TODO`), so invoice list is currently session/local state driven in UI.

## License

MIT. See `LICENSE`.
