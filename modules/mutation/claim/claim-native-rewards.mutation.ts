import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import StakingContractABI from "@/modules/blockchain/abi/staking.json";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { queryKeys } from "@/modules/query/query-keys";

export function useClaimNativeRewardsMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function claimAllNative()",
        params: [],
      });

      const transactionReceipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });

      if (transactionReceipt.status === "reverted") {
        throw new Error("Failed to claim native rewards");
      }

      return {
        transactionHash: transactionReceipt.transactionHash,
        stakeType: "native",
      };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.nativeUserInfo(account?.address) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.userNativePositions(account?.address) });
    },
    onError: (error, variables, context) => {
      console.error("Claim native rewards error:", error);
    },
  });
}