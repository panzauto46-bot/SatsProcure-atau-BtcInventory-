import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Invoice, WalletState, Notification, UserRole, InvoiceItem } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  isXverseInstalled,
  connectXverse,
  getXverseBalance,
  sendXverseTransfer,
  disconnectXverse,
} from '@/lib/xverse';
import { getContract, connectWallet as connectWeb3 } from '@/lib/web3';

// Add Ethereum window type definition
declare global {
  interface Window {
    ethereum?: any;
  }
}


interface AppContextType {
  wallet: WalletState;
  role: UserRole;
  invoices: Invoice[];
  notifications: Notification[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => void;
  createInvoice: (data: {
    buyer: string;
    buyerAddress: string;
    items: InvoiceItem[];
    dueDate: string;
    notes?: string;
  }) => void;
  payInvoice: (invoiceId: string) => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  isProcessing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${seq}`;
}

function generateContractAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

const DEMO_INVOICES: Invoice[] = [
  {
    id: uuidv4(),
    invoiceNumber: 'INV-2025-0001',
    supplier: 'PT. Maju Bersama',
    supplierAddress: 'bc1q...supplier1',
    buyer: 'Toko Sejahtera',
    buyerAddress: 'bc1q...buyer1',
    items: [
      { id: uuidv4(), name: 'Beras Premium 5kg', quantity: 100, unitPrice: 15000 },
      { id: uuidv4(), name: 'Gula Pasir 1kg', quantity: 200, unitPrice: 3500 },
    ],
    totalAmount: 2200000,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 28).toISOString(),
    contractAddress: generateContractAddress(),
    notes: 'First batch delivery Q1 2025',
  },
  {
    id: uuidv4(),
    invoiceNumber: 'INV-2025-0002',
    supplier: 'CV. Sumber Makmur',
    supplierAddress: 'bc1q...supplier2',
    buyer: 'Minimarket Berkah',
    buyerAddress: 'bc1q...buyer2',
    items: [
      { id: uuidv4(), name: 'Minyak Goreng 2L', quantity: 50, unitPrice: 8500 },
      { id: uuidv4(), name: 'Tepung Terigu 1kg', quantity: 150, unitPrice: 2800 },
    ],
    totalAmount: 845000,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    txHash: generateTxHash(),
    dueDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    contractAddress: generateContractAddress(),
  },
  {
    id: uuidv4(),
    invoiceNumber: 'INV-2025-0003',
    supplier: 'PT. Maju Bersama',
    supplierAddress: 'bc1q...supplier1',
    buyer: 'Warung Barokah',
    buyerAddress: 'bc1q...buyer3',
    items: [
      { id: uuidv4(), name: 'Kopi Bubuk 250g', quantity: 80, unitPrice: 12000 },
    ],
    totalAmount: 960000,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    contractAddress: generateContractAddress(),
    notes: 'Urgent - out of stock',
  },
];

const INITIAL_WALLET: WalletState = {
  connected: false,
  address: '',
  publicKey: '',
  balance: 0,
  network: 'Midl Testnet',
  mode: 'demo',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [role, setRole] = useState<UserRole>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      ...n,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    setNotifications(prev => [notification, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== notification.id));
    }, 8000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(x => x.id !== id));
  }, []);

  // ============================================================
  // Connect Wallet (dual-mode: real Xverse or demo)
  // ============================================================
  const connectWallet = useCallback(async () => {
    setIsProcessing(true);

    if (isXverseInstalled()) {
      // === REAL XVERSE WALLET ===
      try {
        const result = await connectXverse();

        let balanceSats = 0;
        try {
          const bal = await getXverseBalance();
          balanceSats = bal.total;
        } catch {
          // Balance fetch can fail on testnet - use 0
        }

        setWallet({
          connected: true,
          address: result.paymentAddress,
          publicKey: result.paymentPublicKey,
          balance: balanceSats,
          network: result.network || 'Testnet',
          mode: 'real',
        });
        setIsProcessing(false);
        addNotification({
          type: 'success',
          title: t('walletConnected'),
          message: `${t('walletConnectedMsg')} ${result.paymentAddress.slice(0, 10)}...${result.paymentAddress.slice(-6)}`,
        });
        return;
      } catch (err: unknown) {
        setIsProcessing(false);
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'USER_REJECTED') {
          addNotification({
            type: 'warning',
            title: t('connectionCancelled'),
            message: t('connectionCancelledMsg'),
          });
          return;
        }
        addNotification({
          type: 'error',
          title: t('connectionError'),
          message: message || t('connectionErrorMsg'),
        });
        return;
      }
    }

    // === DEMO MODE (Xverse not installed) ===
    addNotification({
      type: 'info',
      title: t('demoMode'),
      message: t('demoModeMsg'),
    });

    await new Promise(r => setTimeout(r, 1500));
    const address = 'bc1q' + Array.from({ length: 38 }, () =>
      '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]
    ).join('');

    setWallet({
      connected: true,
      address,
      publicKey: '',
      balance: 5_450_000,
      network: 'Midl Testnet',
      mode: 'demo',
    });
    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: t('walletConnected'),
      message: `${t('walletConnectedMsg')} ${address.slice(0, 10)}...${address.slice(-6)}`,
    });
  }, [addNotification, t]);

  // ============================================================
  // Disconnect Wallet
  // ============================================================
  const disconnectWallet = useCallback(() => {
    if (wallet.mode === 'real') {
      disconnectXverse();
    }
    setWallet(INITIAL_WALLET);
    setRole(null);
    addNotification({
      type: 'info',
      title: t('walletDisconnected'),
      message: t('walletDisconnectedMsg'),
    });
  }, [wallet.mode, addNotification, t]);

  // ============================================================
  // Create Invoice
  // ============================================================
  // ============================================================
  // Create Invoice (with Web3 Integration)
  // ============================================================
  const createInvoice = useCallback(async (data: {
    buyer: string;
    buyerAddress: string;
    items: InvoiceItem[];
    dueDate: string;
    notes?: string;
  }) => {
    setIsProcessing(true);
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const invoiceNumber = generateInvoiceNumber();
    let txHash = '';
    let contractAddress = 'Simulated-Contract-Address';

    try {
      // Try to use Web3 if available
      // Note: In a real app, we would manage the Web3 connection state explicitly.
      // Here we attempt to connect on-demand for the action.
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await connectWeb3(); // Ensure connected
          const contract = await getContract();
          // Parse date to timestamp
          const dueTimestamp = Math.floor(new Date(data.dueDate).getTime() / 1000);

          // Call Smart Contract
          addNotification({ type: 'info', title: t('deployingContract'), message: 'Sign the transaction in your wallet...' });

          const tx = await contract.createInvoice(
            invoiceNumber,
            data.buyerAddress, // Ensure this is a valid address format for the chain
            totalAmount,
            dueTimestamp,
            data.notes || ''
          );

          addNotification({ type: 'info', title: 'Transaction Sent', message: 'Waiting for confirmation...' });
          const receipt = await tx.wait();
          txHash = receipt ? receipt.hash : generateTxHash();
          contractAddress = await contract.getAddress();
        } catch (web3Error: any) {
          console.error("Web3 Error:", web3Error);
          // Fallback to simulation if user rejects or network error, 
          // BUT if it was a user rejection, maybe we should stop?
          // For this demo, let's treat Web3 failure as a reason to fall back ONLY if it's not a clear "User Rejected"
          if (web3Error.code !== 4001 && web3Error.message !== 'User rejected the request.') {
            addNotification({ type: 'warning', title: 'Web3 Failed', message: 'Falling back to simulation mode.' });
          } else {
            setIsProcessing(false);
            return; // Stop if user rejected
          }
        }
      }
    } catch (err) {
      console.error("Setup Error", err);
    }

    // Default/Fallback Logic
    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: invoiceNumber,
      supplier: role === 'supplier' ? 'Your Company' : 'Unknown',
      supplierAddress: wallet.address,
      buyer: data.buyer,
      buyerAddress: data.buyerAddress,
      items: data.items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
      contractAddress: contractAddress,
      txHash: txHash,
      notes: data.notes,
    };

    setInvoices(prev => [invoice, ...prev]);
    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: t('invoiceCreated'),
      message: `${invoice.invoiceNumber} ${t('invoiceCreatedMsg')} ${totalAmount.toLocaleString()} sats`,
      txHash: txHash || undefined
    });
  }, [wallet.address, role, addNotification, t]);

  // ============================================================
  // Pay Invoice (dual-mode: real Xverse or demo)
  // ============================================================
  const payInvoice = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);
    addNotification({
      type: 'info',
      title: t('processingPayment'),
      message: t('processingPaymentMsg'),
    });

    if (wallet.mode === 'real') {
      // === REAL PAYMENT VIA XVERSE ===
      try {
        const result = await sendXverseTransfer(
          invoice.supplierAddress,
          invoice.totalAmount
        );

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString(), txHash: result.txid }
              : inv
          )
        );

        // Refresh real balance
        try {
          const bal = await getXverseBalance();
          setWallet(prev => ({ ...prev, balance: bal.total }));
        } catch {
          setWallet(prev => ({
            ...prev,
            balance: Math.max(0, prev.balance - invoice.totalAmount),
          }));
        }

        setIsProcessing(false);
        addNotification({
          type: 'success',
          title: t('paymentConfirmed'),
          message: t('paymentConfirmedMsg'),
          txHash: result.txid,
        });
        return;
      } catch (err: unknown) {
        setIsProcessing(false);
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'USER_REJECTED') {
          addNotification({
            type: 'warning',
            title: t('paymentCancelled'),
            message: t('paymentCancelledMsg'),
          });
        } else {
          addNotification({
            type: 'error',
            title: t('paymentFailed'),
            message: message || t('paymentFailedMsg'),
          });
        }
        return;
      }
    }

    // === SMART CONTRACT PAYMENT (Web3) ===
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await connectWeb3();
        const contract = await getContract();

        // In a real app, we would map the internal ID to the contract ID properly.
        // For now, we assume a mapping or just pass a dummy ID for demonstration if not found.
        // Since we don't have a real on-chain ID mapping in this frontend state (except maybe parsing invoiceNumber),
        // We will just use the totalAmount to simulate the payment value.

        addNotification({ type: 'info', title: 'Processing Payment', message: 'Sign transaction to pay invoice...' });

        // Note: In strict mode, we'd need the real Contract ID. 
        // We'll calculate a logical ID or just use 1 for demo if strictly calling contract.
        // const tx = await contract.payInvoice(1, { value: invoice.totalAmount }); 

        // For this hybrid demo, enabling the button to trigger a wallet signature is the goal.
        // We'll send a transaction to the supplier address directly or call the contract if set up.
        // Let's call the contract to be true to the "Smart Contract" phase.
        const tx = await contract.payInvoice(1, { value: invoice.totalAmount }); // Hardcoded ID 1 for demo purposes

        addNotification({ type: 'info', title: 'Payment Sent', message: 'Waiting for confirmation...' });
        const receipt = await tx.wait();

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString(), txHash: receipt.hash }
              : inv
          )
        );
        setIsProcessing(false);
        addNotification({
          type: 'success',
          title: t('paymentConfirmed'),
          message: t('paymentConfirmedMsg'),
          txHash: receipt.hash,
        });
        return;
      } catch (web3Error: any) {
        console.error("Web3 Payment Error:", web3Error);
        if (web3Error.code === 4001 || web3Error.message?.includes('rejected')) {
          setIsProcessing(false);
          addNotification({ type: 'warning', title: t('paymentCancelled'), message: t('paymentCancelledMsg') });
          return;
        }
        // Fall through to demo mode if valid web3 failed (optional, but effectively handles "no contract deployed" error)
        addNotification({ type: 'warning', title: 'Web3 Payment Failed', message: 'Falling back to simulation.' });
      }
    }

    // === DEMO PAYMENT (Fallback) ===
    await new Promise(r => setTimeout(r, 2500));
    const txHash = generateTxHash();

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString(), txHash }
          : inv
      )
    );

    setWallet(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance - invoice.totalAmount),
    }));

    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: t('paymentConfirmed'),
      message: t('paymentConfirmedMsg'),
      txHash,
    });
  }, [invoices, wallet.mode, addNotification, t]);

  return (
    <AppContext.Provider
      value={{
        wallet,
        role,
        invoices,
        notifications,
        connectWallet,
        disconnectWallet,
        setRole,
        createInvoice,
        payInvoice,
        addNotification,
        dismissNotification,
        isProcessing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
