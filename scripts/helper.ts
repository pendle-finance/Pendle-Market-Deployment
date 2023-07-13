import hre from 'hardhat';
import { BigNumber as BN, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import ethereumConfiguration from '@pendle/core-v2/deployments/1-core.json';
import arbitrumConfiguration from '@pendle/core-v2/deployments/42161-core.json';
import bnbConfiguration from '@pendle/core-v2/deployments/56-core.json';

import { PendleContracts, SUPPORTED_CHAINS } from './types';
import { IERC20, IPAllAction, PendleMarketFactory, PendleYieldContractFactory } from '../typechain-types';
import { INF } from './consts';

export function getNetwork() {
    return {
        [1]: SUPPORTED_CHAINS.MAINNET,
        [56]: SUPPORTED_CHAINS.BSC,
        [42161]: SUPPORTED_CHAINS.ARBITRUM,
    }[hre.network.config.chainId!]!;
}

export function toWei(num: number): BN {
    return BN.from(Math.floor(10 ** 9 * num)).mul(10 ** 9);
}

export async function getContractAt<CType extends Contract>(abiType: string, address: string) {
    return (await hre.ethers.getContractAt(abiType, address)) as CType;
}

export async function verifyContract(contract: string, constructor: any[]) {
    try {
        await hre.run('verify:verify', {
            address: contract,
            constructorArguments: constructor,
        });
    } catch (err: any) {
        let errStr: string = err.toString();
        if (errStr.includes('Already Verified')) {
            console.log('[VERIFIED] Alr Verified');
        } else if (errStr.includes('network is hardhat.')) {
        } else {
            console.log('[FATAL] Error occured while verifying contract');
            console.log(errStr);
        }
    }
}

export async function deploy<CType extends Contract>(deployer: SignerWithAddress, abiType: string, args: any[]) {
    console.log(`Deploying ${abiType}...`);
    const contractFactory = await hre.ethers.getContractFactory(abiType);
    const contract = await contractFactory.connect(deployer).deploy(...args);
    await contract.deployed();
    console.log(`[DEPLOYED] ${abiType} / ${(await contract).address}`);
    await delay(15000, 'before verifying contract');
    await verifyContract(contract.address, args);
    return contract as CType;
}

export async function delay(ms: number, msg: string) {
    console.time(msg);
    if (hre.network.name !== 'hardhat') {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
    console.timeEnd(msg);
}

export async function getPendleContracts(): Promise<PendleContracts> {
    let config = {
        [SUPPORTED_CHAINS.MAINNET]: ethereumConfiguration,
        [SUPPORTED_CHAINS.ARBITRUM]: arbitrumConfiguration,
        [SUPPORTED_CHAINS.BSC]: bnbConfiguration,
    }[getNetwork()];

    return {
        router: await getContractAt<IPAllAction>('IPAllAction', config.router),
        marketFactory: await getContractAt<PendleMarketFactory>('PendleMarketFactory', config.marketFactory),
        yieldContractFactory: await getContractAt<PendleYieldContractFactory>(
            'PendleYieldContractFactory',
            config.yieldContractFactory
        ),
    };
}

export function JSONReplacerBigNum(key: string, value: any): string {
    if (typeof value == 'object' && 'type' in value && value['type'] === 'BigNumber') {
        return BN.from(value['hex']).toString();
    }
    return value;
}

export async function safeApproveInf(deployer: SignerWithAddress, token: string, to: string) {
    const contract = await getContractAt<IERC20>('IERC20', token);
    const allowance = await contract.allowance(deployer.address, to);
    if (allowance.lt(INF.div(2))) await contract.connect(deployer).approve(to, INF);
}

