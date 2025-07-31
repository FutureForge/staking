import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chain1, client } from "@/utils/configs";
import {
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,
  useActiveWalletChain,
} from "thirdweb/react";
import { queryKeys } from "../query-keys";
import {
  getERC20TokenAddress,
  getNativeStakingTokenAddress,
  getStakingTokenAddress,
} from "..";

export function useUserChainInfo() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const activeChain = useActiveWalletChain();

  return { account, wallet, activeChain };
}

export function useUserNativeBalance() {
  const { account } = useUserChainInfo();
  const userAddress = account?.address;

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useWalletBalance(
    {
      chain: chain1,
      address: userAddress,
      client,
    },
    {
      enabled: !!userAddress,
      refetchInterval: 5000,
    }
  );

  return { balanceData, isBalanceLoading, isBalanceError };
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
