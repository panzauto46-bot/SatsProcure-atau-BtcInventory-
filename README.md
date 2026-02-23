<p align="center">
  <img src="https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin" />
  <img src="https://img.shields.io/badge/Midl-8B5CF6?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Midl" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/sats--connect-4.2-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="sats-connect" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">SatsProcure</h1>

<p align="center">
  <strong>Decentralized B2B Procurement & Settlement on Bitcoin — Powered by Midl</strong>
</p>

<p align="center">
  Manage inter-business procurement invoices with <strong>Solidity smart contracts on Bitcoin</strong>.<br/>
  Powered by <strong>Midl SDK</strong>, <strong>Xverse Wallet</strong> & <strong>sats-connect</strong>.
</p>

<p align="center">
  <a href="https://sats-procure.vercel.app">Live Demo</a> &bull;
  <a href="#-getting-started">Getting Started</a> &bull;
  <a href="#-project-structure">Project Structure</a> &bull;
  <a href="#-how-it-works">How It Works</a>
</p>

---

## Overview

SatsProcure is a modern web application that enables businesses to create, manage, and settle procurement invoices using **Solidity smart contracts deployed on Midl** — Bitcoin's EVM execution layer. Built with React, TypeScript, and the **Midl JS SDK**, it connects to the Bitcoin network through Xverse wallet and executes on-chain transactions via Midl's infrastructure.

### Why SatsProcure?

| Problem | Solution |
|---------|----------|
| Cross-border B2B payments are slow and expensive | Direct Bitcoin transfers settle in minutes via Midl |
| Traditional invoicing relies on centralized platforms | On-chain invoice management via Solidity smart contracts |
| Payment verification requires trust | Every payment is a verifiable on-chain transaction on Midl |
| Complex multi-step settlement | Simple flow: Create Invoice → Pay with BTC → Confirm Receipt |

---

## Key Features

### Dual Role System
- **Supplier Dashboard** — Create invoices, set item details & pricing (in sats), track payment status
- **Buyer Dashboard** — View incoming invoices, pay with real BTC, confirm goods receipt

### Solidity Smart Contract on Midl
- **SatsProcure.sol** — Deployed on Midl Regtest (Bitcoin EVM Layer)
- **On-Chain Invoice Lifecycle** — `createInvoice()` → `payInvoice()` → `confirmReceipt()`
- **Midl SDK Integration** — `@midl/executor` + `@midl/executor-react` for contract execution
- **Xverse Connector** — `@midl/connectors` with `xverseConnector()` for Bitcoin wallet signing
- **Blockscout Verification** — All transactions verifiable on [blockscout.regtest.midl.xyz](https://blockscout.regtest.midl.xyz)

### Native Bitcoin Payments
- **Real BTC Transfers** — Every payment is a genuine Bitcoin transaction broadcast to the network
- **sats-connect Integration** — Uses `Wallet.request('sendTransfer', ...)` for native BTC transfers
- **Xverse Wallet** — Browser extension wallet for signing and broadcasting transactions
- **On-Chain Verification** — Transaction hashes link directly to Midl Blockscout explorer

### Escrow & Partial Payments
- **Partial Payments (Installments)** — Buyers can pay invoices in multiple installments with a visual progress bar tracking completion
- **Escrow Status Tracking** — Invoice lifecycle: `Pending` → `Partial` → `Escrowed` → `Paid`
- **Confirm Receipt** — Buyer confirms goods received, releasing escrow and marking invoice as settled

### Premium UI/UX
- **Dark Theme** — Professional dark interface with amber/violet accent colors
- **Responsive Design** — Fully responsive from mobile to desktop
- **Real-Time Notifications** — Toast notifications for wallet events, payments, and errors
- **Transaction Overlay** — Premium overlay animation during payment processing
- **Bilingual (EN/ID)** — Full English and Bahasa Indonesia localization

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------| 
| **Frontend** | React 19 + TypeScript 5.9 | UI components and type safety |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Build** | Vite 7 | Fast development and optimized builds |
| **Smart Contract** | Solidity ^0.8.28 | On-chain invoice management |
| **Execution Layer** | Midl SDK (`@midl/executor`) | Bitcoin EVM execution via Midl |
| **React Hooks** | `@midl/executor-react` | React integration for contract calls |
| **Wallet Connector** | `@midl/connectors` | Xverse wallet connection via Midl |
| **Core** | `@midl/core` | Midl network configuration |
| **React Provider** | `@midl/react` | Midl React context provider |
| **Wallet** | sats-connect 4.2 + Xverse | Bitcoin wallet signing & broadcasting |
| **EVM Tools** | viem (`@midl/viem`) + wagmi | EVM transaction encoding & state |
| **Network** | Midl Regtest | Bitcoin EVM test network |
| **Explorer** | Blockscout | On-chain transaction verification |
| **Icons** | Lucide React | Consistent icon library |
| **State** | React Context | Centralized app state management |
| **i18n** | Custom LanguageContext | English & Indonesian translations |
| **IDs** | uuid v13 | Unique invoice identifiers |
| **Hosting** | Vercel | Production deployment |

---

## Project Structure

```
SatsProcure/
├── contracts/
│   └── SatsProcure.sol          # Solidity smart contract (Midl EVM)
│
├── src/
│   ├── components/              # React UI Components
│   │   ├── Navbar.tsx           # Top navigation bar with wallet connect
│   │   ├── RoleSelector.tsx     # Supplier/Buyer role selection screen
│   │   ├── Dashboard.tsx        # Main dashboard with stats, filters, table
│   │   ├── StatsCards.tsx       # Invoice statistics cards
│   │   ├── InvoiceTable.tsx     # Invoice list with expandable rows
│   │   ├── CreateInvoiceModal.tsx   # Modal for creating new invoices
│   │   ├── InvoiceDetailModal.tsx   # Modal for viewing invoice details
│   │   ├── PayConfirmModal.tsx      # Payment confirmation with execution path
│   │   ├── Notifications.tsx        # Toast notification system
│   │   └── TransactionOverlay.tsx   # Premium overlay during transactions
│   │
│   ├── context/
│   │   └── AppContext.tsx       # Central state: wallet, invoices, Midl contract
│   │
│   ├── lib/
│   │   ├── midlConfig.ts       # Midl SDK configuration (regtest + xverse)
│   │   ├── midlService.ts      # Smart contract call encoding (viem)
│   │   ├── contract.ts         # SatsProcure contract ABI & address
│   │   └── xverse.ts           # Xverse wallet SDK wrapper (sats-connect)
│   │
│   ├── i18n/
│   │   ├── LanguageContext.tsx  # Language provider & hook
│   │   └── translations.ts     # EN + ID translation strings
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Invoice, Wallet, etc.)
│   │
│   ├── utils/
│   │   └── cn.ts               # Tailwind class merge utility
│   │
│   ├── App.tsx                  # Root app with MidlProvider + WagmiMidlProvider
│   ├── main.tsx                 # Vite entry point
│   └── index.css                # Global Tailwind styles
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts (Midl SDK packages)
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── START_APP.bat                # Windows quick-start script
└── LICENSE                      # MIT License
```

---

## How It Works

### Architecture: Midl Smart Contract on Bitcoin

```
┌─────────────────────────────────────────────────────────────┐
│             SatsProcure — Midl Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FRONTEND (React + TypeScript)                           │
│     ├── User Action (Create Invoice / Pay / Confirm)        │
│     └── Encodes Solidity function call via viem             │
│                                                             │
│  2. MIDL SDK (@midl/executor)                               │
│     ├── addTxIntention() → Queue EVM transaction            │
│     ├── finalizeBTCTransaction() → Calculate BTC costs      │
│     ├── signIntention() → Xverse wallet signs               │
│     └── broadcastTransaction() → Send to Midl network       │
│                                                             │
│  3. MIDL REGTEST (Bitcoin EVM Layer)                        │
│     ├── Smart Contract: SatsProcure.sol                     │
│     │   ├── createInvoice(id, buyer, amount, number)        │
│     │   ├── payInvoice(id, amount)                          │
│     │   ├── confirmReceipt(id)                              │
│     │   └── cancelInvoice(id)                               │
│     └── Events emitted → Indexed on Blockscout              │
│                                                             │
│  4. ON-CHAIN VERIFICATION                                   │
│     └── TX Hash → blockscout.regtest.midl.xyz/tx/{hash}    │
│                                                             │
│  Network:  Midl Regtest (Bitcoin EVM)                       │
│  Wallet:   Xverse (sats-connect + @midl/connectors)        │
│  Contract: SatsProcure.sol (Solidity ^0.8.28)              │
└─────────────────────────────────────────────────────────────┘
```

### Invoice Lifecycle (On-Chain)

```
  ┌─────────┐    Pay Partial    ┌─────────┐    Pay Remaining   ┌──────────┐    Confirm Receipt   ┌──────┐
  │ PENDING │ ────────────────► │ PARTIAL │ ──────────────────► │ ESCROWED │ ───────────────────► │ PAID │
  └─────────┘                   └─────────┘                     └──────────┘                      └──────┘
       │                             │
       │         Pay Full            │         Pay Full
       └─────────────────────────────┴──────────────────────────► ESCROWED ──► PAID
```

### Smart Contract Functions (`contracts/SatsProcure.sol`)

| Function | Description |
|----------|-------------|
| `createInvoice(id, buyer, amount, number)` | Creates a new invoice on-chain |
| `payInvoice(id, amount)` | Records payment (supports partial) |
| `confirmReceipt(id)` | Buyer confirms receipt, releases escrow |
| `cancelInvoice(id)` | Supplier cancels pending invoice |
| `getInvoice(id)` | Read invoice details from chain |
| `getInvoiceCount()` | Total invoices created |

### Midl SDK Integration (`src/lib/`)

| Module | Description |
|--------|-------------|
| `midlConfig.ts` | Midl SDK config with regtest network + xverse connector |
| `midlService.ts` | Encodes Solidity function calls via `encodeFunctionData()` |
| `contract.ts` | SatsProcure contract ABI and deployment address |
| `xverse.ts` | Xverse wallet wrapper (connect, balance, transfer, disconnect) |

---

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------| 
| **Node.js** | v18+ | Runtime environment |
| **Xverse Wallet** | Latest | Bitcoin wallet browser extension |
| **Midl Regtest BTC** | Any amount | Test currency for gas fees |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/panzauto46-bot/SatsProcure-atau-BtcInventory-.git
cd SatsProcure-atau-BtcInventory-

# 2. Install dependencies (includes Midl SDK)
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Windows users:** You can also double-click `START_APP.bat` to auto-install and launch.

### Get Regtest BTC (for Midl)

You need regtest BTC in your Xverse wallet to interact with Midl contracts:

1. Open Xverse Wallet → Switch to **Regtest** network
2. Copy your **Native SegWit address** (starts with `bcrt1...`)
3. Visit the Midl faucet: [faucet.midl.xyz](https://faucet.midl.xyz)
4. Paste your address and request regtest BTC
5. Wait for confirmation

---

## Usage Guide

### Step 1: Connect Wallet
Click **"Connect Xverse"** in the top navigation bar. Xverse wallet will prompt you to approve the connection to Midl Regtest.

### Step 2: Choose Role
- **Supplier** — You issue invoices and receive payments
- **Buyer** — You view and pay invoices

### Step 3: Create Invoice (as Supplier)
1. Click **"Create Invoice"**
2. Fill in buyer name, buyer's BTC address, due date
3. Add line items with quantities and prices (in sats)
4. Submit — invoice is deployed to the Midl smart contract

### Step 4: Pay Invoice (as Buyer)
1. Find the invoice in the table → Click **"Pay"**
2. Review the payment confirmation modal (amount, Midl execution path)
3. Click **"Pay Now"** → Xverse wallet prompts to sign the transaction
4. Confirm in Xverse → BTC is sent + recorded on Midl smart contract
5. Supports **partial payments** — pay in installments!

### Step 5: Confirm Receipt (as Buyer)
1. After receiving goods, click **"Confirm Receipt"** on the escrowed invoice
2. Smart contract marks invoice as settled → verified on Blockscout

---

## Midl VibeHack Submission

### Hackathon Requirements Checklist

| Requirement | Status | Implementation |
|---|---|---|
| ✅ Proper front-end design | **PASS** | Premium dark UI, responsive, bilingual |
| ✅ Xverse wallet connection | **PASS** | `@midl/connectors` + `sats-connect` |
| ✅ User triggers action in UI | **PASS** | Create, Pay, Confirm Receipt |
| ✅ Action hits Midl RPC/SDK → executes Solidity contract | **PASS** | `@midl/executor` + `SatsProcure.sol` |
| ✅ Tx appears on-chain with hash | **PASS** | Blockscout verification |
| ✅ UI updates to reflect new state | **PASS** | Real-time status updates |

### Deliverables
- [x] Video showing the full flow
- [x] Transaction proof (contract + tx links on Blockscout)
- [x] Code repo (this repository)
- [x] Public X post

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `localhost:5173` |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## Roadmap

### Phase 1: Foundation ✅
- [x] Xverse Wallet Integration (sats-connect)
- [x] Invoice CRUD (Create, Read, Update, Delete)
- [x] Dual Role System (Supplier & Buyer dashboards)
- [x] Premium Dark UI with Tailwind CSS
- [x] Bilingual Support (English / Bahasa Indonesia)
- [x] Vercel Deployment

### Phase 2: Midl Integration ✅ *(Current — VibeHack)*
- [x] **Midl SDK Integration** — `@midl/executor`, `@midl/core`, `@midl/react`
- [x] **Solidity Smart Contract** — `SatsProcure.sol` deployed on Midl Regtest
- [x] **Xverse via Midl** — `@midl/connectors` with `xverseConnector()`
- [x] **On-Chain Invoice Management** — createInvoice, payInvoice, confirmReceipt
- [x] **Blockscout Integration** — TX hash links to block explorer
- [x] **viem + wagmi** — EVM transaction encoding with `@midl/viem`

### Phase 3: Full On-Chain Escrow (Next)
- [ ] **Full Executor Flow** — `addTxIntention` → `finalizeBTC` → `signIntention` → `broadcast`
- [ ] **Multi-signature Escrow** — 2-of-3 multisig via Midl smart contract
- [ ] **PSBT Integration** — Partially Signed Bitcoin Transactions via Midl
- [ ] **Invoice Persistence** — Read invoices from on-chain contract state

### Phase 4: Scaling & Beyond
- [ ] **Lightning Network** — Instant micro-payment settlement
- [ ] **Mobile App** — React Native with Xverse mobile SDK
- [ ] **Mainnet Launch** — Production deployment on Midl mainnet

---

## Live Demo

**[sats-procure.vercel.app](https://sats-procure.vercel.app)**

> Requires Xverse wallet browser extension with Midl Regtest enabled.

---

## License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>SatsProcure</strong> — Empowering B2B Commerce on Bitcoin.<br/>
  <sub>Built with Midl SDK, Solidity Smart Contracts, and Xverse Wallet. No bridges. Pure Bitcoin EVM.</sub>
</p>
