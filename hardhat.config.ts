import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-contract-sizer';
import '@typechain/hardhat';
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x1111111111111111111111111111111111111111111111111111111111111111';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: 'https://rpc.ankr.com/eth',
      },
      accounts: [
        {
          privateKey: PRIVATE_KEY,
          balance: '1000000000000000000000000000000000000'
        }
      ]
    },
    mainnet: {
      url: 'https://rpc.ankr.com/eth',
      accounts: [PRIVATE_KEY],
      chainId: 1
    },
    arbitrum: {
      url: 'https://rpc.ankr.com/arbitrum',
      accounts: [PRIVATE_KEY],
      chainId: 42161
    },
    bsc: {
      url: 'https://rpc.ankr.com/bsc',
      accounts: [PRIVATE_KEY],
      chainId: 56
    }
  },
  solidity: {
    compilers: [
        {
            version: '0.8.17',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1_000_000,
                },
                viaIR: true,
            },
        }
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};

export default config;
