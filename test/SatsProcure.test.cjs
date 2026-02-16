
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
        const amount = ethers.parseEther("1.0");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

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
            expect(invoice.amountPaid).to.equal(0);
            expect(invoice.amountReleased).to.equal(0);

            const supplierInvoices = await satsProcure.connect(supplier).getMySupplierInvoices();
            expect(supplierInvoices.length).to.equal(1);

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

    // =========================================================
    // ESCROW + PARTIAL PAYMENTS
    // =========================================================
    describe("Escrow & Partial Payments", function () {
        const amount = ethers.parseEther("1.0");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

        beforeEach(async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-ESCROW",
                buyer.address,
                amount,
                dueDate,
                "Escrow Test"
            );
        });

        it("Should accept partial payment and hold funds in escrow", async function () {
            const halfAmount = ethers.parseEther("0.5");

            await satsProcure.connect(buyer).payInvoice(1, { value: halfAmount });

            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountPaid).to.equal(halfAmount);
            expect(invoice.isPaid).to.equal(false); // Not fully paid yet

            // Funds should be in the contract, NOT transferred to supplier
            const contractBalance = await ethers.provider.getBalance(await satsProcure.getAddress());
            expect(contractBalance).to.equal(halfAmount);
        });

        it("Should accept full payment in installments", async function () {
            const part1 = ethers.parseEther("0.3");
            const part2 = ethers.parseEther("0.3");
            const part3 = ethers.parseEther("0.4");

            await satsProcure.connect(buyer).payInvoice(1, { value: part1 });
            let invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountPaid).to.equal(part1);
            expect(invoice.isPaid).to.equal(false);

            await satsProcure.connect(buyer).payInvoice(1, { value: part2 });
            invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountPaid).to.equal(part1 + part2);
            expect(invoice.isPaid).to.equal(false);

            await satsProcure.connect(buyer).payInvoice(1, { value: part3 });
            invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountPaid).to.equal(amount);
            expect(invoice.isPaid).to.equal(true); // Now fully paid
        });

        it("Should fail if payment exceeds remaining amount", async function () {
            const tooMuch = ethers.parseEther("1.5");
            await expect(
                satsProcure.connect(buyer).payInvoice(1, { value: tooMuch })
            ).to.be.revertedWith("Payment exceeds remaining amount");
        });

        it("Should fail if invoice is already fully paid", async function () {
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });
            await expect(
                satsProcure.connect(buyer).payInvoice(1, { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("Invoice is already fully paid");
        });
    });

    // =========================================================
    // CONFIRM RECEIPT (Release Escrow)
    // =========================================================
    describe("Confirm Receipt (Escrow Release)", function () {
        const amount = ethers.parseEther("1.0");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

        beforeEach(async function () {
            await satsProcure.connect(supplier).createInvoice(
                "INV-CONFIRM",
                buyer.address,
                amount,
                dueDate,
                "Confirm Receipt Test"
            );
        });

        it("Should release funds to supplier when buyer confirms", async function () {
            // Pay full amount (held in escrow)
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });

            const supplierBalanceBefore = await ethers.provider.getBalance(supplier.address);

            // Buyer confirms receipt => releases funds
            await satsProcure.connect(buyer).confirmReceipt(1);

            const supplierBalanceAfter = await ethers.provider.getBalance(supplier.address);
            expect(supplierBalanceAfter).to.equal(supplierBalanceBefore + amount);

            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountReleased).to.equal(amount);
        });

        it("Should allow partial release after partial payment", async function () {
            const halfAmount = ethers.parseEther("0.5");

            // Pay half
            await satsProcure.connect(buyer).payInvoice(1, { value: halfAmount });

            const supplierBalanceBefore = await ethers.provider.getBalance(supplier.address);

            // Confirm receipt => releases the paid half
            await satsProcure.connect(buyer).confirmReceipt(1);

            const supplierBalanceAfter = await ethers.provider.getBalance(supplier.address);
            expect(supplierBalanceAfter).to.equal(supplierBalanceBefore + halfAmount);

            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.amountReleased).to.equal(halfAmount);
        });

        it("Should NOT allow non-buyer to confirm receipt", async function () {
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });
            await expect(
                satsProcure.connect(supplier).confirmReceipt(1)
            ).to.be.revertedWith("Only buyer can confirm receipt");
        });

        it("Should fail if no funds to release", async function () {
            await expect(
                satsProcure.connect(buyer).confirmReceipt(1)
            ).to.be.revertedWith("No funds to release");
        });
    });

    // =========================================================
    // CANCELLATION (with refund)
    // =========================================================
    describe("Cancellation & Refund", function () {
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

        it("Should allow supplier to cancel unpaid invoice", async function () {
            await satsProcure.connect(supplier).cancelInvoice(1);
            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.isCancelled).to.equal(true);
        });

        it("Should refund partial payment on cancellation", async function () {
            const halfAmount = ethers.parseEther("0.5");

            // Buyer pays partial
            await satsProcure.connect(buyer).payInvoice(1, { value: halfAmount });

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

            // Supplier cancels => refund to buyer
            await satsProcure.connect(supplier).cancelInvoice(1);

            const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
            // Buyer should get refund (minus gas from the payment tx is already spent)
            expect(buyerBalanceAfter).to.be.greaterThan(buyerBalanceBefore);

            const invoice = await satsProcure.getInvoice(1);
            expect(invoice.isCancelled).to.equal(true);
        });

        it("Should NOT allow buyer/others to cancel", async function () {
            await expect(
                satsProcure.connect(buyer).cancelInvoice(1)
            ).to.be.revertedWith("Only supplier can cancel");
        });

        it("Should NOT allow cancelling fully paid invoice", async function () {
            await satsProcure.connect(buyer).payInvoice(1, { value: amount });
            await expect(
                satsProcure.connect(supplier).cancelInvoice(1)
            ).to.be.revertedWith("Cannot cancel fully paid invoice");
        });
    });
});
