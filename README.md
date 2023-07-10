# Pendle Market Deployer

This repository uses swETH as an example for developing/deploying a SY (EIP-5115) onto Pendle system.

## ENV preparation

In order to run the deployment script, it is required to create a `.env` file containing these two fields as in `.env_example`:
```
ETHERSCAN_KEY=...
PRIVATE_KEY=...
```

**Note**: `ETHERSCAN_KEY` should match the block explorer key of the network you are deploying. 


## Hardhat configuration

Firstly, configure your network (arbitrum/bsc/mainnet) inside `./hardhat.config.ts`.

Secondly, please also configure the `NETWORK` variable in `./scripts/configuration.ts` accordingly:

```ts
export const NETWORK = SUPPORTED_CHAINS.MAINNET;
```

## Deployment

### Contract and Parameters preparation

First step is to get your contract ready inside `./contracts/` folder as we currently have `./contracts/SwETHSY.sol`.

After that, you will have to fill in the parameters for `MarketConfiguration` in `./scripts/configuration.ts`. 

### Run deployment script

After contracts and parameters are ready, here are the steps to deploy:
```
yarn hardhat clean
yarn hardhat compile
yarn hardhat run scripts/deploy.ts --network <YOUR_NETWORK_NAME>
```

The first two commands will ensure that your contract verification runs through without any error.

Once the script is done, you should find your deployment result in `./deployments` folder.


## Seed liquidity

This step is only to ensure your market has minimum liquidity before you can actually seed a considerable amount of liquidity on Pendle UI. Please only proceed this step with the amount of liquidity you afford to lose.

### Parameters preparation

Inside `./scripts/configuration.ts`, please fill in the parameters for these two variables:

```ts
// address(0) is native
// Either you can put the address of the ERC20 underlying token here
export const UNDERLYING_TO_SEED_LIQUIDITY = ZERO_ADDRESS;

// We highly recommend you to put only very minimal amount to seed liquidity
// The rest of the liquidity should be seeded through our UI
// where you have better slippage control

// The toWei function multiply your input with 10^18 by default
// So do consider using customized amount (BN.from(10).pow(6) for example) for other cases
export const AMOUNT_TO_SEED = toWei(0.01);
```

### Run script

```
yarn hardhat run scripts/seed-liquidity.ts
```