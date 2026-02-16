import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Invoice, WalletState, Notification, UserRole, InvoiceItem } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  isXverseInstalled,
  connectXverse,
  getXverseBalance,
  disconnectXverse,
} from '@/lib/xverse';
import {
  getContract,
  connectWallet as connectWeb3,
  isContractDeployed,
} from '@/lib/web3';

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
  network: 'Midl Testnet',
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
  // Load Invoices from Blockchain
  // ============================================================
  const loadInvoicesFromChain = useCallback(async () => {
    if (!isContractDeployed()) return;

    try {
      const contract = await getContract();
      const countBN = await contract.invoiceCount();
      const count = Number(countBN);

      if (count === 0) {
        setInvoices([]);
        return;
      }

      const loaded: Invoice[] = [];
      for (let i = 1; i <= count; i++) {
        const inv = await contract.getInvoice(i);
        const amountPaid = Number(inv.amountPaid);
        const amountReleased = Number(inv.amountReleased);
        const totalAmount = Number(inv.amount);

        // Determine rich status
        let status: Invoice['status'] = 'pending';
        if (inv.isCancelled) {
          status = 'cancelled';
        } else if (inv.isPaid && amountReleased >= totalAmount) {
          status = 'paid';       // Fully paid AND released
        } else if (inv.isPaid) {
          status = 'escrowed';   // Fully paid, awaiting buyer confirmation
        } else if (amountPaid > 0) {
          status = 'partial';    // Partially paid
        }

        loaded.push({
          id: inv.id.toString(),
          invoiceNumber: inv.invoiceNumber,
          supplier: inv.supplier,
          supplierAddress: inv.supplier,
          buyer: inv.buyer,
          buyerAddress: inv.buyer,
          items: [],
          totalAmount,
          status,
          createdAt: new Date(Number(inv.createdAt) * 1000).toISOString(),
          paidAt: inv.isPaid ? new Date().toISOString() : undefined,
          dueDate: new Date(Number(inv.dueDate) * 1000).toISOString(),
          notes: inv.notes,
          amountPaid,
          amountReleased,
        });
      }
      setInvoices(loaded);
    } catch (err) {
      console.error('Failed to load invoices from chain:', err);
    }
  }, []);

  // ============================================================
  // Connect Wallet (Real Xverse Only)
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
  // Create Invoice (On-Chain via Smart Contract)
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

    if (!isContractDeployed()) {
      setIsProcessing(false);
      addNotification({
        type: 'error',
        title: 'Contract Not Deployed',
        message: 'The smart contract has not been deployed yet. Please deploy the contract first.',
      });
      return;
    }

    try {
      // Connect to EVM (MetaMask) for signing
      await connectWeb3();
      const contract = await getContract();

      const dueTimestamp = Math.floor(new Date(data.dueDate).getTime() / 1000);

      addNotification({
        type: 'info',
        title: t('deployingContract'),
        message: 'Sign the transaction in MetaMask...',
      });

      const tx = await contract.createInvoice(
        invoiceNumber,
        data.buyerAddress,
        totalAmount,
        dueTimestamp,
        data.notes || ''
      );

      addNotification({
        type: 'info',
        title: 'Transaction Sent',
        message: 'Waiting for on-chain confirmation...',
      });

      const receipt = await tx.wait();
      const txHash = receipt ? receipt.hash : '';

      // Add to local state immediately
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
        txHash,
        notes: data.notes,
        amountPaid: 0,
        amountReleased: 0,
      };

      setInvoices(prev => [invoice, ...prev]);
      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: t('invoiceCreated'),
        message: `${invoice.invoiceNumber} — ${totalAmount.toLocaleString()} sats recorded on-chain`,
        txHash,
      });
    } catch (err: any) {
      setIsProcessing(false);
      if (err.code === 4001 || err.message?.includes('rejected')) {
        addNotification({
          type: 'warning',
          title: 'Transaction Rejected',
          message: 'You rejected the transaction in your wallet.',
        });
      } else {
        console.error('Create invoice error:', err);
        addNotification({
          type: 'error',
          title: 'Transaction Failed',
          message: err.message || 'Failed to create invoice on-chain.',
        });
      }
    }
  }, [wallet.address, addNotification, t]);

  // ============================================================
  // Pay Invoice (On-Chain via Smart Contract)
  // ============================================================
  const payInvoice = useCallback(async (invoiceId: string, partialAmount?: number) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    if (!isContractDeployed()) {
      setIsProcessing(false);
      addNotification({
        type: 'error',
        title: 'Contract Not Deployed',
        message: 'Cannot pay — smart contract not deployed yet.',
      });
      return;
    }

    try {
      await connectWeb3();
      const contract = await getContract();

      // Determine payment amount: partial or remaining full
      const payAmount = partialAmount ?? (invoice.totalAmount - invoice.amountPaid);

      addNotification({
        type: 'info',
        title: t('processingPayment'),
        message: `Paying ${payAmount.toLocaleString()} sats — sign in MetaMask...`,
      });

      const onChainId = await contract.invoiceNumberToId(invoice.invoiceNumber);
      const tx = await contract.payInvoice(onChainId, { value: payAmount });

      addNotification({
        type: 'info',
        title: 'Payment Sent',
        message: 'Waiting for on-chain confirmation...',
      });

      const receipt = await tx.wait();

      const newAmountPaid = invoice.amountPaid + payAmount;
      const fullyPaid = newAmountPaid >= invoice.totalAmount;

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
              ...inv,
              amountPaid: newAmountPaid,
              status: fullyPaid ? 'escrowed' as const : 'partial' as const,
              txHash: receipt.hash,
            }
            : inv
        )
      );

      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: fullyPaid ? 'Fully Paid (In Escrow)' : 'Partial Payment Received',
        message: fullyPaid
          ? `Invoice fully paid! Funds held in escrow until buyer confirms receipt.`
          : `Installment of ${payAmount.toLocaleString()} sats received. ${(invoice.totalAmount - newAmountPaid).toLocaleString()} sats remaining.`,
        txHash: receipt.hash,
      });
    } catch (err: any) {
      setIsProcessing(false);
      if (err.code === 4001 || err.message?.includes('rejected')) {
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
          message: err.message || t('paymentFailedMsg'),
        });
      }
    }
  }, [invoices, addNotification, t]);

  // ============================================================
  // Confirm Receipt (Release Escrow to Supplier)
  // ============================================================
  const confirmReceipt = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setIsProcessing(true);

    try {
      await connectWeb3();
      const contract = await getContract();

      addNotification({
        type: 'info',
        title: 'Confirming Receipt',
        message: 'Sign the transaction to release funds to the supplier...',
      });

      const onChainId = await contract.invoiceNumberToId(invoice.invoiceNumber);
      const tx = await contract.confirmReceipt(onChainId);

      addNotification({
        type: 'info',
        title: 'Transaction Sent',
        message: 'Waiting for on-chain confirmation...',
      });

      const receipt = await tx.wait();

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
              ...inv,
              status: 'paid' as const,
              amountReleased: inv.amountPaid,
              paidAt: new Date().toISOString(),
              txHash: receipt.hash,
            }
            : inv
        )
      );

      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: 'Funds Released!',
        message: `Escrow released — supplier has received ${invoice.amountPaid.toLocaleString()} sats.`,
        txHash: receipt.hash,
      });
    } catch (err: any) {
      setIsProcessing(false);
      if (err.code === 4001 || err.message?.includes('rejected')) {
        addNotification({
          type: 'warning',
          title: 'Transaction Cancelled',
          message: 'You rejected the confirm receipt transaction.',
        });
      } else {
        console.error('Confirm receipt error:', err);
        addNotification({
          type: 'error',
          title: 'Confirm Receipt Failed',
          message: err.message || 'Failed to release escrow funds.',
        });
      }
    }
  }, [invoices, addNotification]);

  // Load invoices when wallet connects
  useEffect(() => {
    if (wallet.connected && isContractDeployed()) {
      loadInvoicesFromChain();
    }
  }, [wallet.connected, loadInvoicesFromChain]);

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
