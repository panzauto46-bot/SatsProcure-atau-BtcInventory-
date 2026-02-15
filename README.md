<p align="center">
  <img src="https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Solidity-0.8-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

# SatsProcure

**Decentralized B2B Procurement & Settlement System**

SatsProcure is a modern web application designed for managing inter-business procurement invoices on-chain. Built with React, TypeScript, and Solidity, it offers a transparent, secure, and automated workflow.

The application uniquely combines **Bitcoin wallet integration (Xverse)** for user identity with **EVM Smart Contracts** for settlement logic.

---

## 🚀 Key Features

### 🏛️ Dual Role System
- **Supplier Dashboard:** Create invoices on-chain, manage inventory items, and track payments.
- **Buyer Dashboard:** View incoming invoices, inspect item details, and execute payments via MetaMask.

### 📜 Real-Time Blockchain Settlement
- **Smart Contract:** powered by `SatsProcure.sol`.
- **Full Lifecycle:** Create -> Pending -> Paid / Cancelled.
- **On-Chain Data:** All invoices are read directly from the blockchain (no local database).

### 🔗 Hybrid Web3 Architecture
- **Identity:** **Xverse Wallet** (Sats Connect) for Bitcoin-native identity.
- **Settlement:** **MetaMask** for interacting with the EVM Smart Contract (Localhost / Midl Regtest).

---

## 🛠️ Prerequisites

1.  **Node.js** (v18 or later)
2.  **Xverse Wallet** (Browser Extension) - for Login
3.  **MetaMask** (Browser Extension) - for Gas/Transactions

---

## ⚡ Getting Started (Local Development)

Since testnet faucets can be unreliable, we recommend running the **Hardhat Local Network** for a 100% functional demo.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/panzauto46-bot/SatsProcure-atau-BtcInventory-.git
    cd SatsProcure-atau-BtcInventory-
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start Local Blockchain**
    Open a terminal and run:
    ```bash
    npx hardhat node
    ```
    *Keep this terminal running!*

4.  **Configure MetaMask**
    -   Add Network: **Hardhat Local**
        -   RPC URL: `http://127.0.0.1:8545`
        -   Chain ID: `31337`
        -   Currency: `ETH`
    -   **Import Test Account:**
        -   Copy Private Key from Account #0 in the terminal (e.g., `ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).
        -   Import into MetaMask to get **10,000 ETH** balance.

5.  **Deploy Contract**
    In a *new* terminal:
    ```bash
    npx hardhat run scripts/deploy.cjs --network localhost
    ```
    *Check `.env` file to ensure `VITE_CONTRACT_ADDRESS` is updated.*

6.  **Run Frontend**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173`.

---

## 🤝 How to Use

1.  **Connect Wallet:** Click "Connect Wallet" (requires Xverse).
2.  **Choose Role:** Select **Supplier** to issue invoices or **Buyer** to pay them.
3.  **Create Invoice:** (As Supplier) Fill in details -> Click "Create Invoice".
    *   *Watch for the new Premium Transaction Overlay while waiting for confirmation!* 💎
4.  **Pay Invoice:** (As Buyer) Click "Pay" -> **Confirm Transaction in MetaMask**.
5.  **Verify:** See the status change to **Paid** instantly!

---

## �️ Roadmap

### Phase 1: Foundation (Current)
- [x] Hybrid Wallet Integration (Xverse + MetaMask)
- [x] Basic Invoice Management (Create, Pay, Cancel)
- [x] Smart Contract Deployment on Testnet/Localhost
- [x] Premium UI/UX Design

### Phase 2: Enhanced Settlement (Q2 2025)
- [ ] **Escrow Mechanism:** Funds held in contract until Buyer confirms receipt of goods.
- [ ] **Partial Payments:** Allow Buyers to pay invoices in installments.
- [ ] **Mainnet Deployment:** Deploy to Midl Mainnet & Bitcoin Mainnet.

### Phase 3: Scaling & Mobile (Q3 2025)
- [ ] **Mobile App:** Native iOS/Android app using React Native.
- [ ] **Lightning Network:** Instant settlement for micro-transactions.
- [ ] **reputation System:** On-chain reputation score for Suppliers based on successful deliveries.

---

## �📄 License

Distributed under the MIT License.

<p align="center">
  <strong>SatsProcure</strong> — Empowering B2B Commerce on the Block(chain).
</p>
