<p align="center">
  <img src="https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

# SatsProcure

**Decentralized B2B Procurement & Settlement on Bitcoin**

SatsProcure is a modern web application for managing inter-business procurement invoices on-chain. Built with React, TypeScript, and Tailwind CSS, it provides a transparent, secure, and automated procurement workflow powered by Bitcoin smart contracts via the Midl network.

---

## Features

- **Dual Role System** -- Switch between Supplier and Buyer roles with distinct dashboards and capabilities
- **Invoice Management** -- Create, view, filter, and track procurement invoices with full item-level detail
- **On-Chain Settlement** -- Simulate Bitcoin smart contract deployment and payment execution via Midl RPC
- **Xverse Wallet Integration** -- Connect/disconnect wallet simulation with address generation and balance tracking
- **Smart Contract Viewer** -- Built-in Solidity contract viewer showing the on-chain invoice logic
- **Bilingual Support** -- Full English and Bahasa Indonesia localization (i18n)
- **Dark Mode UI** -- Premium dark theme with gradient accents, glassmorphism effects, and smooth animations
- **Responsive Design** -- Fully responsive layout optimized for mobile, tablet, and desktop
- **Real-time Notifications** -- Toast notification system with auto-dismiss and transaction hash copy
- **Invoice Detail Modal** -- Comprehensive invoice view with on-chain data, contract address, and tx hash

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI library with hooks & context |
| TypeScript | 5.9 | Type-safe development |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Lucide React | latest | Icon library |
| UUID | 13.x | Unique identifier generation |

---

## Project Structure

```
satsprocure/
├── public/                  # Static assets
├── src/
│   ├── components/          # React UI components
│   │   ├── Navbar.tsx           # Navigation bar with wallet connection
│   │   ├── RoleSelector.tsx     # Landing page & role selection
│   │   ├── Dashboard.tsx        # Main dashboard with filters
│   │   ├── StatsCards.tsx       # Statistics overview cards
│   │   ├── InvoiceTable.tsx     # Expandable invoice table
│   │   ├── CreateInvoiceModal.tsx   # Invoice creation form
│   │   ├── InvoiceDetailModal.tsx   # Invoice detail view
│   │   ├── PayConfirmModal.tsx      # Payment confirmation dialog
│   │   └── Notifications.tsx       # Toast notification system
│   ├── context/
│   │   └── AppContext.tsx       # Global state management
│   ├── i18n/
│   │   ├── LanguageContext.tsx  # Language provider
│   │   └── translations.ts     # EN/ID translation strings
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── cn.ts                # Tailwind class merge utility
│   ├── App.tsx                  # Root application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles & animations
├── index.html                   # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/panzauto46-bot/SatsProcure-atau-BtcInventory-.git

# Navigate to the project directory
cd SatsProcure-atau-BtcInventory-

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

The production build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Deployment

### Deploy to Vercel

This project is pre-configured for seamless deployment on Vercel.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect the Vite framework and configure:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**

Alternatively, deploy via Vercel CLI:

```bash
npm i -g vercel
vercel
```

---

## Application Flow

```
Connect Wallet (Xverse)
        │
        v
  Select Role
  ┌─────┴─────┐
  │            │
Supplier     Buyer
  │            │
  v            v
Create       View
Invoices     Invoices
  │            │
  v            v
Deploy to    Pay via
Smart        Smart
Contract     Contract
  │            │
  v            v
  On-Chain Settlement
  (Bitcoin via Midl RPC)
```

### Supplier Workflow
1. Connect Xverse wallet
2. Select **Supplier** role
3. Create invoices with buyer info and item list
4. Deploy invoices to smart contracts via Midl RPC
5. Monitor payment status on the dashboard

### Buyer Workflow
1. Connect Xverse wallet
2. Select **Buyer** role
3. View incoming invoices and item details
4. Confirm and execute on-chain payments
5. Receive transaction confirmation with tx hash

---

## Screenshots

| Landing Page | Dashboard |
|---|---|
| Dark-themed hero section with feature cards | Invoice management with stats and filters |

| Create Invoice | Payment Confirmation |
|---|---|
| Multi-item form with smart contract deployment | On-chain transaction warning and execution path |

---

## Key Components

### AppContext
Global state management using React Context API. Manages wallet state, invoice CRUD, role selection, and notification system.

### Invoice System
- Unique invoice numbers (`INV-YYYY-NNNN`)
- Multi-item support with quantity and unit price
- Status tracking: `pending` | `paid` | `cancelled`
- Smart contract address and transaction hash generation

### i18n (Internationalization)
Full bilingual support with `LanguageContext` provider. All UI strings are externalized in `translations.ts` supporting English and Bahasa Indonesia.

---

## Environment

- **Network:** Midl Testnet (simulated)
- **Wallet:** Xverse (simulated)
- **Currency:** Satoshi (sats)

> **Note:** This is a frontend demo/prototype. Wallet connections, smart contract deployments, and payments are simulated for demonstration purposes. No real Bitcoin transactions are executed.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>SatsProcure</strong> -- Decentralized B2B Procurement on Bitcoin<br/>
  <sub>Powered by Midl SDK | Built with React + TypeScript + Tailwind CSS</sub>
</p>
