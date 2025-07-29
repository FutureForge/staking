import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chain1, client } from "@/utils/configs";
import {
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,
  useActiveWalletChain,
} from "thirdweb/react";
import { queryKeys } from "../query-keys";

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
