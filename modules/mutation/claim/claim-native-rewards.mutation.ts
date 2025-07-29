import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      };
    },
    meta: {
      loadingMessage: {
        title: "Claiming Native Rewards",
        description: "Processing your native rewards claim...",
      },
      successMessage: {
        title: "Native Rewards Claimed",
        description: "Your native rewards have been successfully claimed!",
      },
      errorMessage: {
        title: "Claim Failed",
        description: "Failed to claim native rewards. Please try again.",
      },
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.nativeUserInfo(account?.address),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.userNativePositions(account?.address),
      });
    },
    onError: (error, variables, context) => {
      console.error("Claim native rewards error:", error);
    },
  });
}