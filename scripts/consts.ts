import { BigNumber as BN, Contract } from 'ethers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const INF = BN.from(2).pow(256).sub(1);
export const SAFE_WAIT_TIME = 15000;
