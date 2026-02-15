export type UserRole = 'supplier' | 'buyer' | null;

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number; // in sats
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  supplierAddress: string;
  buyer: string;
  buyerAddress: string;
  items: InvoiceItem[];
  totalAmount: number; // in sats
  status: InvoiceStatus;
  createdAt: string;
  paidAt?: string;
  txHash?: string;
  contractAddress?: string;
  dueDate: string;
  notes?: string;
}

export type WalletMode = 'real';

export interface WalletState {
  connected: boolean;
  address: string;
  publicKey: string;
  balance: number; // in sats
  network: string;
  mode: WalletMode;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txHash?: string;
  timestamp: number;
}
