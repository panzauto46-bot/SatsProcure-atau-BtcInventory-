// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SatsProcure
 * @dev Simple procurement contract for creating and paying invoices.
 * Designed to work with EVM-compatible chains or simulated environments.
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

    event InvoicePaid(
        uint256 indexed id,
        string invoiceNumber,
        address indexed payer,
        uint256 amount,
        uint256 paidAt
    );

    event InvoiceCancelled(
        uint256 indexed id,
        string invoiceNumber
    );

    /**
     * @dev Create a new invoice.
     * @param _invoiceNumber Unique identifier for the invoice (e.g., INV-2024-001)
     * @param _buyer Address of the buyer responsible for payment
     * @param _amount Total amount in wei (or smallest unit of the currency)
     * @param _dueDate Timestamp when the payment is due
     * @param _notes Optional notes or description (can include IPFS hash for item details)
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
            isCancelled: false
        });

        invoiceNumberToId[_invoiceNumber] = invoiceCount;

        emit InvoiceCreated(invoiceCount, _invoiceNumber, msg.sender, _buyer, _amount, _dueDate);
    }

    /**
     * @dev Pay an existing invoice.
     * @param _id The ID of the invoice to pay.
     */
    function payInvoice(uint256 _id) public payable {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(!invoice.isPaid, "Invoice is already paid");
        require(!invoice.isCancelled, "Invoice is cancelled");
        require(msg.value == invoice.amount, "Incorrect payment amount");
        // Optional: restrict payer to be the buyer?
        // require(msg.sender == invoice.buyer, "Only designated buyer can pay"); 
        // Allowing anyone to pay on behalf of buyer is also a valid pattern.

        invoice.isPaid = true;

        (bool success, ) = invoice.supplier.call{value: msg.value}("");
        require(success, "Transfer to supplier failed");

        emit InvoicePaid(_id, invoice.invoiceNumber, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Cancel an unpaid invoice. Only the supplier can cancel.
     * @param _id The ID of the invoice to cancel.
     */
    function cancelInvoice(uint256 _id) public {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(msg.sender == invoice.supplier, "Only supplier can cancel");
        require(!invoice.isPaid, "Cannot cancel paid invoice");
        require(!invoice.isCancelled, "Invoice is already cancelled");

        invoice.isCancelled = true;

        emit InvoiceCancelled(_id, invoice.invoiceNumber);
    }

    /**
     * @dev Get invoice details.
     * @param _id The ID of the invoice.
     */
    function getInvoice(uint256 _id) public view returns (Invoice memory) {
        return invoices[_id];
    }
}
