import Wallet, { AddressPurpose, BitcoinNetworkType, RpcErrorCode } from 'sats-connect';

// ============================================================
// Detection
// ============================================================

export function isXverseInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  // Check for Xverse/Bitcoin wallet providers injected by browser extensions
  return !!(
    (window as any).XverseProviders?.BitcoinProvider ||
    (window as any).BitcoinProvider ||
    (window as any).btc_providers?.length
  );
}

// ============================================================
// Connection
// ============================================================

export interface XverseConnectResult {
  paymentAddress: string;
  paymentPublicKey: string;
  ordinalsAddress: string;
  network: string;
}

export async function connectXverse(): Promise<XverseConnectResult> {
  const response = await Wallet.request('wallet_connect', {
    addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals],
    message: 'SatsProcure - B2B Procurement on Bitcoin',
    network: BitcoinNetworkType.Testnet,
  });

  if (response.status === 'success') {
    const paymentAddr = response.result.addresses.find(
      (a) => a.purpose === AddressPurpose.Payment
    );
    const ordinalsAddr = response.result.addresses.find(
      (a) => a.purpose === AddressPurpose.Ordinals
    );

    if (!paymentAddr) {
      throw new Error('No payment address returned from Xverse');
    }

    return {
      paymentAddress: paymentAddr.address,
      paymentPublicKey: paymentAddr.publicKey,
      ordinalsAddress: ordinalsAddr?.address ?? '',
      network: response.result.network?.bitcoin?.name ?? 'Testnet',
    };
  }

  if (response.error?.code === RpcErrorCode.USER_REJECTION) {
    throw new Error('USER_REJECTED');
  }
  throw new Error(response.error?.message ?? 'Xverse connection failed');
}

// ============================================================
// Balance
// ============================================================

export interface XverseBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

export async function getXverseBalance(): Promise<XverseBalance> {
  const response = await Wallet.request('getBalance', null);

  if (response.status === 'success') {
    return {
      confirmed: parseInt(response.result.confirmed, 10) || 0,
      unconfirmed: parseInt(response.result.unconfirmed, 10) || 0,
      total: parseInt(response.result.total, 10) || 0,
    };
  }

  throw new Error(response.error?.message ?? 'Failed to get balance');
}

// ============================================================
// Send Transfer (Pay Invoice)
// ============================================================

export interface XverseTransferResult {
  txid: string;
}

export async function sendXverseTransfer(
  recipientAddress: string,
  amountSats: number
): Promise<XverseTransferResult> {
  const response = await Wallet.request('sendTransfer', {
    recipients: [
      {
        address: recipientAddress,
        amount: amountSats,
      },
    ],
  });

  if (response.status === 'success') {
    return { txid: response.result.txid };
  }

  if (response.error?.code === RpcErrorCode.USER_REJECTION) {
    throw new Error('USER_REJECTED');
  }
  throw new Error(response.error?.message ?? 'Transfer failed');
}

// ============================================================
// Disconnect
// ============================================================

export async function disconnectXverse(): Promise<void> {
  try {
    await Wallet.request('wallet_disconnect', null);
  } catch {
    // Silently ignore - disconnect failure is non-critical
  }
}
