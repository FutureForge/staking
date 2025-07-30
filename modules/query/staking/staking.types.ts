// Staking contract data interfaces based on staking.sol

export interface Position {
  amount: number;
  unlockTime: number;
  multiplierBps: number;
  duration: number;
  active: boolean;
  plan: "DYNAMIC" | "FIXED";
  isNative: boolean;
}

export interface UserInfo {
  weight: number;
  rewardDebt: number;
}

export interface ERC20TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  balance: number;
}

export interface StakingTokenInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  balance: number;
}

export interface EpochInfo {
  lastRewardTime: number;
  epochEnd: number;
  rewardPerEpoch: number;
  nativeRewardPerEpoch: number;
  epochLength: number;
}

export interface FeeInfo {
  feeDynamic: number;
  feeFixed: number;
  feeFixedEarly: number;
  recycleBps: number;
  accruedFees: number;
}

export interface ContractState {
  totalStaked: number;
  totalNativeStaked: number;
  totalWeight: number;
  totalNativeWeight: number;
  accRewardPerWeight: number;
  accNativeRewardPerWeight: number;
  nativePositionIds: number;
  currentPositionId: number;
}

export interface PendingRewards {
  erc20Rewards: number;
  nativeRewards: number;
}

export interface StakingStats {
  totalPositions: number;
  totalNativePositions: number;
  averageStakeAmount: number;
  averageNativeStakeAmount: number;
}

export interface BondTokenBalances {
  stokenBalance: number;
  snativeBalance: number;
}
