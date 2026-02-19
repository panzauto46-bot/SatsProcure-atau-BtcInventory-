<p align="center">
  <img src="https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/sats--connect-4.2-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="sats-connect" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">SatsProcure</h1>

<p align="center">
  <strong>Decentralized B2B Procurement & Settlement on Bitcoin</strong>
</p>

<p align="center">
  Manage inter-business procurement invoices with <strong>native Bitcoin payments</strong>.<br/>
  Transparent, secure, and peer-to-peer — powered by <strong>Xverse Wallet</strong> &amp; <strong>sats-connect</strong>.
</p>

<p align="center">
  <a href="https://sats-procure.vercel.app">Live Demo</a> &bull;
  <a href="#-getting-started">Getting Started</a> &bull;
  <a href="#-project-structure">Project Structure</a> &bull;
  <a href="#-how-it-works">How It Works</a>
</p>

---

## Overview

SatsProcure is a modern web application that enables businesses to create, manage, and settle procurement invoices using **real Bitcoin transactions** on the Bitcoin Testnet. Built entirely with React and TypeScript, it connects directly to the Bitcoin network through the Xverse wallet — no EVM, no smart contracts, no intermediaries.

### Why SatsProcure?

| Problem | Solution |
|---------|----------|
| Cross-border B2B payments are slow and expensive | Direct Bitcoin transfers settle in minutes |
| Traditional invoicing relies on centralized platforms | Peer-to-peer invoice management, no middleman |
| Payment verification requires trust | Every payment is a real Bitcoin transaction, publicly verifiable on-chain |
| Complex multi-step settlement | Simple flow: Create Invoice → Pay with BTC → Confirm Receipt |

---

## Key Features

### Dual Role System
- **Supplier Dashboard** — Create invoices, set item details & pricing (in sats), track payment status
- **Buyer Dashboard** — View incoming invoices, pay with real BTC, confirm goods receipt

### Native Bitcoin Payments
- **Real BTC Transfers** — Every payment is a genuine Bitcoin transaction broadcast to the network
- **sats-connect Integration** — Uses `Wallet.request('sendTransfer', ...)` for native BTC transfers
- **Xverse Wallet** — Browser extension wallet for signing and broadcasting transactions
- **On-Chain Verification** — Transaction hashes link directly to the Bitcoin blockchain

### Escrow & Partial Payments
- **Partial Payments (Installments)** — Buyers can pay invoices in multiple installments with a visual progress bar tracking completion
- **Escrow Status Tracking** — Invoice lifecycle: `Pending` → `Partial` → `Escrowed` → `Paid`
- **Confirm Receipt** — Buyer confirms goods received, releasing escrow and marking invoice as settled

### Premium UI/UX
- **Dark Theme** — Professional dark interface with amber/orange accent colors
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
| **Wallet** | sats-connect 4.2 | Bitcoin wallet connection protocol |
| **Wallet App** | Xverse | Browser extension for Bitcoin signing |
| **Network** | Bitcoin Testnet | Real Bitcoin test network |
| **Icons** | Lucide React | Consistent icon library |
| **State** | React Context | Centralized app state management |
| **i18n** | Custom LanguageContext | English & Indonesian translations |
| **IDs** | uuid v13 | Unique invoice identifiers |
| **Hosting** | Vercel | Production deployment |

---

## Project Structure

```
SatsProcure/
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
│   │   └── AppContext.tsx       # Central state: wallet, invoices, payments
│   │
│   ├── lib/
│   │   └── xverse.ts           # Xverse wallet SDK wrapper (sats-connect)
│   │                            #   ├── connectXverse()
│   │                            #   ├── getXverseBalance()
│   │                            #   ├── sendXverseTransfer()
│   │                            #   └── disconnectXverse()
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
│   ├── App.tsx                  # Root app component with providers
│   ├── main.tsx                 # Vite entry point
│   └── index.css                # Global Tailwind styles
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── START_APP.bat                # Windows quick-start script
└── LICENSE                      # MIT License
```

---

## How It Works

### Payment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SatsProcure Payment Flow                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SUPPLIER creates invoice (off-chain)                    │
│     └── Invoice stored in app with buyer's BTC address      │
│                                                             │
│  2. BUYER pays invoice (on-chain BTC transfer)              │
│     ├── App calls: sats-connect → sendTransfer()            │
│     ├── Xverse wallet signs & broadcasts transaction        │
│     └── Real tBTC sent: Buyer wallet → Supplier wallet      │
│                                                             │
│  3. BUYER confirms receipt of goods                         │
│     └── Invoice status updated to PAID (settlement done)    │
│                                                             │
│  Network:  Bitcoin Testnet                                  │
│  Wallet:   Xverse (sats-connect v4)                         │
│  Method:   Native BTC transfer (P2WPKH / P2TR)             │
└─────────────────────────────────────────────────────────────┘
```

### Invoice Lifecycle

```
  ┌─────────┐    Pay Partial    ┌─────────┐    Pay Remaining   ┌──────────┐    Confirm Receipt   ┌──────┐
  │ PENDING │ ────────────────► │ PARTIAL │ ──────────────────► │ ESCROWED │ ───────────────────► │ PAID │
  └─────────┘                   └─────────┘                     └──────────┘                      └──────┘
       │                             │
       │         Pay Full            │         Pay Full
       └─────────────────────────────┴──────────────────────────► ESCROWED ──► PAID
```

### Core Functions (`src/lib/xverse.ts`)

| Function | Description |
|----------|-------------|
| `connectXverse()` | Connects to Xverse wallet, returns payment address & public key |
| `getXverseBalance()` | Fetches confirmed + unconfirmed BTC balance in sats |
| `sendXverseTransfer(address, sats)` | Sends BTC to recipient via Xverse wallet signing |
| `disconnectXverse()` | Cleanly disconnects the wallet session |

---

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | Runtime environment |
| **Xverse Wallet** | Latest | Bitcoin wallet browser extension |
| **Bitcoin Testnet BTC** | Any amount | Test currency for payments |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/panzauto46-bot/SatsProcure-atau-BtcInventory-.git
cd SatsProcure-atau-BtcInventory-

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Windows users:** You can also double-click `START_APP.bat` to auto-install and launch.

### Get Testnet BTC

You need testnet BTC (tBTC) in your Xverse wallet to test payments:

1. Open Xverse Wallet → Switch to **Testnet** network
2. Copy your **Native SegWit address** (starts with `tb1...`)
3. Visit a Bitcoin Testnet faucet:
   - [coinfaucet.eu/btc-testnet](https://coinfaucet.eu/en/btc-testnet/)
   - [bitcoinfaucet.uo1.net](https://bitcoinfaucet.uo1.net/send.php)
4. Paste your address and request tBTC
5. Wait ~10-30 minutes for confirmation

---

## Usage Guide

### Step 1: Connect Wallet
Click **"Connect Xverse"** in the top navigation bar. Xverse wallet will prompt you to approve the connection.

### Step 2: Choose Role
- **Supplier** — You issue invoices and receive payments
- **Buyer** — You view and pay invoices

### Step 3: Create Invoice (as Supplier)
1. Click **"Create Invoice"**
2. Fill in buyer name, buyer's BTC address, due date
3. Add line items with quantities and prices (in sats)
4. Submit — invoice is created and visible to both roles

### Step 4: Pay Invoice (as Buyer)
1. Find the invoice in the table → Click **"Pay"**
2. Review the payment confirmation modal (amount, execution path)
3. Click **"Pay Now"** → Xverse wallet will prompt to sign the transaction
4. Confirm in Xverse → BTC is sent to the supplier's address
5. Supports **partial payments** — pay in installments!

### Step 5: Confirm Receipt (as Buyer)
1. After receiving goods, click **"Confirm Receipt"** on the escrowed invoice
2. Funds are marked as released → Invoice status changes to **Paid**

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

### Phase 2: Enhanced Settlement ✅ *(Current)*
- [x] **Native Bitcoin Payments** — Real BTC transfers via `sendTransfer()`
- [x] **Escrow Mechanism** — Track payment hold & release status
- [x] **Partial Payments** — Installment support with progress bar
- [x] **Confirm Receipt** — Buyer-triggered settlement to release funds
- [x] **Bitcoin Testnet** — Fully functional on real Bitcoin test network
- [x] **Removed EVM/Solidity** — Pure Bitcoin-native architecture (no MetaMask, no smart contracts)

### Phase 3: On-Chain Escrow (Next)
- [ ] **Multi-signature Escrow** — 2-of-3 multisig for trustless escrow using Bitcoin Script
- [ ] **PSBT (Partially Signed Bitcoin Transactions)** — Collaborative transaction signing
- [ ] **Invoice Persistence** — Store invoices on-chain via OP_RETURN or Ordinals inscriptions
- [ ] **Block Explorer Integration** — Direct links to mempool.space for tx verification

### Phase 4: Scaling & Beyond
- [ ] **Lightning Network** — Instant micro-payment settlement for small invoices
- [ ] **Mobile App** — React Native with Xverse mobile SDK
- [ ] **Reputation System** — On-chain supplier scoring based on delivery history
- [ ] **Multi-currency** — Support for Stacks (STX) and BRC-20 tokens
- [ ] **Mainnet Launch** — Production deployment on Bitcoin Mainnet

---

## Live Demo

**[sats-procure.vercel.app](https://sats-procure.vercel.app)**

> Requires Xverse wallet browser extension with Bitcoin Testnet enabled.

---

## License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>SatsProcure</strong> — Empowering B2B Commerce on Bitcoin.<br/>
  <sub>Built with native Bitcoin payments. No EVM. No smart contracts. Just BTC.</sub>
</p>
