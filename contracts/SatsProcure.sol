// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SatsProcure
 * @dev Simple procurement contract for creating and paying invoices.
 * Designed to work with EVM-compatible chains or simulated environments.
 * Updated with Escrow and Partial Payment features.
 */
contract SatsProcure {
    
    struct Invoice {
        uint256 id;
        string invoiceNumber;
        address payable supplier;
        address buyer;
        uint256 amount;
        uint256 createdAt;
        uint256 dueDate;
        string notes;
        bool isPaid;
        bool isCancelled;
        uint256 amountPaid;     // Track total amount paid by buyer
        uint256 amountReleased; // Track amount released to supplier
    }

    uint256 public invoiceCount;
    mapping(uint256 => Invoice) public invoices;
    mapping(string => uint256) public invoiceNumberToId;

    event InvoiceCreated(
        uint256 indexed id,
        string invoiceNumber,
        address indexed supplier,
        address indexed buyer,
        uint256 amount,
        uint256 dueDate
    );

    event PaymentReceived(
        uint256 indexed id,
        address indexed payer,
        uint256 amount,
        uint256 totalPaid
    );

    event FundsReleased(
        uint256 indexed id,
        address indexed supplier,
        uint256 amount
    );

    event InvoiceCancelled(
        uint256 indexed id,
        string invoiceNumber
    );

    // Mappings to track user invoices efficiently
    mapping(address => uint256[]) public supplierInvoices;
    mapping(address => uint256[]) public buyerInvoices;

    /**
     * @dev Create a new invoice.
     */
    function createInvoice(
        string memory _invoiceNumber,
        address _buyer,
        uint256 _amount,
        uint256 _dueDate,
        string memory _notes
    ) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_buyer != address(0), "Invalid buyer address");
        require(bytes(_invoiceNumber).length > 0, "Invoice number is required");
        require(invoiceNumberToId[_invoiceNumber] == 0, "Invoice number already exists");

        invoiceCount++;
        
        invoices[invoiceCount] = Invoice({
            id: invoiceCount,
            invoiceNumber: _invoiceNumber,
            supplier: payable(msg.sender),
            buyer: _buyer,
            amount: _amount,
            createdAt: block.timestamp,
            dueDate: _dueDate,
            notes: _notes,
            isPaid: false,
            isCancelled: false,
            amountPaid: 0,
            amountReleased: 0
        });

        invoiceNumberToId[_invoiceNumber] = invoiceCount;
        
        // Track for efficient retrieval
        supplierInvoices[msg.sender].push(invoiceCount);
        buyerInvoices[_buyer].push(invoiceCount);

        emit InvoiceCreated(invoiceCount, _invoiceNumber, msg.sender, _buyer, _amount, _dueDate);
    }

    /**
     * @dev Pay an invoice (Installments / Partial Payment supported).
     * Funds are held in Escrow until released.
     */
    function payInvoice(uint256 _id) public payable {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(!invoice.isPaid, "Invoice is already fully paid");
        require(!invoice.isCancelled, "Invoice is cancelled");
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(invoice.amountPaid + msg.value <= invoice.amount, "Payment exceeds remaining amount");

        invoice.amountPaid += msg.value;

        if (invoice.amountPaid >= invoice.amount) {
            invoice.isPaid = true;
        }

        // Funds are voluntarily held in the contract (Escrow)
        // No transfer to supplier here.

        emit PaymentReceived(_id, msg.sender, msg.value, invoice.amountPaid);
    }

    /**
     * @dev Confirm receipt functionality for Buyer.
     * Releases held funds to the Supplier.
     */
    function confirmReceipt(uint256 _id) public {
        Invoice storage invoice = invoices[_id];
        
        require(invoice.id != 0, "Invoice does not exist");
        require(msg.sender == invoice.buyer, "Only buyer can confirm receipt");
        
        uint256 amountToRelease = invoice.amountPaid - invoice.amountReleased;
        require(amountToRelease > 0, "No funds to release");

        invoice.amountReleased += amountToRelease;

        (bool success, ) = invoice.supplier.call{value: amountToRelease}("");
        require(success, "Transfer to supplier failed");

        emit FundsReleased(_id, invoice.supplier, amountToRelease);
    }

    /**
     * @dev Cancel an unpaid invoice.
     * If partial payments exist, they are refunded to the Buyer.
     */
    function cancelInvoice(uint256 _id) public {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(msg.sender == invoice.supplier, "Only supplier can cancel");
        require(!invoice.isPaid, "Cannot cancel fully paid invoice");
        require(!invoice.isCancelled, "Invoice is already cancelled");

        invoice.isCancelled = true;

        // Refund any partial payments to Buyer
        if (invoice.amountPaid > 0) {
            uint256 refundAmount = invoice.amountPaid - invoice.amountReleased;
            if (refundAmount > 0) {
                // Assuming all paid funds are held. Released funds are already sent.
                // Reset amountPaid or just transfer? 
                // We leave amountPaid as record, but transfer the funds back.
                (bool success, ) = invoice.buyer.call{value: refundAmount}("");
                require(success, "Refund to buyer failed");
            }
        }

        emit InvoiceCancelled(_id, invoice.invoiceNumber);
    }

    /**
     * @dev Get invoice details.
     */
    function getInvoice(uint256 _id) public view returns (Invoice memory) {
        return invoices[_id];
    }

    /**
     * @dev Get all invoices where the caller is the supplier.
     */
    function getMySupplierInvoices() public view returns (Invoice[] memory) {
        uint256[] memory ids = supplierInvoices[msg.sender];
        Invoice[] memory myInvoices = new Invoice[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            myInvoices[i] = invoices[ids[i]];
        }
        return myInvoices;
    }

    /**
     * @dev Get all invoices where the caller is the buyer.
     */
    function getMyBuyerInvoices() public view returns (Invoice[] memory) {
        uint256[] memory ids = buyerInvoices[msg.sender];
        Invoice[] memory myInvoices = new Invoice[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            myInvoices[i] = invoices[ids[i]];
        }
        return myInvoices;
    }
}
