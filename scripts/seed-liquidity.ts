import { ethers } from 'hardhat';
import { delay, getContractAt, getPendleContracts, safeApproveInf } from './helper';
import { SUPPORTED_CHAINS } from './types';
import { INF, SAFE_WAIT_TIME, ZERO_ADDRESS } from './consts';
import { AMOUNT_TO_SEED, UNDERLYING_TO_SEED_LIQUIDITY } from './configuration';
import marketAddresses from '../deployments/SY-swETH.json';
import { IERC20, IStandardizedYield } from '../typechain-types';

async function main() {
    const [deployer] = await ethers.getSigners();

    const pendleContracts = await getPendleContracts();

    let overrides = {};
    if (UNDERLYING_TO_SEED_LIQUIDITY == ZERO_ADDRESS) {
        overrides = {
            value: AMOUNT_TO_SEED,
        };
    } else {
        await safeApproveInf(deployer, UNDERLYING_TO_SEED_LIQUIDITY, pendleContracts.router.address);
        await delay(SAFE_WAIT_TIME, 'after approve underlying');
    }

    const SY = await getContractAt<IStandardizedYield>('IStandardizedYield', marketAddresses.SY);
    const PT = await getContractAt<IERC20>('IERC20', marketAddresses.PT);
    const YT = await getContractAt<IERC20>('IERC20', marketAddresses.YT);
    const LP = await getContractAt<IERC20>('IERC20', marketAddresses.market);

    // approve inf tokenIns for router
    await pendleContracts.router.approveInf([
        {
            tokens: await SY.getTokensIn(),
            spender: SY.address,
        },
    ]);
    await delay(SAFE_WAIT_TIME, 'after approveInf on router');

    await pendleContracts.router.mintSyFromToken(
        deployer.address,
        SY.address,
        0,
        {
            tokenMintSy: UNDERLYING_TO_SEED_LIQUIDITY,
            netTokenIn: AMOUNT_TO_SEED,
            tokenIn: UNDERLYING_TO_SEED_LIQUIDITY,
            bulk: ZERO_ADDRESS,
            pendleSwap: ZERO_ADDRESS,
            swapData: {
                swapType: 0,
                extCalldata: [],
                extRouter: ZERO_ADDRESS,
                needScale: false,
            },
        },
        { ...overrides }
    );
    await delay(SAFE_WAIT_TIME, 'after mintSyFromToken');

    await SY.approve(pendleContracts.router.address, INF);

    await delay(SAFE_WAIT_TIME, 'Before minting PY...');

    const amountSYToMintPY = (await SY.balanceOf(deployer.address)).div(2);

    await pendleContracts.router.mintPyFromSy(deployer.address, YT.address, amountSYToMintPY, 0);
    await delay(SAFE_WAIT_TIME, 'after mintPyFromSy');

    // approve inf pt for router
    await PT.approve(pendleContracts.router.address, INF);

    await delay(SAFE_WAIT_TIME, 'Before minting LP...');

    const balSY = await SY.balanceOf(deployer.address);
    const balPT = await PT.balanceOf(deployer.address);

    await pendleContracts.router.addLiquidityDualSyAndPt(deployer.address, LP.address, balSY, balPT, 0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
