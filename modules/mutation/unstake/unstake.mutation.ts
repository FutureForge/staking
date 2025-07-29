import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import StakingContractABI from "@/modules/blockchain/abi/staking.json";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { queryKeys } from "@/modules/query/query-keys";

export function useUnstakeMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      stakeType,
    }: {
      stakeType: "native" | "erc20";
      positionId: number;
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      if (stakeType === "native") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function unstakeNative(uint256 _id)",
          params: [BigInt(positionId)],
        });

        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to unstake native tokens");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          positionId,
          stakeType,
        };
      } else if (stakeType === "erc20") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function unstake(uint256 _id)",
          params: [BigInt(positionId)],
        });

        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to unstake ERC20 tokens");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          positionId,
          stakeType,
        };
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries to refresh data
      if (variables.stakeType === "native") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.userNativePositions(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.nativeUserInfo(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.totalNativeStaked,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.totalNativeWeight,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.nativePosition(variables.positionId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.userPositions(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.userInfo(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.totalStaked,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.totalWeight,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.staking.position(variables.positionId),
        });
      }
    },
    onError: (error, variables, context) => {
      console.error("Unstake error:", error);
    },
  });
}
