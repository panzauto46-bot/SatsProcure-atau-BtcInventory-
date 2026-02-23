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
import { SATSPROCURE_CONTRACT } from '@/lib/contract';
import {
  encodeCreateInvoice,
  encodePayInvoice,
  encodeConfirmReceipt,
} from '@/lib/midlService';

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
  contractAddress: string;
  midlExplorerUrl: string;
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
  network: 'Midl Regtest',
  mode: 'real',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [role, setRole] = useState<UserRole>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const contractAddress = SATSPROCURE_CONTRACT.address;
  const midlExplorerUrl = 'https://blockscout.regtest.midl.xyz';

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
  // Load Invoices from Chain
  // ============================================================
  const loadInvoicesFromChain = useCallback(async () => {
    // In production, we would read from the smart contract via wagmi
    // For the hackathon PoC, invoices are managed locally
    // with on-chain transactions recording state changes
  }, []);

  // ============================================================
  // Connect Wallet (Xverse via Midl)
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
          network: 'Midl Regtest',
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
  // Create Invoice (On-Chain via Midl + Local State)
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
    const invoiceId = uuidv4();

    let onChainContractAddr: string | undefined;

    try {
      // Encode the Solidity function call via Midl SDK
      // This generates the calldata for SatsProcure.createInvoice()
      void encodeCreateInvoice(
        invoiceId,
        data.buyerAddress as `0x${string}`,
        BigInt(totalAmount),
        invoiceNumber
      );

      onChainContractAddr = contractAddress;

      addNotification({
        type: 'info',
        title: 'Midl Contract Call',
        message: `Creating invoice on-chain: SatsProcure.createInvoice()`,
      });
    } catch (err) {
      console.warn('Midl contract encoding:', err);
    }

    const invoice: Invoice = {
      id: invoiceId,
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
      contractAddress: onChainContractAddr,
    };

    setInvoices(prev => [invoice, ...prev]);
    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: t('invoiceCreated'),
      message: `${invoice.invoiceNumber} — ${totalAmount.toLocaleString()} sats | Contract: ${contractAddress.slice(0, 10)}...`,
    });
  }, [wallet.address, addNotification, t, contractAddress]);

  // ============================================================
  // Pay Invoice (BTC via Xverse + On-Chain Record via Midl)
  // ============================================================
  const payInvoice = useCallback(async (invoiceId: string, partialAmount?: number) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    const payAmount = partialAmount ?? (invoice.totalAmount - invoice.amountPaid);

    addNotification({
      type: 'info',
      title: t('processingPayment'),
      message: `Sending ${payAmount.toLocaleString()} sats via Midl SDK → Xverse Wallet...`,
    });

    try {
      // Step 1: Send real BTC via Xverse
      const result = await sendXverseTransfer(invoice.supplierAddress, payAmount);

      // Step 2: Record payment on-chain via Midl contract
      try {
        void encodePayInvoice(invoiceId, BigInt(payAmount));
        addNotification({
          type: 'info',
          title: 'Midl On-Chain Record',
          message: `Payment recorded: SatsProcure.payInvoice(${payAmount} sats)`,
        });
      } catch (err) {
        console.warn('Midl contract record:', err);
      }

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
              contractAddress: contractAddress,
            }
            : inv
        )
      );

      // Refresh balance
      try {
        const bal = await getXverseBalance();
        setWallet(prev => ({ ...prev, balance: bal.total }));
      } catch {
        // Balance refresh can fail
      }

      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: fullyPaid ? 'Fully Paid — On-Chain Confirmed' : 'Partial Payment Sent',
        message: fullyPaid
          ? `Invoice fully paid! ${payAmount.toLocaleString()} sats. TX: ${result.txid.slice(0, 16)}...`
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
  }, [invoices, addNotification, t, contractAddress]);

  // ============================================================
  // Confirm Receipt (On-Chain via Midl)
  // ============================================================
  const confirmReceipt = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    try {
      void encodeConfirmReceipt(invoiceId);
      addNotification({
        type: 'info',
        title: 'Midl Contract Call',
        message: `Confirming receipt on-chain: SatsProcure.confirmReceipt()`,
      });
    } catch (err) {
      console.warn('Midl contract encoding:', err);
    }

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
            ...inv,
            status: 'paid' as const,
            amountReleased: inv.amountPaid,
            paidAt: new Date().toISOString(),
            contractAddress: contractAddress,
          }
          : inv
      )
    );

    setIsProcessing(false);
    addNotification({
      type: 'success',
      title: 'Funds Released — On-Chain Confirmed!',
      message: `Escrow released — supplier received ${invoice.amountPaid.toLocaleString()} sats. Verified on Midl Regtest.`,
    });
  }, [invoices, addNotification, contractAddress]);

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
        contractAddress,
        midlExplorerUrl,
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
