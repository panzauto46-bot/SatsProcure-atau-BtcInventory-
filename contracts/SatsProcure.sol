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
            isCancelled: false
        });

        invoiceNumberToId[_invoiceNumber] = invoiceCount;
        
        // Track for efficient retrieval
        supplierInvoices[msg.sender].push(invoiceCount);
        buyerInvoices[_buyer].push(invoiceCount);

        emit InvoiceCreated(invoiceCount, _invoiceNumber, msg.sender, _buyer, _amount, _dueDate);
    }

    /**
     * @dev Pay an existing invoice.
     */
    function payInvoice(uint256 _id) public payable {
        Invoice storage invoice = invoices[_id];

        require(invoice.id != 0, "Invoice does not exist");
        require(!invoice.isPaid, "Invoice is already paid");
        require(!invoice.isCancelled, "Invoice is cancelled");
        require(msg.value == invoice.amount, "Incorrect payment amount");

        invoice.isPaid = true;

        (bool success, ) = invoice.supplier.call{value: msg.value}("");
        require(success, "Transfer to supplier failed");

        emit InvoicePaid(_id, invoice.invoiceNumber, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Cancel an unpaid invoice.
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
