
import { ethers } from 'ethers';

// =============================================================
// SatsProcure Smart Contract ABI
// =============================================================
export const SATS_PROCURE_ABI = [
  "function createInvoice(string _invoiceNumber, address _buyer, uint256 _amount, uint256 _dueDate, string _notes) public",
  "function payInvoice(uint256 _id) public payable",
  "function cancelInvoice(uint256 _id) public",
  "function getInvoice(uint256 _id) public view returns (tuple(uint256 id, string invoiceNumber, address supplier, address buyer, uint256 amount, uint256 createdAt, uint256 dueDate, string notes, bool isPaid, bool isCancelled))",
  "function invoiceCount() public view returns (uint256)",
  "function invoiceNumberToId(string) public view returns (uint256)",
  "event InvoiceCreated(uint256 indexed id, string invoiceNumber, address indexed supplier, address indexed buyer, uint256 amount, uint256 dueDate)",
  "event InvoicePaid(uint256 indexed id, string invoiceNumber, address indexed payer, uint256 amount, uint256 paidAt)",
  "event InvoiceCancelled(uint256 indexed id, string invoiceNumber)"
];

// =============================================================
// Contract Address Configuration
// 1. Checks VITE_CONTRACT_ADDRESS environment variable (Best for Vercel)
// 2. Falls back to a placeholder if not set
// =============================================================
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourContractAddressHere";

// =============================================================
// Midl Regtest Configuration
// =============================================================
export const MIDL_REGTEST_PARAMS = {
  chainId: '0x3A99', // 15001
  chainName: 'Midl Regtest',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.staging.midl.xyz'],
  blockExplorerUrls: ['https://blockscout.regtest.midl.xyz'],
};

// Target Network is always Midl Regtest for production
export const TARGET_NETWORK = MIDL_REGTEST_PARAMS;

// =============================================================
// Utilities
// =============================================================

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getReadOnlyProvider = () => {
  return new ethers.JsonRpcProvider(TARGET_NETWORK.rpcUrls[0]);
};

export const getContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!signerOrProvider) {
    const provider = getProvider();
    if (!provider) throw new Error("No Ethereum provider found");
    const signer = await provider.getSigner();
    signerOrProvider = signer;
  }
  return new ethers.Contract(CONTRACT_ADDRESS, SATS_PROCURE_ABI, signerOrProvider);
};

export const getReadOnlyContract = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, SATS_PROCURE_ABI, provider);
};

export const connectWallet = async () => {
  const provider = getProvider();
  if (!provider) throw new Error("MetaMask or compatible wallet not found");

  try {
    await provider.send("eth_requestAccounts", []);
    await switchNetwork();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    return {
      provider,
      signer,
      address,
      balance: ethers.formatEther(balance),
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const switchNetwork = async () => {
  const provider = getProvider();
  if (!provider) return;

  try {
    await provider.send('wallet_switchEthereumChain', [
      { chainId: TARGET_NETWORK.chainId }
    ]);
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await provider.send('wallet_addEthereumChain', [TARGET_NETWORK]);
      } catch (addError) {
        console.error("Failed to add network:", addError);
      }
    }
    console.error("Failed to switch network:", switchError);
  }
};

export const isContractDeployed = (): boolean => {
  return CONTRACT_ADDRESS !== "0xYourContractAddressHere" &&
    CONTRACT_ADDRESS.length === 42 &&
    CONTRACT_ADDRESS.startsWith("0x");
};

export const getTxExplorerUrl = (txHash: string): string => {
  // If we have a hash, return the explorer URL
  if (txHash && TARGET_NETWORK.blockExplorerUrls && TARGET_NETWORK.blockExplorerUrls.length > 0) {
    return `${TARGET_NETWORK.blockExplorerUrls[0]}/tx/${txHash}`;
  }
  return "#";
};

export const getContractExplorerUrl = (): string => {
  if (CONTRACT_ADDRESS && TARGET_NETWORK.blockExplorerUrls && TARGET_NETWORK.blockExplorerUrls.length > 0) {
    return `${TARGET_NETWORK.blockExplorerUrls[0]}/address/${CONTRACT_ADDRESS}`;
  }
  return "#";
};
