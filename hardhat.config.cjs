
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 31337 // Default Hardhat Network ID
        },
        midl: {
            url: "https://rpc.staging.midl.xyz",
            chainId: 15001,
            // accounts: [process.env.PRIVATE_KEY] // Only needed for real deployment
        }
    }
};
