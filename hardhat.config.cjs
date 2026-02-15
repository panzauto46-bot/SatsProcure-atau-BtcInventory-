
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 31337
        },
        midl: {
            url: process.env.RPC_URL || "https://rpc.staging.midl.xyz",
            chainId: 15001,
            ...(process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66
                ? { accounts: [process.env.PRIVATE_KEY] }
                : {}),
            gasPrice: 1000000000
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./src/artifacts"
    }
};
