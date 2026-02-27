import { createConfig, regtest } from "@midl/core";
import { xverseConnector } from "@midl/connectors";

export const midlConfig = createConfig({
    networks: [regtest],
    connectors: [xverseConnector()],
    persist: true,
});

// Midl Regtest block explorer URLs
export const MIDL_EXPLORER = {
    blockscout: import.meta.env.VITE_BLOCKSCOUT_URL || "https://blockscout.regtest.midl.xyz",
    mempool: import.meta.env.VITE_MEMPOOL_URL || "https://mempool.regtest.midl.xyz",
};

// Get the transaction URL on blockscout
export function getMidlTxUrl(txHash: string): string {
    return `${MIDL_EXPLORER.blockscout}/tx/${txHash}`;
}

// Get the contract URL on blockscout
export function getMidlContractUrl(contractAddress: string): string {
    return `${MIDL_EXPLORER.blockscout}/address/${contractAddress}`;
}

// Get the mempool tx URL
export function getMidlMempoolTxUrl(txId: string): string {
    return `${MIDL_EXPLORER.mempool}/tx/${txId}`;
}
