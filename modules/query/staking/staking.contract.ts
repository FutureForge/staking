import { getContract, getContractCustom } from "@/modules/blockchain";
import { readContract } from "thirdweb";
import { chain1, client } from "@/utils/configs";
import TokenContract from "@/modules/blockchain/abi/token.json";

const stakingContract = getContract({ type: "staking" });

// Rewards related contract calls
export async function getPendingRewardsERC20(address: string): Promise<number> {
  const pendingRewards = await readContract({
    contract: stakingContract,
    method:
      "function pendingRewards(address _user) view returns (uint256 pending)",
    params: [address],
  });
  return Number(pendingRewards);
}

export async function getClaimableNativeRewards(
  positionId: number
): Promise<number> {
  const pending = await readContract({
    contract: stakingContract,
    method:
      "function claimableNativeRewards(uint256 positionId) view returns (uint256 pending)",
    params: [BigInt(positionId)],
  });
  return Number(pending);
}

// Position related contract calls
export async function getUserPositionsERC20(
  address: string
): Promise<number[]> {
  const positions = await readContract({
    contract: stakingContract,
    method:
      "function userPositions(address _user) view returns (uint256[] memory)",
    params: [address],
  });
  return (positions as readonly bigint[]).map((pos) => Number(pos));
}

export async function getUserNativePositions(
  address: string
): Promise<number[]> {
  const positions = await readContract({
    contract: stakingContract,
    method:
      "function userNativePositions(address _user) view returns (uint256[] memory)",
    params: [address],
  });
  return (positions as readonly bigint[]).map((pos) => Number(pos));
}

export async function getPositionERC20(positionId: number): Promise<{
  amount: number;
  unlockTime: number;
  multiplierBps: number;
  duration: number;
  active: boolean;
  plan: "DYNAMIC" | "FIXED";
  isNative: boolean;
}> {
  const position = await readContract({
    contract: stakingContract,
    method:
      "function positions(uint256) view returns ((uint128 amount, uint40 unlockTime, uint16 multiplierBps, uint32 duration, bool active, Plan plan, bool isNative))",
    params: [BigInt(positionId)],
  });

  const pos = position as unknown as {
    amount: bigint;
    unlockTime: bigint;
    multiplierBps: bigint;
    duration: bigint;
    active: boolean;
    plan: bigint;
    isNative: boolean;
  };

  return {
    amount: Number(pos.amount),
    unlockTime: Number(pos.unlockTime),
    multiplierBps: Number(pos.multiplierBps),
    duration: Number(pos.duration),
    active: pos.active,
    plan: Number(pos.plan) === 0 ? "DYNAMIC" : "FIXED",
    isNative: pos.isNative,
  };
}

export async function getPositionNative(positionId: number): Promise<{
  amount: number;
  unlockTime: number;
  multiplierBps: number;
  duration: number;
  active: boolean;
  plan: "DYNAMIC" | "FIXED";
  isNative: boolean;
}> {
  const position = await readContract({
    contract: stakingContract,
    method:
      "function nativePositions(uint256) view returns ((uint128 amount, uint40 unlockTime, uint16 multiplierBps, uint32 duration, bool active, Plan plan, bool isNative))",
    params: [BigInt(positionId)],
  });

  const pos = position as unknown as {
    amount: bigint;
    unlockTime: bigint;
    multiplierBps: bigint;
    duration: bigint;
    active: boolean;
    plan: bigint;
    isNative: boolean;
  };

  return {
    amount: Number(pos.amount),
    unlockTime: Number(pos.unlockTime),
    multiplierBps: Number(pos.multiplierBps),
    duration: Number(pos.duration),
    active: pos.active,
    plan: Number(pos.plan) === 0 ? "DYNAMIC" : "FIXED",
    isNative: pos.isNative,
  };
}

// User info related contract calls
export async function getUserInfoERC20(address: string): Promise<{
  weight: number;
  rewardDebt: number;
}> {
  const userInfo = await readContract({
    contract: stakingContract,
    method:
      "function userInfo(address) view returns ((uint128 weight, uint128 rewardDebt))",
    params: [address],
  });

  const info = userInfo as { weight: bigint; rewardDebt: bigint };

  return {
    weight: Number(info.weight),
    rewardDebt: Number(info.rewardDebt),
  };
}

export async function getUserInfoNative(address: string): Promise<{
  weight: number;
  rewardDebt: number;
}> {
  const userInfo = await readContract({
    contract: stakingContract,
    method:
      "function nativeUserInfo(address) view returns ((uint128 weight, uint128 rewardDebt))",
    params: [address],
  });

  const info = userInfo as { weight: bigint; rewardDebt: bigint };

  return {
    weight: Number(info.weight),
    rewardDebt: Number(info.rewardDebt),
  };
}

// Token info related contract calls
export async function getERC20TokenAddress(): Promise<string> {
  const tokenAddress = await readContract({
    contract: stakingContract,
    method: "function TOKEN() view returns (address)",
    params: [],
  });
  return tokenAddress as string;
}

export async function getStakingTokenAddress(): Promise<string> {
  const stokenAddress = await readContract({
    contract: stakingContract,
    method: "function STOKEN() view returns (address)",
    params: [],
  });
  return stokenAddress as string;
}

export async function getNativeStakingTokenAddress(): Promise<string> {
  const snativeAddress = await readContract({
    contract: stakingContract,
    method: "function SNATIVE() view returns (address)",
    params: [],
  });
  return snativeAddress as string;
}

// Epoch info related contract calls
export async function getEpochInfo(): Promise<{
  lastRewardTime: number;
  epochEnd: number;
  rewardPerEpoch: number;
  nativeRewardPerEpoch: number;
  epochLength: number;
}> {
  const [
    lastRewardTime,
    epochEnd,
    rewardPerEpoch,
    nativeRewardPerEpoch,
    epochLength,
  ] = await Promise.all([
    readContract({
      contract: stakingContract,
      method: "function lastRewardTime() view returns (uint40)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function epochEnd() view returns (uint40)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function rewardPerEpoch() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function nativeRewardPerEpoch() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function EPOCH_LENGTH() view returns (uint256)",
      params: [],
    }),
  ]);

  return {
    lastRewardTime: Number(lastRewardTime),
    epochEnd: Number(epochEnd),
    rewardPerEpoch: Number(rewardPerEpoch),
    nativeRewardPerEpoch: Number(nativeRewardPerEpoch),
    epochLength: Number(epochLength),
  };
}

// Helper function to get next epoch time
export async function getNextEpochTime(): Promise<Date> {
  const epochInfo = await getEpochInfo();
  // Add EPOCH_LENGTH to the current epochEnd to get the next epoch time
  const nextEpochTime = epochInfo.epochEnd + epochInfo.epochLength;
  return new Date(nextEpochTime * 1000); // Convert seconds to milliseconds for JavaScript Date
}

// Helper function to get time until next epoch
export async function getTimeUntilNextEpoch(): Promise<number> {
  const epochInfo = await getEpochInfo();
  const now = Math.floor(Date.now() / 1000);
  const nextEpochTime = epochInfo.epochEnd + epochInfo.epochLength;
  const timeLeft = nextEpochTime - now;
  return timeLeft > 0 ? timeLeft : 0;
}

// Fee info related contract calls
export async function getFeeInfo(): Promise<{
  feeDynamic: number;
  feeFixed: number;
  feeFixedEarly: number;
  recycleBps: number;
  accruedFees: number;
}> {
  const [feeDynamic, feeFixed, feeFixedEarly, recycleBps, accruedFees] =
    await Promise.all([
      readContract({
        contract: stakingContract,
        method: "function FEE_DYNAMIC() view returns (uint256)",
        params: [],
      }),
      readContract({
        contract: stakingContract,
        method: "function FEE_FIXED() view returns (uint256)",
        params: [],
      }),
      readContract({
        contract: stakingContract,
        method: "function FEE_FIXED_EARLY() view returns (uint256)",
        params: [],
      }),
      readContract({
        contract: stakingContract,
        method: "function recycleBps() view returns (uint256)",
        params: [],
      }),
      readContract({
        contract: stakingContract,
        method: "function accuredFees() view returns (uint256)",
        params: [],
      }),
    ]);

  return {
    feeDynamic: Number(feeDynamic),
    feeFixed: Number(feeFixed),
    feeFixedEarly: Number(feeFixedEarly),
    recycleBps: Number(recycleBps),
    accruedFees: Number(accruedFees),
  };
}

// Contract state related contract calls
export async function getContractState(): Promise<{
  totalStaked: number;
  totalNativeStaked: number;
  totalWeight: number;
  totalNativeWeight: number;
  accRewardPerWeight: number;
  accNativeRewardPerWeight: number;
  nativePositionIds: number;
}> {
  const [
    totalStaked,
    totalNativeStaked,
    totalWeight,
    totalNativeWeight,
    accRewardPerWeight,
    accNativeRewardPerWeight,
    nativePositionIds,
  ] = await Promise.all([
    readContract({
      contract: stakingContract,
      method: "function totalStaked() view returns (uint256)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function totalNativeStaked() view returns (uint256)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function totalWeight() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function totalNativeWeight() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function accRewardPerWeight() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function accNativeRewardPerWeight() view returns (uint128)",
      params: [],
    }),
    readContract({
      contract: stakingContract,
      method: "function nativePositionIds() view returns (uint256)",
      params: [],
    }),
  ]);

  return {
    totalStaked: Number(totalStaked),
    totalNativeStaked: Number(totalNativeStaked),
    totalWeight: Number(totalWeight),
    totalNativeWeight: Number(totalNativeWeight),
    accRewardPerWeight: Number(accRewardPerWeight),
    accNativeRewardPerWeight: Number(accNativeRewardPerWeight),
    nativePositionIds: Number(nativePositionIds),
  };
}
