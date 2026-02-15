
import { ethers } from "hardhat";

async function main() {
    const SatsProcure = await ethers.getContractFactory("SatsProcure");
    const satsProcure = await SatsProcure.deploy();

    await satsProcure.waitForDeployment();

    console.log(
        `SatsProcure deployed to ${await satsProcure.getAddress()}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
