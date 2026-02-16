import { ethers } from 'ethers';

// =============================================================
// SatsProcure Smart Contract ABI (matches contracts/SatsProcure.sol)
// =============================================================
export const SATS_PROCURE_ABI = [
  // Write functions
  "function createInvoice(string _invoiceNumber, address _buyer, uint256 _amount, uint256 _dueDate, string _notes) public",
  "function payInvoice(uint256 _id) public payable",
  "function confirmReceipt(uint256 _id) public",
  "function cancelInvoice(uint256 _id) public",

  // Read functions
  "function getInvoice(uint256 _id) public view returns (tuple(uint256 id, string invoiceNumber, address supplier, address buyer, uint256 amount, uint256 createdAt, uint256 dueDate, string notes, bool isPaid, bool isCancelled, uint256 amountPaid, uint256 amountReleased))",
  "function invoiceCount() public view returns (uint256)",
  "function invoiceNumberToId(string) public view returns (uint256)",
  "function getMySupplierInvoices() public view returns (tuple(uint256 id, string invoiceNumber, address supplier, address buyer, uint256 amount, uint256 createdAt, uint256 dueDate, string notes, bool isPaid, bool isCancelled, uint256 amountPaid, uint256 amountReleased)[])",
  "function getMyBuyerInvoices() public view returns (tuple(uint256 id, string invoiceNumber, address supplier, address buyer, uint256 amount, uint256 createdAt, uint256 dueDate, string notes, bool isPaid, bool isCancelled, uint256 amountPaid, uint256 amountReleased)[])",

  // Events
  "event InvoiceCreated(uint256 indexed id, string invoiceNumber, address indexed supplier, address indexed buyer, uint256 amount, uint256 dueDate)",
  "event PaymentReceived(uint256 indexed id, address indexed payer, uint256 amount, uint256 totalPaid)",
  "event FundsReleased(uint256 indexed id, address indexed supplier, uint256 amount)",
  "event InvoiceCancelled(uint256 indexed id, string invoiceNumber)"
];

// =============================================================
// Contract Address — reads from env var set in Vercel dashboard
// =============================================================
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

// =============================================================
// Chain Configuration
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

export const LOCALHOST_PARAMS = {
  chainId: '0x7A69', // 31337
  chainName: 'Hardhat Local',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [],
};

// Auto-detect network based on deployed address (Hardhat default deterministic address)
const IS_LOCAL = CONTRACT_ADDRESS === "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const TARGET_NETWORK = IS_LOCAL ? LOCALHOST_PARAMS : MIDL_REGTEST_PARAMS;

// =============================================================
// Provider & Contract Access
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
  if (!CONTRACT_ADDRESS) throw new Error("Contract not deployed yet");
  if (!signerOrProvider) {
    const provider = getProvider();
    if (!provider) throw new Error("No wallet found");
    const signer = await provider.getSigner();
    signerOrProvider = signer;
  }
  return new ethers.Contract(CONTRACT_ADDRESS, SATS_PROCURE_ABI, signerOrProvider);
};

export const getReadOnlyContract = () => {
  if (!CONTRACT_ADDRESS) throw new Error("Contract not deployed yet");
  const provider = getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, SATS_PROCURE_ABI, provider);
};

// =============================================================
// Wallet Connection (via MetaMask to Midl EVM)
// =============================================================

export const connectWallet = async () => {
  const provider = getProvider();
  if (!provider) throw new Error("MetaMask or compatible wallet not found");

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
      await provider.send('wallet_addEthereumChain', [TARGET_NETWORK]);
    }
  }
};

// =============================================================
// Helpers
// =============================================================

export const isContractDeployed = (): boolean => {
  return !!CONTRACT_ADDRESS && CONTRACT_ADDRESS.length === 42 && CONTRACT_ADDRESS.startsWith("0x");
};

export const getTxExplorerUrl = (txHash: string): string => {
  return `${TARGET_NETWORK.blockExplorerUrls[0]}/tx/${txHash}`;
};

export const getContractExplorerUrl = (): string => {
  return `${TARGET_NETWORK.blockExplorerUrls[0]}/address/${CONTRACT_ADDRESS}`;
};
