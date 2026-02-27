// SatsProcure Smart Contract - deployed on Midl Regtest
// This contract manages invoice lifecycle on-chain

import { isAddress, zeroAddress } from 'viem';

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractAddress =
    typeof envAddress === 'string' && isAddress(envAddress)
        ? envAddress
        : zeroAddress;

export const SATSPROCURE_CONTRACT = {
    // Reads from VITE_CONTRACT_ADDRESS, falls back to zeroAddress when invalid/missing.
    address: contractAddress as `0x${string}`,

    abi: [
        // Constructor
        {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        // Events
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "invoiceId", type: "bytes32" },
                { indexed: true, internalType: "address", name: "supplier", type: "address" },
                { indexed: false, internalType: "address", name: "buyer", type: "address" },
                { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
                { indexed: false, internalType: "string", name: "invoiceNumber", type: "string" },
            ],
            name: "InvoiceCreated",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "invoiceId", type: "bytes32" },
                { indexed: true, internalType: "address", name: "payer", type: "address" },
                { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
                { indexed: false, internalType: "uint256", name: "totalPaid", type: "uint256" },
            ],
            name: "InvoicePaid",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "invoiceId", type: "bytes32" },
                { indexed: true, internalType: "address", name: "confirmedBy", type: "address" },
            ],
            name: "ReceiptConfirmed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "invoiceId", type: "bytes32" },
            ],
            name: "InvoiceCancelled",
            type: "event",
        },
        // Write Functions
        {
            inputs: [
                { internalType: "bytes32", name: "invoiceId", type: "bytes32" },
                { internalType: "address", name: "buyer", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "string", name: "invoiceNumber", type: "string" },
            ],
            name: "createInvoice",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "bytes32", name: "invoiceId", type: "bytes32" },
                { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "payInvoice",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "bytes32", name: "invoiceId", type: "bytes32" },
            ],
            name: "confirmReceipt",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "bytes32", name: "invoiceId", type: "bytes32" },
            ],
            name: "cancelInvoice",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        // Read Functions
        {
            inputs: [
                { internalType: "bytes32", name: "invoiceId", type: "bytes32" },
            ],
            name: "getInvoice",
            outputs: [
                { internalType: "address", name: "supplier", type: "address" },
                { internalType: "address", name: "buyer", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "uint256", name: "amountPaid", type: "uint256" },
                { internalType: "uint8", name: "status", type: "uint8" },
                { internalType: "string", name: "invoiceNumber", type: "string" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getInvoiceCount",
            outputs: [
                { internalType: "uint256", name: "", type: "uint256" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "owner",
            outputs: [
                { internalType: "address", name: "", type: "address" },
            ],
            stateMutability: "view",
            type: "function",
        },
    ],
} as const;
