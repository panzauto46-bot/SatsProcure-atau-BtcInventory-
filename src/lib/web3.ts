
import { ethers } from 'ethers';

// Minimal ABI for SatsProcure contract based on the Solidity code we wrote
export const SATS_PROCURE_ABI = [
  "function createInvoice(string _invoiceNumber, address _buyer, uint256 _amount, uint256 _dueDate, string _notes) public",
  "function payInvoice(uint256 _id) public payable",
  "function cancelInvoice(uint256 _id) public",
  "function getInvoice(uint256 _id) public view returns (tuple(uint256 id, string invoiceNumber, address supplier, address buyer, uint256 amount, uint256 createdAt, uint256 dueDate, string notes, bool isPaid, bool isCancelled))",
  "event InvoiceCreated(uint256 indexed id, string invoiceNumber, address indexed supplier, address indexed buyer, uint256 amount, uint256 dueDate)",
  "event InvoicePaid(uint256 indexed id, string invoiceNumber, address indexed payer, uint256 amount, uint256 paidAt)",
  "event InvoiceCancelled(uint256 indexed id, string invoiceNumber)"
];

// Placeholder address for now - in a real scenario this would be in .env
export const CONTRACT_ADDRESS = "0xYourContractAddressHere"; 

// Network configuration for Midl Testnet (Simulated for now)
export const MIDL_TESTNET_PARAMS = {
  chainId: '0x1234', // Example Chain ID
  chainName: 'Midl Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.midl.dev'], // Placeholder
  blockExplorerUrls: ['https://explorer.midl.dev'],
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!signerOrProvider) {
    const provider = getProvider();
    if (!provider) throw new Error("No Ethereum provider found");
    signerOrProvider = provider;
  }
  return new ethers.Contract(CONTRACT_ADDRESS, SATS_PROCURE_ABI, signerOrProvider);
};

export const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) throw new Error("Metamask or compatible wallet not found");
    
    try {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        return { provider, signer, address };
    } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
    }
};

export const switchNetwork = async () => {
    const provider = getProvider();
    if (!provider) return;
    
    try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: MIDL_TESTNET_PARAMS.chainId }]);
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await provider.send('wallet_addEthereumChain', [MIDL_TESTNET_PARAMS]);
            } catch (addError) {
                console.error("Failed to add network:", addError);
            }
        }
        console.error("Failed to switch network:", switchError);
    }
};
