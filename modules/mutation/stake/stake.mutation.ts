import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import StakingContractABI from "@/modules/blockchain/abi/staking.json";
import StakingTokenContract from "@/modules/blockchain/abi/staking-token.json";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { queryKeys } from "@/modules/query/query-keys";

// Helper function to convert duration string to seconds
function getDurationInSeconds(duration: string): number {
  switch (duration) {
    case "15days":
      return 15 * 24 * 60 * 60; // 15 days in seconds
    case "30days":
      return 30 * 24 * 60 * 60; // 30 days in seconds
    case "60days":
      return 60 * 24 * 60 * 60; // 60 days in seconds
    case "90days":
      return 90 * 24 * 60 * 60; // 90 days in seconds
    case "180days":
      return 180 * 24 * 60 * 60; // 180 days in seconds
    case "365days":
      return 365 * 24 * 60 * 60; // 365 days in seconds
    default:
      return 0; // dynamic plan
  }
}

export function useStakeMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      duration,
      stakeType,
    }: {
      stakeType: "native" | "erc20";
      amount: number;
      duration:
        | "15days"
        | "30days"
        | "60days"
        | "90days"
        | "180days"
        | "365days";
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });
      const STAKING_CONTRACT_INTERFACE = new ethers.Interface(
        StakingContractABI
      );

      // Convert duration string to seconds
      const durationInSeconds = getDurationInSeconds(duration);

      if (stakeType === "native") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function stakeNative(uint256 _duration)",
          params: [BigInt(durationInSeconds)],
          value: ethers.parseEther(amount.toString()),
        });

        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to stake token");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          amount,
          duration,
          stakeType,
        };
      } else if (stakeType === "erc20") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function stake(uint256 _amount, uint256 _duration)",
          params: [
            ethers.parseEther(amount.toString()),
            BigInt(durationInSeconds),
          ],
        });

        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to stake ERC20 token");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          amount,
          duration,
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
      }
    },
    onError: (error, variables, context) => {
      console.error("Stake error:", error);
    },
  });
}
