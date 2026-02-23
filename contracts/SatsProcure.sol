// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SatsProcure
 * @notice Decentralized B2B Procurement & Settlement on Bitcoin (via Midl)
 * @dev Manages invoice lifecycle: Create → Pay → Confirm Receipt
 *      Deployed on Midl Regtest - Bitcoin's EVM execution layer
 */
contract SatsProcure {
    // ============================================================
    // Types
    // ============================================================

    enum InvoiceStatus {
        Pending,    // 0 - Invoice created, awaiting payment
        Partial,    // 1 - Partially paid
        Escrowed,   // 2 - Fully paid, awaiting receipt confirmation
        Paid,       // 3 - Receipt confirmed, funds released
        Cancelled   // 4 - Invoice cancelled
    }

    struct Invoice {
        address supplier;
        address buyer;
        uint256 amount;        // Total amount in sats
        uint256 amountPaid;    // Amount paid so far
        InvoiceStatus status;
        string invoiceNumber;
        uint256 createdAt;
        uint256 paidAt;
    }

    // ============================================================
    // State
    // ============================================================

    address public owner;
    mapping(bytes32 => Invoice) public invoices;
    bytes32[] public invoiceIds;
    uint256 public invoiceCount;

    // ============================================================
    // Events
    // ============================================================

    event InvoiceCreated(
        bytes32 indexed invoiceId,
        address indexed supplier,
        address buyer,
        uint256 amount,
        string invoiceNumber
    );

    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed payer,
        uint256 amount,
        uint256 totalPaid
    );

    event ReceiptConfirmed(
        bytes32 indexed invoiceId,
        address indexed confirmedBy
    );

    event InvoiceCancelled(
        bytes32 indexed invoiceId
    );

    // ============================================================
    // Constructor
    // ============================================================

    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    // Write Functions
    // ============================================================

    /**
     * @notice Create a new procurement invoice
     * @param invoiceId Unique identifier (generated off-chain)
     * @param buyer Address of the buyer
     * @param amount Total amount in sats
     * @param invoiceNumber Human-readable invoice number (e.g. INV-2026-1234)
     */
    function createInvoice(
        bytes32 invoiceId,
        address buyer,
        uint256 amount,
        string calldata invoiceNumber
    ) external {
        require(invoices[invoiceId].supplier == address(0), "Invoice already exists");
        require(buyer != address(0), "Invalid buyer address");
        require(amount > 0, "Amount must be greater than 0");

        invoices[invoiceId] = Invoice({
            supplier: msg.sender,
            buyer: buyer,
            amount: amount,
            amountPaid: 0,
            status: InvoiceStatus.Pending,
            invoiceNumber: invoiceNumber,
            createdAt: block.timestamp,
            paidAt: 0
        });

        invoiceIds.push(invoiceId);
        invoiceCount++;

        emit InvoiceCreated(invoiceId, msg.sender, buyer, amount, invoiceNumber);
    }

    /**
     * @notice Pay an invoice (supports partial payments)
     * @param invoiceId The invoice to pay
     * @param amount Amount to pay in sats
     */
    function payInvoice(bytes32 invoiceId, uint256 amount) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.supplier != address(0), "Invoice not found");
        require(
            inv.status == InvoiceStatus.Pending || inv.status == InvoiceStatus.Partial,
            "Invoice not payable"
        );
        require(amount > 0, "Amount must be greater than 0");

        inv.amountPaid += amount;

        if (inv.amountPaid >= inv.amount) {
            inv.status = InvoiceStatus.Escrowed;
            inv.amountPaid = inv.amount; // Cap at total
        } else {
            inv.status = InvoiceStatus.Partial;
        }

        emit InvoicePaid(invoiceId, msg.sender, amount, inv.amountPaid);
    }

    /**
     * @notice Confirm receipt of goods — releases escrowed funds
     * @param invoiceId The invoice to confirm
     */
    function confirmReceipt(bytes32 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.supplier != address(0), "Invoice not found");
        require(inv.status == InvoiceStatus.Escrowed, "Invoice not escrowed");

        inv.status = InvoiceStatus.Paid;
        inv.paidAt = block.timestamp;

        emit ReceiptConfirmed(invoiceId, msg.sender);
    }

    /**
     * @notice Cancel an invoice (only supplier can cancel pending invoices)
     * @param invoiceId The invoice to cancel
     */
    function cancelInvoice(bytes32 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.supplier != address(0), "Invoice not found");
        require(inv.supplier == msg.sender, "Only supplier can cancel");
        require(inv.status == InvoiceStatus.Pending, "Can only cancel pending invoices");

        inv.status = InvoiceStatus.Cancelled;

        emit InvoiceCancelled(invoiceId);
    }

    // ============================================================
    // Read Functions
    // ============================================================

    /**
     * @notice Get invoice details
     */
    function getInvoice(bytes32 invoiceId) external view returns (
        address supplier,
        address buyer,
        uint256 amount,
        uint256 amountPaid,
        uint8 status,
        string memory invoiceNumber
    ) {
        Invoice storage inv = invoices[invoiceId];
        return (
            inv.supplier,
            inv.buyer,
            inv.amount,
            inv.amountPaid,
            uint8(inv.status),
            inv.invoiceNumber
        );
    }

    /**
     * @notice Get total number of invoices created
     */
    function getInvoiceCount() external view returns (uint256) {
        return invoiceCount;
    }
}
