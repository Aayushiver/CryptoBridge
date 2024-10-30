const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC, 
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
      network_id: 11155111, // Sepolia's network ID
      gas: 2000000, // Reduced gas limit
      gasPrice: null, // Dynamically set by the network
      maxFeePerGas: 30000000000, // 30 Gwei
      maxPriorityFeePerGas: 2000000000, // Set to 30 Gwei; adjust based on current rates
      skipDryRun: true, // Can help speed things up
    },
  },
  compilers: {
    solc: {
      version: "0.5.1",
    },
  },
};


// module.exports = {
//   networks: {
//     development: {
//       host: "127.0.0.1", // Localhost (default: none)
//       port: 7545,        // Standard Ganache port (default: none)
//       network_id: "5777",   // Any network (default: none)
//     }
//   },

//   // Configure compiler
//   compilers: {
//     solc: {
//       version: "0.5.1", // Fetch exact version from solc-bin (default: truffle's version)
//     }
//   },
// };