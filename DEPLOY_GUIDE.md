# 🚀 SatsProcure — Smart Contract Deployment Guide (Midl Regtest)

## Overview

Deploy the `SatsProcure.sol` smart contract to **Midl Regtest** network using **Remix IDE** (browser-based, no local tools needed).

---

## Step 1: Setup MetaMask for Midl Regtest

Add the Midl Regtest network to MetaMask manually:

1. Open MetaMask → Click network dropdown → **Add Network**
2. Click **"Add a network manually"**
3. Fill in:

| Field | Value |
|---|---|
| **Network Name** | `Midl Regtest` |
| **New RPC URL** | `https://rpc.staging.midl.xyz` |
| **Chain ID** | *(auto-detected when you connect — try `8888` or let Remix detect it)* |
| **Currency Symbol** | `BTC` |
| **Block Explorer URL** | `https://blockscout.regtest.midl.xyz` |

4. Click **Save**

> 💡 **Alternatively**: When deploying via Remix with "Injected Provider - MetaMask", the Chain ID will be auto-detected and MetaMask will prompt you to add the network.

---

## Step 2: Get Test BTC from Faucet

1. Open: **https://faucet.regtest.midl.xyz**
2. Paste your MetaMask wallet address (make sure you're on Midl Regtest network)
3. Click **Claim** to receive test BTC

> ⚠️ You may need to use your **Xverse wallet** address instead. Check the faucet instructions.

---

## Step 3: Deploy via Remix IDE

### 3a. Open Remix
Go to: **https://remix.ethereum.org**

### 3b. Create Contract File
1. In Remix file explorer, create a new file: `SatsProcure.sol`
2. **Copy-paste** the entire content below:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SatsProcure
 * @dev Simple procurement contract for creating and paying invoices.
 * Designed to work on Midl Bitcoin EVM.
 */
contract SatsProcure {
    
    struct Invoice {
        uint256 id;
        string invoiceNumber;
        address payable supplier;
        address buyer;
        uint256 amount;
        uint256 createdAt;
        uint256 dueDate;
        string notes;
        bool isPaid;
        bool isCancelled;
    }

    uint256 public invoiceCount;
    mapping(uint256 => Invoice) public invoices;
    mapping(string => uint256) public invoiceNumberToId;

    event InvoiceCreated(
        uint256 indexed id,
        string invoiceNumber,
        address indexed supplier,
        address indexed buyer,
        uint256 amount,
        uint256 dueDate
    );

    event InvoicePaid(
        uint256 indexed id,
        string invoiceNumber,
        address indexed payer,
        uint256 amount,
        uint256 paidAt
    );

    event InvoiceCancelled(
        uint256 indexed id,
        string invoiceNumber
    );

    function createInvoice(
        string memory _invoiceNumber,
        address _buyer,
        uint256 _amount,
        uint256 _dueDate,
        string memory _notes
    ) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_buyer != address(0), "Invalid buyer address");
        require(bytes(_invoiceNumber).length > 0, "Invoice number is required");
        require(invoiceNumberToId[_invoiceNumber] == 0, "Invoice number already exists");

        invoiceCount++;
        
        invoices[invoiceCount] = Invoice({
            id: invoiceCount,
            invoiceNumber: _invoiceNumber,
            supplier: payable(msg.sender),
            buyer: _buyer,
            amount: _amount,
            createdAt: block.timestamp,
            dueDate: _dueDate,
            notes: _notes,
            isPaid: false,
            isCancelled: false
        });

        invoiceNumberToId[_invoiceNumber] = invoiceCount;

        emit InvoiceCreated(invoiceCount, _invoiceNumber, msg.sender, _buyer, _amount, _dueDate);
    }

    function payInvoice(uint256 _id) public payable {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(!invoice.isPaid, "Invoice is already paid");
        require(!invoice.isCancelled, "Invoice is cancelled");
        require(msg.value == invoice.amount, "Incorrect payment amount");

        invoice.isPaid = true;

        (bool success, ) = invoice.supplier.call{value: msg.value}("");
        require(success, "Transfer to supplier failed");

        emit InvoicePaid(_id, invoice.invoiceNumber, msg.sender, msg.value, block.timestamp);
    }

    function cancelInvoice(uint256 _id) public {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(msg.sender == invoice.supplier, "Only supplier can cancel");
        require(!invoice.isPaid, "Cannot cancel paid invoice");
        require(!invoice.isCancelled, "Invoice is already cancelled");

        invoice.isCancelled = true;

        emit InvoiceCancelled(_id, invoice.invoiceNumber);
    }

    function getInvoice(uint256 _id) public view returns (Invoice memory) {
        return invoices[_id];
    }
}
```

### 3c. Compile
1. Go to **Solidity Compiler** tab (left sidebar, icon looks like "S")
2. Select compiler version: **0.8.24** (or any 0.8.x)
3. Click **Compile SatsProcure.sol**
4. ✅ Should compile without errors

### 3d. Deploy
1. Go to **Deploy & Run Transactions** tab
2. Set **Environment**: `Injected Provider - MetaMask`
3. MetaMask will pop up — **make sure you're on Midl Regtest network**
4. Select contract: `SatsProcure`
5. Click **Deploy**
6. MetaMask will ask you to confirm the transaction — click **Confirm**
7. Wait for deployment...

### 3e. Get Contract Address
1. After successful deployment, look in the **Deployed Contracts** section
2. You'll see `SATSPROCURE at 0x...` 
3. **Click the copy icon** next to the address
4. **SAVE THIS ADDRESS** — you need it for the next step!

Example: `0x1234567890abcdef1234567890abcdef12345678`

---

## Step 4: Verify on Explorer

Check your deployed contract on Blockscout:
- Open: `https://blockscout.regtest.midl.xyz/address/YOUR_CONTRACT_ADDRESS`

---

## Step 5: Update Frontend Code

**Give the contract address to me (the AI assistant)** and I will update `src/lib/web3.ts` instantly.

Or manually edit `src/lib/web3.ts`:
```typescript
export const CONTRACT_ADDRESS = "0xPASTE_YOUR_ADDRESS_HERE";
```

---

## Step 6: Test the Full Flow

1. Run `npm run dev`
2. Connect Xverse wallet
3. Select role → Supplier
4. Create Invoice → This will trigger MetaMask to sign a transaction
5. Transaction goes to Midl Regtest → appears on Blockscout explorer
6. Switch to Buyer role → Pay the invoice
7. Transaction confirmed on-chain ✅

---

## Key URLs

| Resource | URL |
|---|---|
| **Midl Faucet** | https://faucet.regtest.midl.xyz |
| **Blockscout Explorer** | https://blockscout.regtest.midl.xyz |
| **Mempool Explorer** | https://mempool.staging.midl.xyz |
| **Remix IDE** | https://remix.ethereum.org |
| **Midl SDK Docs** | https://midl.xyz/docs |
| **Deploy Starter Repo** | https://github.com/midl-xyz/smart-contract-deploy-starter |

## Troubleshooting

- **"Chain ID not matching"**: Let Remix auto-detect the chain ID. The RPC is `https://rpc.staging.midl.xyz`
- **"Insufficient funds"**: Get more test BTC from the faucet
- **"Transaction failed"**: Make sure you're on the correct network (Midl Regtest)
- **Can't add network to MetaMask**: Try connecting via Remix first — it will auto-add the network
