import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useConnect, useDisconnect } from '@midl/react';
import { AddressPurpose } from '@midl/core';
import {
  useAddTxIntention,
  useClearTxIntentions,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntentions,
} from '@midl/executor-react';
import { v4 as uuidv4 } from 'uuid';
import { isAddress, zeroAddress } from 'viem';
import type { Invoice, WalletState, Notification, UserRole, InvoiceItem } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  isXverseInstalled,
  getXverseBalance,
  disconnectXverse,
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
  }) => Promise<void>;
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

function isConfiguredContractAddress(address: string): boolean {
  return isAddress(address) && address.toLowerCase() !== zeroAddress;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

function isUserRejectedError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return message.includes('reject') || message.includes('cancel');
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

  const { connectAsync: connectMidlAsync } = useConnect({
    purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
  });
  const { disconnectAsync: disconnectMidlAsync } = useDisconnect();
  const { addTxIntentionAsync } = useAddTxIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionsAsync } = useSignIntentions();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions();
  const clearTxIntentions = useClearTxIntentions();

  const contractAddress = SATSPROCURE_CONTRACT.address;
  const midlExplorerUrl = import.meta.env.VITE_BLOCKSCOUT_URL || 'https://blockscout.regtest.midl.xyz';

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
    // TODO: Load invoices by reading contract state/events.
  }, []);

  const executeMidlContractCall = useCallback(async (data: `0x${string}`) => {
    if (!wallet.connected || !wallet.address) {
      throw new Error('Wallet not connected');
    }
    if (!isConfiguredContractAddress(contractAddress)) {
      throw new Error('Smart contract address is not configured');
    }

    clearTxIntentions();

    try {
      await addTxIntentionAsync({
        reset: true,
        from: wallet.address,
        intention: {
          evmTransaction: {
            to: contractAddress as `0x${string}`,
            data,
            value: 0n,
          },
        },
      });

      const btcTx = await finalizeBTCTransactionAsync({ from: wallet.address });
      const btcTxId = btcTx.tx.id;
      const signedTransactions = await signIntentionsAsync({ txId: btcTxId });

      if (signedTransactions.length === 0) {
        throw new Error('No signed Midl transaction returned');
      }

      const evmTxHashes = await sendBTCTransactionsAsync({
        serializedTransactions: signedTransactions,
        btcTransaction: btcTx.tx.hex,
      });

      if (evmTxHashes.length === 0) {
        throw new Error('No EVM transaction hash returned');
      }

      return {
        evmTxHash: evmTxHashes[0],
        btcTxId,
      };
    } finally {
      clearTxIntentions();
    }
  }, [
    addTxIntentionAsync,
    clearTxIntentions,
    contractAddress,
    finalizeBTCTransactionAsync,
    sendBTCTransactionsAsync,
    signIntentionsAsync,
    wallet.address,
    wallet.connected,
  ]);

  // ============================================================
  // Connect Wallet (Xverse via Midl Connector)
  // ============================================================
  const connectWallet = useCallback(async () => {
    setIsProcessing(true);

    if (!isXverseInstalled()) {
      addNotification({
        type: 'error',
        title: 'Xverse Wallet Required',
        message: 'Please install Xverse Wallet extension to use SatsProcure.',
      });
      setIsProcessing(false);
      window.open('https://www.xverse.app/download', '_blank');
      return;
    }

    try {
      const accounts = await connectMidlAsync({});
      const paymentAccount = accounts.find(a => a.purpose === 'payment') ?? accounts[0];

      if (!paymentAccount) {
        throw new Error('No payment account returned from wallet');
      }

      let balanceSats = 0;
      try {
        const bal = await getXverseBalance();
        balanceSats = bal.total;
      } catch {
        // Balance fetch can fail on regtest; not fatal.
      }

      setWallet({
        connected: true,
        address: paymentAccount.address,
        publicKey: paymentAccount.publicKey,
        balance: balanceSats,
        network: 'Midl Regtest',
        mode: 'real',
      });

      addNotification({
        type: 'success',
        title: t('walletConnected'),
        message: `${t('walletConnectedMsg')} ${paymentAccount.address.slice(0, 10)}...${paymentAccount.address.slice(-6)}`,
      });
    } catch (err: unknown) {
      if (isUserRejectedError(err)) {
        addNotification({
          type: 'warning',
          title: t('connectionCancelled'),
          message: t('connectionCancelledMsg'),
        });
      } else {
        addNotification({
          type: 'error',
          title: t('connectionError'),
          message: getErrorMessage(err) || t('connectionErrorMsg'),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [addNotification, connectMidlAsync, t]);

  // ============================================================
  // Disconnect Wallet
  // ============================================================
  const disconnectWallet = useCallback(() => {
    void disconnectMidlAsync().catch(() => {
      // Non-fatal cleanup failure
    });
    void disconnectXverse();

    setWallet(INITIAL_WALLET);
    setRole(null);
    setInvoices([]);

    addNotification({
      type: 'info',
      title: t('walletDisconnected'),
      message: t('walletDisconnectedMsg'),
    });
  }, [addNotification, disconnectMidlAsync, t]);

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
    if (!wallet.connected || !wallet.address) {
      addNotification({
        type: 'error',
        title: 'Wallet not connected',
        message: 'Please connect your wallet first.',
      });
      throw new Error('Wallet not connected');
    }

    if (!isAddress(data.buyerAddress)) {
      addNotification({
        type: 'error',
        title: 'Invalid buyer address',
        message: 'Buyer address must be a valid EVM address (0x...).',
      });
      throw new Error('Invalid buyer address');
    }

    setIsProcessing(true);
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const invoiceNumber = generateInvoiceNumber();
    const invoiceId = uuidv4();

    try {
      const calldata = encodeCreateInvoice(
        invoiceId,
        data.buyerAddress as `0x${string}`,
        BigInt(totalAmount),
        invoiceNumber
      );

      addNotification({
        type: 'info',
        title: 'Midl Contract Call',
        message: 'Broadcasting SatsProcure.createInvoice() to Midl...',
      });

      const { evmTxHash } = await executeMidlContractCall(calldata);

      const invoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        supplier: wallet.address,
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
        contractAddress,
        txHash: evmTxHash,
      };

      setInvoices(prev => [invoice, ...prev]);

      addNotification({
        type: 'success',
        title: t('invoiceCreated'),
        message: `${invoice.invoiceNumber} created on-chain. TX: ${evmTxHash.slice(0, 16)}...`,
        txHash: evmTxHash,
      });
    } catch (err: unknown) {
      addNotification({
        type: 'error',
        title: 'Invoice creation failed',
        message: getErrorMessage(err),
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [addNotification, contractAddress, executeMidlContractCall, t, wallet.address, wallet.connected]);

  // ============================================================
  // Pay Invoice (On-Chain via Midl + Local State)
  // ============================================================
  const payInvoice = useCallback(async (invoiceId: string, partialAmount?: number) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    if (invoice.status !== 'pending' && invoice.status !== 'partial') {
      addNotification({
        type: 'warning',
        title: 'Invoice not payable',
        message: 'Only pending or partial invoices can be paid.',
      });
      return;
    }

    const remaining = invoice.totalAmount - invoice.amountPaid;
    const payAmount = partialAmount ?? remaining;

    if (!Number.isFinite(payAmount) || payAmount <= 0 || payAmount > remaining) {
      addNotification({
        type: 'error',
        title: 'Invalid payment amount',
        message: `Payment must be greater than 0 and not exceed ${remaining.toLocaleString()} sats.`,
      });
      return;
    }

    setIsProcessing(true);

    addNotification({
      type: 'info',
      title: t('processingPayment'),
      message: `Broadcasting SatsProcure.payInvoice(${payAmount.toLocaleString()} sats) ...`,
    });

    try {
      const calldata = encodePayInvoice(invoiceId, BigInt(payAmount));
      const { evmTxHash } = await executeMidlContractCall(calldata);

      const newAmountPaid = invoice.amountPaid + payAmount;
      const fullyPaid = newAmountPaid >= invoice.totalAmount;

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
              ...inv,
              amountPaid: newAmountPaid,
              status: fullyPaid ? 'escrowed' as const : 'partial' as const,
              txHash: evmTxHash,
              contractAddress,
            }
            : inv
        )
      );

      try {
        const bal = await getXverseBalance();
        setWallet(prev => ({ ...prev, balance: bal.total }));
      } catch {
        // Balance refresh can fail
      }

      addNotification({
        type: 'success',
        title: fullyPaid ? 'Invoice escrowed' : 'Partial payment recorded',
        message: fullyPaid
          ? `Invoice fully funded and escrowed. TX: ${evmTxHash.slice(0, 16)}...`
          : `Installment ${payAmount.toLocaleString()} sats recorded. Remaining ${(invoice.totalAmount - newAmountPaid).toLocaleString()} sats.`,
        txHash: evmTxHash,
      });
    } catch (err: unknown) {
      if (isUserRejectedError(err)) {
        addNotification({
          type: 'warning',
          title: t('paymentCancelled'),
          message: t('paymentCancelledMsg'),
        });
      } else {
        addNotification({
          type: 'error',
          title: t('paymentFailed'),
          message: getErrorMessage(err) || t('paymentFailedMsg'),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [addNotification, contractAddress, executeMidlContractCall, invoices, t]);

  // ============================================================
  // Confirm Receipt (On-Chain via Midl)
  // ============================================================
  const confirmReceipt = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    if (invoice.status !== 'escrowed') {
      addNotification({
        type: 'warning',
        title: 'Invalid invoice state',
        message: 'Receipt can only be confirmed when invoice is escrowed.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const calldata = encodeConfirmReceipt(invoiceId);
      addNotification({
        type: 'info',
        title: 'Midl Contract Call',
        message: 'Broadcasting SatsProcure.confirmReceipt() ...',
      });

      const { evmTxHash } = await executeMidlContractCall(calldata);

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
              ...inv,
              status: 'paid' as const,
              amountReleased: inv.amountPaid,
              paidAt: new Date().toISOString(),
              contractAddress,
              txHash: evmTxHash,
            }
            : inv
        )
      );

      addNotification({
        type: 'success',
        title: 'Funds Released - On-Chain Confirmed',
        message: `Receipt confirmed. TX: ${evmTxHash.slice(0, 16)}...`,
        txHash: evmTxHash,
      });
    } catch (err: unknown) {
      addNotification({
        type: 'error',
        title: 'Confirm receipt failed',
        message: getErrorMessage(err),
      });
    } finally {
      setIsProcessing(false);
    }
  }, [addNotification, contractAddress, executeMidlContractCall, invoices]);

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
