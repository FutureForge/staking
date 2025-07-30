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
} from "./staking.contract";

// Get pending ERC20 rewards for a user
export function usePendingRewardsERC20() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  return useQuery({
    queryKey: queryKeys.staking.pendingRewards(address),
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
    queryKey: queryKeys.staking.nativeUserInfo(address),
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
      return await getPositionERC20(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get specific native position details
export function usePositionNative(positionId: number) {
  return useQuery({
    queryKey: queryKeys.staking.nativePosition(positionId),
    queryFn: async (): Promise<Position> => {
      return await getPositionNative(positionId);
    },
    enabled: positionId > 0,
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Get ERC20 token information
export function useERC20TokenInfo() {
  return useQuery({
    queryKey: queryKeys.staking.erc20TokenInfo,
    queryFn: async (): Promise<ERC20TokenInfo> => {
      const tokenAddress = await getERC20TokenAddress();

      return {
        address: tokenAddress,
        name: "Staking Token", // This would need to be fetched from the actual token contract
        symbol: "STK",
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

      return {
        name: "Staked Tokens",
        symbol: "STK",
        totalSupply: 0, // This would need to be fetched from the actual token contract
        balance: 0, // This would need to be fetched separately for a specific address
      };
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
      return await getUserInfoNative(address);
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

// Get ERC20 token balance for a user
export function useERC20TokenBalance() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  // Get token address
  const { data: tokenAddress } = useQuery({
    queryKey: queryKeys.staking.erc20TokenAddress,
    queryFn: async () => {
      return await getERC20TokenAddress();
    },
    refetchInterval: 60000, // refetch every minute
  });

  // Get ERC20 token balance using useWalletBalance
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useWalletBalance(
    {
      chain: chain1,
      address: address,
      client,
      tokenAddress: tokenAddress,
    },
    {
      enabled: !!address && !!tokenAddress,
      refetchInterval: 10000,
    }
  );

  return {
    data: Number(balanceData?.value || 0),
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  };
}

// Get bond token balances for a user (STOKEN and SNATIVE)
export function useBondTokenBalances() {
  const { account } = useUserChainInfo();
  const address = account?.address;

  // Get token addresses
  const { data: stokenAddress } = useQuery({
    queryKey: queryKeys.staking.stakingTokenAddress,
    queryFn: async () => {
      return await getStakingTokenAddress();
    },
    refetchInterval: 60000, // refetch every minute
  });

  const { data: snativeAddress } = useQuery({
    queryKey: queryKeys.staking.nativeStakingTokenAddress,
    queryFn: async () => {
      return await getNativeStakingTokenAddress();
    },
    refetchInterval: 60000, // refetch every minute
  });

  // Get STOKEN balance using useWalletBalance
  const {
    data: stokenBalanceData,
    isLoading: isStokenLoading,
    isError: isStokenError,
  } = useWalletBalance(
    {
      chain: chain1,
      address: address,
      client,
      tokenAddress: stokenAddress,
    },
    {
      enabled: !!address && !!stokenAddress,
      refetchInterval: 10000,
    }
  );

  // Get SNATIVE balance using useWalletBalance
  const {
    data: snativeBalanceData,
    isLoading: isSnativeLoading,
    isError: isSnativeError,
  } = useWalletBalance(
    {
      chain: chain1,
      address: address,
      client,
      tokenAddress: snativeAddress,
    },
    {
      enabled: !!address && !!snativeAddress,
      refetchInterval: 10000,
    }
  );

  return {
    data: {
      stokenBalance: Number(stokenBalanceData?.value || 0),
      snativeBalance: Number(snativeBalanceData?.value || 0),
    },
    isLoading: isStokenLoading || isSnativeLoading,
    isError: isStokenError || isSnativeError,
  };
}

// Get staking statistics
export function useStakingStats() {
  const { data: contractState } = useContractState();
  const { data: userPositions } = useUserPositionsERC20();
  const { data: userNativePositions } = useUserNativePositions();

  return useQuery({
    queryKey: queryKeys.staking.stats,
    queryFn: async (): Promise<StakingStats> => {
      if (!contractState) {
        return {
          totalPositions: 0,
          totalNativePositions: 0,
          averageStakeAmount: 0,
          averageNativeStakeAmount: 0,
        };
      }

      console.log({ userPositions });

      const totalPositions = userPositions?.length || 0;
      const totalNativePositions = userNativePositions?.length || 0;

      console.log({ totalPositions, totalNativePositions });

      const averageStakeAmount =
        contractState.totalStaked > 0
          ? contractState.totalStaked / Math.max(totalPositions, 1)
          : 0;

      const averageNativeStakeAmount =
        contractState.totalNativeStaked > 0
          ? contractState.totalNativeStaked / Math.max(totalNativePositions, 1)
          : 0;

      return {
        totalPositions,
        totalNativePositions,
        averageStakeAmount,
        averageNativeStakeAmount,
      };
    },
    enabled: !!contractState,
    refetchInterval: 5000, // refetch every 30 seconds
  });
}
