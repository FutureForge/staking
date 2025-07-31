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
      duration: "dynamic" | "30days" | "90days" | "180days" | "365days";
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      // Convert duration string to seconds
      const durationInSeconds = getDurationInSeconds(duration);

      console.log({ durationInSeconds, duration, amount });

      if (stakeType === "native") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function stakeNative(uint256 _duration)",
          params: [BigInt(durationInSeconds)],
          value: ethers.parseEther(amount.toString()),
        });

        console.log({ account, transaction });

        try {
          const transactionReceipt = await sendAndConfirmTransaction({
            account,
            transaction,
          });

          if (transactionReceipt.status === "reverted") {
            throw new Error("Failed to stake native tokens");
          }

          return {
            transactionHash: transactionReceipt.transactionHash,
            amount,
            duration,
            stakeType,
          };
        } catch (error) {
          // Handle transaction revert errors
          if (
            error instanceof Error &&
            error.message.includes("execution reverted")
          ) {
            throw new Error(
              "Transaction failed: Insufficient balance or invalid parameters"
            );
          }
          // Re-throw the error to be handled by the mutation's error handler
          throw error;
        }
      } else if (stakeType === "erc20") {
        const transaction = prepareContractCall({
          contract: stakingContract,
          method: "function stake(uint256 _amount, uint256 _duration)",
          params: [
            ethers.parseEther(amount.toString()),
            BigInt(durationInSeconds),
          ],
        });

        console.log({ transaction });

        try {
          const transactionReceipt = await sendAndConfirmTransaction({
            account,
            transaction,
          });

          if (transactionReceipt.status === "reverted") {
            throw new Error("Failed to stake ERC20 tokens");
          }

          return {
            transactionHash: transactionReceipt.transactionHash,
            amount,
            duration,
            stakeType,
          };
        } catch (error) {
          console.log({ error });
          // Handle transaction revert errors
          if (
            error instanceof Error &&
            error.message.includes("execution reverted")
          ) {
            throw new Error(
              "Transaction failed: Insufficient balance or invalid parameters"
            );
          }
          // Re-throw the error to be handled by the mutation's error handler
          throw error;
        }
      }
    },
    meta: {
      loadingMessage: {
        title: "Staking Tokens",
        description: "Processing your stake transaction...",
      },
      successMessage: {
        title: "Staking Successful",
        description: "Your tokens have been successfully staked!",
      },
      errorMessage: {
        title: "Staking Failed",
        description: "Failed to stake tokens. Please try again.",
      },
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
