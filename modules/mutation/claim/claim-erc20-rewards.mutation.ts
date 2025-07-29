import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { queryKeys } from "@/modules/query/query-keys";

export function useClaimERC20RewardsMutation() {
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
        method: "function claim()",
        params: [],
      });

      const transactionReceipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });

      if (transactionReceipt.status === "reverted") {
        throw new Error("Failed to claim ERC20 rewards");
      }

      return {
        transactionHash: transactionReceipt.transactionHash,
      };
    },
    meta: {
      loadingMessage: {
        title: "Claiming Rewards",
        description: "Processing your ERC20 rewards claim...",
      },
      successMessage: {
        title: "Rewards Claimed",
        description: "Your ERC20 rewards have been successfully claimed!",
      },
      errorMessage: {
        title: "Claim Failed",
        description: "Failed to claim ERC20 rewards. Please try again.",
      },
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.pendingRewards(account?.address),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.userInfo(account?.address),
      });
    },
    onError: (error, variables, context) => {
      console.error("Claim ERC20 rewards error:", error);
    },
  });
}
