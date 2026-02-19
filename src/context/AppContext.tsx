import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Invoice, WalletState, Notification, UserRole, InvoiceItem } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  isXverseInstalled,
  connectXverse,
  getXverseBalance,
  disconnectXverse,
  sendXverseTransfer,
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
  payInvoice: (invoiceId: string, partialAmount?: number) => Promise<void>;
  confirmReceipt: (invoiceId: string) => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  isProcessing: boolean;
  loadInvoicesFromChain: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${seq}`;
}

const INITIAL_WALLET: WalletState = {
  connected: false,
  address: '',
  publicKey: '',
  balance: 0,
  network: 'Testnet',
  mode: 'real',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [role, setRole] = useState<UserRole>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  // Load Invoices (local state only — no on-chain contract)
  // ============================================================
  const loadInvoicesFromChain = useCallback(async () => {
    // No-op: invoices are managed locally until Bitcoin-native integration is ready
  }, []);

  // ============================================================
  // Connect Wallet (Xverse Only)
  // ============================================================
  const connectWallet = useCallback(async () => {
    setIsProcessing(true);

    if (isXverseInstalled()) {
      try {
        const result = await connectXverse();

        let balanceSats = 0;
        try {
          const bal = await getXverseBalance();
          balanceSats = bal.total;
        } catch {
          // Balance fetch can fail on testnet
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
    } else {
      // Xverse NOT Installed — redirect to download
      setIsProcessing(false);
      addNotification({
        type: 'error',
        title: 'Xverse Wallet Required',
        message: 'Please install Xverse Wallet extension to use SatsProcure.',
      });
      window.open('https://www.xverse.app/download', '_blank');
    }
  }, [addNotification, t]);

  // ============================================================
  // Disconnect Wallet
  // ============================================================
  const disconnectWallet = useCallback(() => {
    disconnectXverse();
    setWallet(INITIAL_WALLET);
    setRole(null);
    setInvoices([]);
    addNotification({
      type: 'info',
      title: t('walletDisconnected'),
      message: t('walletDisconnectedMsg'),
    });
  }, [addNotification, t]);

  // ============================================================
  // Create Invoice (Local — no EVM contract)
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

    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber,
      supplier: wallet.address || 'You',
      supplierAddress: wallet.address,
      buyer: data.buyer,
      buyerAddress: data.buyerAddress,
      items: data.items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
      notes: data.notes,
      amountPaid: 0,
      amountReleased: 0,
    };

    setInvoices(prev => [invoice, ...prev]);
    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: t('invoiceCreated'),
      message: `${invoice.invoiceNumber} — ${totalAmount.toLocaleString()} sats`,
    });
  }, [wallet.address, addNotification, t]);

  // ============================================================
  // Pay Invoice (Send BTC via Xverse / sats-connect)
  // ============================================================
  const payInvoice = useCallback(async (invoiceId: string, partialAmount?: number) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    const payAmount = partialAmount ?? (invoice.totalAmount - invoice.amountPaid);

    addNotification({
      type: 'info',
      title: t('processingPayment'),
      message: `Sending ${payAmount.toLocaleString()} sats — confirm in Xverse...`,
    });

    try {
      const result = await sendXverseTransfer(invoice.supplierAddress, payAmount);

      const newAmountPaid = invoice.amountPaid + payAmount;
      const fullyPaid = newAmountPaid >= invoice.totalAmount;

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
              ...inv,
              amountPaid: newAmountPaid,
              status: fullyPaid ? 'escrowed' as const : 'partial' as const,
              txHash: result.txid,
            }
            : inv
        )
      );

      // Refresh balance after payment
      try {
        const bal = await getXverseBalance();
        setWallet(prev => ({ ...prev, balance: bal.total }));
      } catch {
        // Balance refresh can fail on testnet
      }

      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: fullyPaid ? 'Fully Paid' : 'Partial Payment Sent',
        message: fullyPaid
          ? `Invoice fully paid! ${payAmount.toLocaleString()} sats sent to supplier.`
          : `Installment of ${payAmount.toLocaleString()} sats sent. ${(invoice.totalAmount - newAmountPaid).toLocaleString()} sats remaining.`,
        txHash: result.txid,
      });
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
        console.error('Pay invoice error:', err);
        addNotification({
          type: 'error',
          title: t('paymentFailed'),
          message: message || t('paymentFailedMsg'),
        });
      }
    }
  }, [invoices, addNotification, t]);

  // ============================================================
  // Confirm Receipt (Local — release escrow)
  // ============================================================
  const confirmReceipt = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
            ...inv,
            status: 'paid' as const,
            amountReleased: inv.amountPaid,
            paidAt: new Date().toISOString(),
          }
          : inv
      )
    );

    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: 'Funds Released!',
      message: `Escrow released — supplier has received ${invoice.amountPaid.toLocaleString()} sats.`,
    });
  }, [invoices, addNotification]);

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
        confirmReceipt,
        addNotification,
        dismissNotification,
        isProcessing,
        loadInvoicesFromChain,
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
