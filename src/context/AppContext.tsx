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
  const createInvoice = useCallback((data: {
    buyer: string;
    buyerAddress: string;
    items: InvoiceItem[];
    dueDate: string;
    notes?: string;
  }) => {
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      supplier: role === 'supplier' ? 'Your Company' : 'Unknown',
      supplierAddress: wallet.address,
      buyer: data.buyer,
      buyerAddress: data.buyerAddress,
      items: data.items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
      contractAddress: generateContractAddress(),
      notes: data.notes,
    };
    setInvoices(prev => [invoice, ...prev]);
    addNotification({
      type: 'success',
      title: t('invoiceCreated'),
      message: `${invoice.invoiceNumber} ${t('invoiceCreatedMsg')} ${totalAmount.toLocaleString()} sats`,
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

    // === DEMO PAYMENT ===
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
