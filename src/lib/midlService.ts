// Midl Contract Interaction Service
// Handles all smart contract calls via Midl SDK (executor pattern)

import { encodeFunctionData, keccak256, toHex } from 'viem';
import { SATSPROCURE_CONTRACT } from './contract';

/**
 * Generate a deterministic bytes32 invoice ID from a UUID string
 */
export function invoiceIdToBytes32(uuid: string): `0x${string}` {
    return keccak256(toHex(uuid));
}

/**
 * Encode createInvoice function call data
 */
export function encodeCreateInvoice(
    invoiceId: string,
    buyerAddress: `0x${string}`,
    amount: bigint,
    invoiceNumber: string
): `0x${string}` {
    const id = invoiceIdToBytes32(invoiceId);
    return encodeFunctionData({
        abi: SATSPROCURE_CONTRACT.abi,
        functionName: 'createInvoice',
        args: [id, buyerAddress, amount, invoiceNumber],
    });
}

/**
 * Encode payInvoice function call data
 */
export function encodePayInvoice(
    invoiceId: string,
    amount: bigint
): `0x${string}` {
    const id = invoiceIdToBytes32(invoiceId);
    return encodeFunctionData({
        abi: SATSPROCURE_CONTRACT.abi,
        functionName: 'payInvoice',
        args: [id, amount],
    });
}

/**
 * Encode confirmReceipt function call data
 */
export function encodeConfirmReceipt(
    invoiceId: string
): `0x${string}` {
    const id = invoiceIdToBytes32(invoiceId);
    return encodeFunctionData({
        abi: SATSPROCURE_CONTRACT.abi,
        functionName: 'confirmReceipt',
        args: [id],
    });
}

/**
 * Encode cancelInvoice function call data
 */
export function encodeCancelInvoice(
    invoiceId: string
): `0x${string}` {
    const id = invoiceIdToBytes32(invoiceId);
    return encodeFunctionData({
        abi: SATSPROCURE_CONTRACT.abi,
        functionName: 'cancelInvoice',
        args: [id],
    });
}
