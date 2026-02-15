
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SatsProcure", function () {
    let SatsProcure;
    let satsProcure;
    let supplier;
    let buyer;
    let otherAccount;

    beforeEach(async function () {
        [supplier, buyer, otherAccount] = await ethers.getSigners();
        SatsProcure = await ethers.getContractFactory("SatsProcure");
        satsProcure = await SatsProcure.deploy();
        await satsProcure.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should start with 0 invoices", async function () {
            expect(await satsProcure.invoiceCount()).to.equal(0);
        });
    });

    describe("Invoicing", function () {
        const amount = ethers.parseEther("1.0"); // 1 ETH/BTC
        const dueDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow

        it("Should create a new invoice", async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-001",
                buyer.address,
                amount,
                dueDate,
                "Test Invoice"
            );

            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.invoiceNumber).to.equal("INV-001");
            expect(invoice.supplier).to.equal(supplier.address);
            expect(invoice.buyer).to.equal(buyer.address);
            expect(invoice.amount).to.equal(amount);
            expect(invoice.isPaid).to.equal(false);

            // Verify supplier list
            const supplierInvoices = await satsProcure.connect(supplier).getMySupplierInvoices();
            expect(supplierInvoices.length).to.equal(1);

            // Verify buyer list
            const buyerInvoices = await satsProcure.connect(buyer).getMyBuyerInvoices();
            expect(buyerInvoices.length).to.equal(1);
        });

        it("Should fail if invoice number exists", async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-DUPLICATE",
                buyer.address,
                amount,
                dueDate,
                "First"
            );

            await expect(
                satsProcure.connect(supplier).createInvoice(
                    "INV-DUPLICATE",
                    buyer.address,
                    amount,
                    dueDate,
                    "Second"
                )
            ).to.be.revertedWith("Invoice number already exists");
        });
    });

    describe("Payments", function () {
        const amount = ethers.parseEther("1.0");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

        beforeEach(async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-PAY",
                buyer.address,
                amount,
                dueDate,
                "Pay Me"
            );
        });

        it("Should accept payment and transfer funds to supplier", async function () {
            // Check supplier balance before
            const initialBalance = await ethers.provider.getBalance(supplier.address);

            // Pay invoice
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });

            // Check invoice status
            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.isPaid).to.equal(true);

            // Check supplier balance after (should increase by amount)
            const finalBalance = await ethers.provider.getBalance(supplier.address);
            expect(finalBalance).to.equal(initialBalance + amount);
        });

        it("Should fail if payment amount is incorrect", async function () {
            const wrongAmount = ethers.parseEther("0.5");
            await expect(
                satsProcure.connect(buyer).payInvoice(1, { value: wrongAmount })
            ).to.be.revertedWith("Incorrect payment amount");
        });

        it("Should fail if invoice is already paid", async function () {
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });
            await expect(
                satsProcure.connect(buyer).payInvoice(1, { value: amount })
            ).to.be.revertedWith("Invoice is already paid");
        });
    });

    describe("Cancellation", function () {
        const amount = ethers.parseEther("1.0");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

        beforeEach(async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-CANCEL",
                buyer.address,
                amount,
                dueDate,
                "To Cancel"
            );
        });

        it("Should allow supplier to cancel", async function () {
            await satsProcure.connect(supplier).cancelInvoice(1);
            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.isCancelled).to.equal(true);
        });

        it("Should NOT allow buyer/others to cancel", async function () {
            await expect(
                satsProcure.connect(buyer).cancelInvoice(1)
            ).to.be.revertedWith("Only supplier can cancel");
        });

        it("Should NOT allow cancelling paid invoice", async function () {
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });
            await expect(
                satsProcure.connect(supplier).cancelInvoice(1)
            ).to.be.revertedWith("Cannot cancel paid invoice");
        });
    });
});
