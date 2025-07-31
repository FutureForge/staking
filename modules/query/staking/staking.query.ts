import { useQuery } from "@tanstack/react-query";
import { useUserChainInfo } from "@/modules/query";
import { queryKeys } from "@/modules/query/query-keys";
import { useWalletBalance } from "thirdweb/react";
import { chain1, client } from "@/utils/configs";
import {
  Position,
  UserInfo,
  ERC20TokenInfo,
  StakingTokenInfo,
  EpochInfo,
  FeeInfo,
  ContractState,
  PendingRewards,
  StakingStats,
  BondTokenBalances,
} from "./staking.types";
import {
  getPendingRewardsERC20,
  getClaimableNativeRewards,
  getUserPositionsERC20,
  getUserNativePositions,
  getPositionERC20,
  getPositionNative,
  getUserInfoERC20,
  getUserInfoNative,
  getERC20TokenAddress,
  getStakingTokenAddress,
  getNativeStakingTokenAddress,
  getEpochInfo,
  getFeeInfo,
  getContractState,
  getNextEpochTime,
  getTimeUntilNextEpoch,
  getPositionExists,
  getNativePositionExists,
  getPositionOwner,
  getNativePositionOwner,
  getFixedFeeByDuration,
  getBPSDenom,
  getLastNativeRewardTime,
  getLastRewardTime,
  getPositions,
  getNativePositions,
  getERC20TokenSymbol,
  getStakingTokenSymbol,
  getNativeStakingTokenSymbol,
} from "./staking.contract";

// Get pending ERC20 rewards for a user
export function usePendingRewardsERC20() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.pendingRewardsERC20(address),
    queryFn: async (): Promise<number> => {
      if (!address) return 0;
      return await getPendingRewardsERC20(address);
    },
    enabled: !!address,
    refetchInterval: 10000, // refetch every 10 seconds
  });
}

// Get pending native rewards for a user
export function usePendingRewardsNative() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  const { data: userNativePositions } = useUserNativePositions();

  return useQuery({
    queryKey: queryKeys.staking.pendingRewardsNative(address),
    queryFn: async (): Promise<number> => {
      if (!address || !userNativePositions || userNativePositions.length === 0)
        return 0;

      let totalPending = 0;

      for (const positionId of userNativePositions) {
        try {
          const pending = await getClaimableNativeRewards(positionId);
          totalPending += pending;
        } catch (error) {
          console.error(
            `Error fetching native rewards for position ${positionId}:`,
            error
          );
        }
      }

      return totalPending;
    },
    enabled: !!address && !!userNativePositions,
    refetchInterval: 10000, // refetch every 10 seconds
  });
}

// Get user ERC20 positions
export function useUserPositionsERC20() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.userPositions(address),
    queryFn: async (): Promise<number[]> => {
      if (!address) return [];
      return await getUserPositionsERC20(address);
    },
    enabled: !!address,
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get user native positions
export function useUserNativePositions() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.userNativePositions(address),
    queryFn: async (): Promise<number[]> => {
      if (!address) return [];
      return await getUserNativePositions(address);
    },
    enabled: !!address,
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get specific ERC20 position details
export function usePositionERC20(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.position(positionId),
    queryFn: async (): Promise<Position> => {
      try {
        return await getPositionERC20(positionId);
      } catch (error) {
        console.error(
          `Error in usePositionERC20 for position ${positionId}:`,
          error
        );
        throw error;
      }
    },
    enabled: positionId > 0,
    refetchInterval: 30000, // refetch every 30 seconds
    retry: 1, // Only retry once
  });
}

// Get specific native position details
export function usePositionNative(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.nativePosition(positionId),
    queryFn: async (): Promise<Position> => {
      try {
        return await getPositionNative(positionId);
      } catch (error) {
        console.error(
          `Error in usePositionNative for position ${positionId}:`,
          error
        );
        throw error;
      }
    },
    enabled: positionId > 0,
    refetchInterval: 30000, // refetch every 30 seconds
    retry: 1, // Only retry once
  });
}

// Get ERC20 token information
export function useERC20TokenInfo() {
  return useQuery({
    queryKey: queryKeys.staking.erc20TokenInfo,
    queryFn: async (): Promise<ERC20TokenInfo> => {
      const tokenAddress = await getERC20TokenAddress();
      const tokenSymbol = await getERC20TokenSymbol();

      return {
        address: tokenAddress,
        name: "Staking Token", // This would need to be fetched from the actual token contract
        symbol: tokenSymbol,
        decimals: 18,
        totalSupply: 0, // This would need to be fetched from the actual token contract
        balance: 0, // This would need to be fetched separately for a specific address
      };
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get staking token information
export function useStakingTokenInfo() {
  return useQuery({
    queryKey: queryKeys.staking.stakingTokenInfo,
    queryFn: async (): Promise<StakingTokenInfo> => {
      const [stokenAddress, snativeAddress] = await Promise.all([
        getStakingTokenAddress(),
        getNativeStakingTokenAddress(),
      ]);
      const stokenSymbol = await getStakingTokenSymbol();

      return {
        name: "Staked Tokens",
        symbol: stokenSymbol,
        totalSupply: 0, // This would need to be fetched from the actual token contract
        balance: 0, // This would need to be fetched separately for a specific address
      };
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get ERC20 token symbol
export function useERC20TokenSymbol() {
  return useQuery({
    queryKey: queryKeys.staking.erc20TokenSymbol,
    queryFn: async (): Promise<string> => {
      return await getERC20TokenSymbol();
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get staking token symbol (for ERC20 staking)
export function useStakingTokenSymbol() {
  return useQuery({
    queryKey: queryKeys.staking.stakingTokenSymbol,
    queryFn: async (): Promise<string> => {
      return await getStakingTokenSymbol();
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get native staking token symbol
export function useNativeStakingTokenSymbol() {
  return useQuery({
    queryKey: queryKeys.staking.nativeStakingTokenSymbol,
    queryFn: async (): Promise<string> => {
      return await getNativeStakingTokenSymbol();
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get epoch information
export function useEpochInfo() {
  return useQuery({
    queryKey: queryKeys.staking.epochInfo,
    queryFn: async (): Promise<EpochInfo> => {
      return await getEpochInfo();
    },
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get next epoch time
export function useNextEpochTime() {
  return useQuery({
    queryKey: queryKeys.staking.nextEpochTime,
    queryFn: async (): Promise<Date> => {
      return await getNextEpochTime();
    },
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get time until next epoch
export function useTimeUntilNextEpoch() {
  return useQuery({
    queryKey: queryKeys.staking.timeUntilNextEpoch,
    queryFn: async (): Promise<number> => {
      return await getTimeUntilNextEpoch();
    },
    refetchInterval: 10000, // refetch every 10 seconds for countdown
  });
}

// Get fee information
export function useFeeInfo() {
  return useQuery({
    queryKey: queryKeys.staking.fees,
    queryFn: async (): Promise<FeeInfo> => {
      return await getFeeInfo();
    },
    refetchInterval: 60000, // refetch every minute
  });
}

// Get contract state
export function useContractState() {
  return useQuery({
    queryKey: queryKeys.staking.contractState,
    queryFn: async (): Promise<ContractState> => {
      return await getContractState();
    },
    refetchInterval: 15000, // refetch every 15 seconds
  });
}

// Get user info for ERC20 staking
export function useUserInfoERC20() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.userInfo(address),
    queryFn: async (): Promise<UserInfo> => {
      if (!address) {
        return { weight: 0, rewardDebt: 0 };
      }
      return await getUserInfoERC20(address);
    },
    enabled: !!address,
    refetchInterval: 10000, // refetch every 10 seconds
  });
}

// Get user info for native staking
export function useUserInfoNative() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.nativeUserInfo(address),
    queryFn: async (): Promise<UserInfo> => {
      if (!address) {
        return { weight: 0, rewardDebt: 0 };
      }
      return await getUserInfoNative(address!);
    },
    enabled: !!address,
    refetchInterval: 10000, // refetch every 10 seconds
  });
}

// Get all pending rewards for a user
export function usePendingRewards() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  const { data: erc20Rewards } = usePendingRewardsERC20();
  const { data: nativeRewards } = usePendingRewardsNative();

  return useQuery({
    queryKey: queryKeys.staking.pendingRewards(address),
    queryFn: async (): Promise<PendingRewards> => {
      return {
        erc20Rewards: erc20Rewards || 0,
        nativeRewards: nativeRewards || 0,
      };
    },
    enabled: !!address,
    refetchInterval: 10000, // refetch every 10 seconds
  });
}

// Get staking statistics
// export function useStakingStats() {
//   const { data: contractState } = useContractState();

//   return useQuery({
//     queryKey: queryKeys.staking.stats,
//     queryFn: async (): Promise<StakingStats> => {
//       if (!contractState) {
//         return {
//           totalPositions: 0,
//           totalNativePositions: 0,
//           averageStakeAmount: 0,
//           averageNativeStakeAmount: 0,
//         };
//       }

//       // Use the correct position IDs for each type
//       const totalPositions = contractState.currentPositionId - 1; // Current ID minus 1 gives us the highest assigned ID
//       const totalNativePositions = contractState.nativePositionIds; // This is the highest native position ID

//       const averageStakeAmount =
//         contractState.totalStaked > 0
//           ? contractState.totalStaked / Math.max(totalPositions, 1)
//           : 0;

//       const averageNativeStakeAmount =
//         contractState.totalNativeStaked > 0
//           ? contractState.totalNativeStaked / Math.max(totalNativePositions, 1)
//           : 0;

//       return {
//         totalPositions,
//         totalNativePositions,
//         averageStakeAmount,
//         averageNativeStakeAmount,
//       };
//     },
//     enabled: !!contractState,
//     refetchInterval: 5000, // refetch every 5 seconds
//   });
// }

// New queries for the updated contract

// Check if a position exists
export function usePositionExists(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.positionExists(positionId),
    queryFn: async (): Promise<boolean> => {
      return await getPositionExists(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000,
  });
}

// Check if a native position exists
export function useNativePositionExists(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.nativePositionExists(positionId),
    queryFn: async (): Promise<boolean> => {
      return await getNativePositionExists(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000,
  });
}

// Get position owner
export function usePositionOwner(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.positionOwner(positionId),
    queryFn: async (): Promise<string> => {
      return await getPositionOwner(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000,
  });
}

// Get native position owner
export function useNativePositionOwner(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.nativePositionOwner(positionId),
    queryFn: async (): Promise<string> => {
      return await getNativePositionOwner(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000,
  });
}

// Get fixed fee by duration
export function useFixedFeeByDuration(duration: number) {
  return useQuery({
    queryKey: queryKeys.staking.fixedFeeByDuration(duration),
    queryFn: async (): Promise<number> => {
      return await getFixedFeeByDuration(duration);
    },
    enabled: duration > 0,
    refetchInterval: 60000,
  });
}

// Get BPS denominator
export function useBPSDenom() {
  return useQuery({
    queryKey: queryKeys.staking.bpsDenom,
    queryFn: async (): Promise<number> => {
      return await getBPSDenom();
    },
    refetchInterval: 60000,
  });
}

// Get last native reward time
export function useLastNativeRewardTime() {
  return useQuery({
    queryKey: queryKeys.staking.lastNativeRewardTime,
    queryFn: async (): Promise<number> => {
      return await getLastNativeRewardTime();
    },
    refetchInterval: 30000,
  });
}

// Get last reward time
export function useLastRewardTime() {
  return useQuery({
    queryKey: queryKeys.staking.lastRewardTime,
    queryFn: async (): Promise<number> => {
      return await getLastRewardTime();
    },
    refetchInterval: 30000,
  });
}

// Get all positions for a user (returns Position structs)
export function usePositions(address: string) {
  return useQuery({
    queryKey: queryKeys.staking.positions(address),
    queryFn: async (): Promise<any[]> => {
      if (!address) return [];
      return await getPositions(address);
    },
    enabled: !!address,
    refetchInterval: 30000,
  });
}

// Get all native positions for a user (returns Position structs)
export function useNativePositions(address: string) {
  return useQuery({
    queryKey: queryKeys.staking.nativePositions(address),
    queryFn: async (): Promise<any[]> => {
      if (!address) return [];
      return await getNativePositions(address);
    },
    enabled: !!address,
    refetchInterval: 30000,
  });
}
