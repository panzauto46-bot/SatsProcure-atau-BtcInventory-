
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const SatsProcure = await hre.ethers.getContractFactory("SatsProcure");
    const satsProcure = await SatsProcure.deploy();

    await satsProcure.waitForDeployment();

    const address = await satsProcure.getAddress();
    console.log(`SatsProcure deployed to ${address}`);

    // Write address to file for easy reading
    const addressPath = path.resolve(__dirname, "../src/lib/contract_address.txt");
    fs.writeFileSync(addressPath, address);
    console.log(`Address saved to ${addressPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
