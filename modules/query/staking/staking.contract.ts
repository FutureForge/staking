import {
  getContract,
  getContractCustom,
  getContractEthers,
} from "@/modules/blockchain";
import { readContract } from "thirdweb";
import { chain1, client, chain1StakingContract } from "@/utils/configs";
import TokenContract from "@/modules/blockchain/abi/token.json";
import StakingContract from "@/modules/blockchain/abi/staking.json";

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
  const contract = getContractEthers({
    contractAddress: chain1StakingContract,
    abi: StakingContract,
  });

  const positions = await contract.userPositions(address);
  return positions.map((pos: bigint) => Number(pos));
}

export async function getUserNativePositions(
  address: string
): Promise<number[]> {
  const contract = getContractEthers({
    contractAddress: chain1StakingContract,
    abi: StakingContract,
  });

  const positions = await contract.userNativePositions(address);
  return positions.map((pos: bigint) => Number(pos));
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
  try {
    const contract = getContractEthers({
      contractAddress: chain1StakingContract,
      abi: StakingContract,
    });

    const position = await contract.positions(positionId);

    return {
      amount: Number(position.amount),
      unlockTime: Number(position.unlockTime),
      multiplierBps: Number(position.multiplierBps),
      duration: Number(position.duration),
      active: position.active,
      plan: Number(position.plan) === 0 ? "DYNAMIC" : "FIXED",
      isNative: position.isNative,
    };
  } catch (error) {
    console.error(`Error fetching ERC20 position ${positionId}:`, error);
    throw error;
  }
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
  try {
    const contract = getContractEthers({
      contractAddress: chain1StakingContract,
      abi: StakingContract,
    });

    const position = await contract.nativePositions(positionId);

    return {
      amount: Number(position.amount),
      unlockTime: Number(position.unlockTime),
      multiplierBps: Number(position.multiplierBps),
      duration: Number(position.duration),
      active: position.active,
      plan: Number(position.plan) === 0 ? "DYNAMIC" : "FIXED",
      isNative: position.isNative,
    };
  } catch (error) {
    console.error(`Error fetching native position ${positionId}:`, error);
    throw error;
  }
}

// User info related contract calls
export async function getUserInfoERC20(address: string): Promise<{
  weight: number;
  rewardDebt: number;
}> {
  try {
    const contract = getContractEthers({
      contractAddress: chain1StakingContract,
      abi: StakingContract,
    });

    const userInfo = await contract.userInfo(address);

    return {
      weight: Number(userInfo.weight),
      rewardDebt: Number(userInfo.rewardDebt),
    };
  } catch (error) {
    console.error(`Error fetching ERC20 user info for ${address}:`, error);
    throw error;
  }
}

export async function getUserInfoNative(address: string): Promise<{
  weight: number;
  rewardDebt: number;
}> {
  try {
    const contract = getContractEthers({
      contractAddress: chain1StakingContract,
      abi: StakingContract,
    });

    const userInfo = await contract.nativeUserInfo(address);

    return {
      weight: Number(userInfo.weight),
      rewardDebt: Number(userInfo.rewardDebt),
    };
  } catch (error) {
    console.error(`Error fetching native user info for ${address}:`, error);
    throw error;
  }
}

// Token info related contract calls
export async function getERC20TokenAddress(): Promise<string> {
  const contract = getContractEthers({
    contractAddress: chain1StakingContract,
    abi: StakingContract,
  });

  const tokenAddress = await contract.TOKEN();
  return tokenAddress;
}

export async function getStakingTokenAddress(): Promise<string> {
  const contract = getContractEthers({
    contractAddress: chain1StakingContract,
    abi: StakingContract,
  });

  const stokenAddress = await contract.STOKEN();
  return stokenAddress;
}

export async function getNativeStakingTokenAddress(): Promise<string> {
  const contract = getContractEthers({
    contractAddress: chain1StakingContract,
    abi: StakingContract,
  });

  const snativeAddress = await contract.SNATIVE();
  return snativeAddress;
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
  currentPositionId: number;
}> {
  try {
    const contract = getContractEthers({
      contractAddress: chain1StakingContract,
      abi: StakingContract,
    });

    const [
      totalStaked,
      totalNativeStaked,
      totalWeight,
      totalNativeWeight,
      accRewardPerWeight,
      accNativeRewardPerWeight,
      nativePositionIds,
      // currentPositionId,
    ] = await Promise.all([
      contract.totalStaked(),
      contract.totalNativeStaked(),
      contract.totalWeight(),
      contract.totalNativeWeight(),
      contract.accRewardPerWeight(),
      contract.accNativeRewardPerWeight(),
      contract.nativePositionIds(),
      // contract.currentPositionId(),
    ]);

    return {
      totalStaked: Number(totalStaked),
      totalNativeStaked: Number(totalNativeStaked),
      totalWeight: Number(totalWeight),
      totalNativeWeight: Number(totalNativeWeight),
      accRewardPerWeight: Number(accRewardPerWeight),
      accNativeRewardPerWeight: Number(accNativeRewardPerWeight),
      nativePositionIds: Number(nativePositionIds),
      // currentPositionId: Number(currentPositionId),
      currentPositionId: 10,
    };
  } catch (error) {
    console.error("Error fetching contract state:", error);
    throw error;
  }
}
