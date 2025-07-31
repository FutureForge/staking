import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { queryKeys } from "@/modules/query/query-keys";

// Pause contract
export function usePauseMutation() {
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
        method: "function pause()",
        params: [],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to pause contract");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can pause contract");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Pausing Contract",
        description: "Pausing the staking contract...",
      },
      successMessage: {
        title: "Contract Paused",
        description: "The staking contract has been paused successfully!",
      },
      errorMessage: {
        title: "Pause Failed",
        description: "Failed to pause the contract. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.contractState,
      });
    },
    onError: (error) => {
      console.error("Pause error:", error);
    },
  });
}

// Unpause contract
export function useUnpauseMutation() {
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
        method: "function unpause()",
        params: [],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to unpause contract");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can unpause contract");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Unpausing Contract",
        description: "Unpausing the staking contract...",
      },
      successMessage: {
        title: "Contract Unpaused",
        description: "The staking contract has been unpaused successfully!",
      },
      errorMessage: {
        title: "Unpause Failed",
        description: "Failed to unpause the contract. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.contractState,
      });
    },
    onError: (error) => {
      console.error("Unpause error:", error);
    },
  });
}

// Fund epoch
export function useFundEpochMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reward }: { reward: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function fundEpoch(uint256 _reward)",
        params: [ethers.parseEther(reward.toString())],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to fund epoch");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          reward,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Insufficient balance or invalid reward amount");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Funding Epoch",
        description: "Funding the current epoch with rewards...",
      },
      successMessage: {
        title: "Epoch Funded",
        description: "The epoch has been funded successfully!",
      },
      errorMessage: {
        title: "Funding Failed",
        description: "Failed to fund the epoch. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.epochInfo,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.contractState,
      });
    },
    onError: (error) => {
      console.error("Fund epoch error:", error);
    },
  });
}

// Fund native epoch
export function useFundNativeEpochMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ value }: { value: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function fundNativeEpoch()",
        params: [],
        value: ethers.parseEther(value.toString()),
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to fund native epoch");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          value,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Insufficient balance or invalid value");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Funding Native Epoch",
        description: "Funding the current native epoch with rewards...",
      },
      successMessage: {
        title: "Native Epoch Funded",
        description: "The native epoch has been funded successfully!",
      },
      errorMessage: {
        title: "Funding Failed",
        description: "Failed to fund the native epoch. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.epochInfo,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.contractState,
      });
    },
    onError: (error) => {
      console.error("Fund native epoch error:", error);
    },
  });
}

// Set dynamic fee
export function useSetDynamicFeeMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fee }: { fee: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function setDynamicFee(uint256 _fee)",
        params: [BigInt(fee)],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to set dynamic fee");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          fee,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can set dynamic fee");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Setting Dynamic Fee",
        description: "Updating the dynamic fee...",
      },
      successMessage: {
        title: "Dynamic Fee Updated",
        description: "The dynamic fee has been updated successfully!",
      },
      errorMessage: {
        title: "Update Failed",
        description: "Failed to update the dynamic fee. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.fees,
      });
    },
    onError: (error) => {
      console.error("Set dynamic fee error:", error);
    },
  });
}

// Set epoch length
export function useSetEpochLengthMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ length }: { length: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function setEpochLength(uint256 _length)",
        params: [BigInt(length)],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to set epoch length");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          length,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can set epoch length");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Setting Epoch Length",
        description: "Updating the epoch length...",
      },
      successMessage: {
        title: "Epoch Length Updated",
        description: "The epoch length has been updated successfully!",
      },
      errorMessage: {
        title: "Update Failed",
        description: "Failed to update the epoch length. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.epochInfo,
      });
    },
    onError: (error) => {
      console.error("Set epoch length error:", error);
    },
  });
}

// Set fixed fees
export function useSetFixedFeesMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      durations, 
      feeBps 
    }: { 
      durations: number[]; 
      feeBps: number[] 
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function setFixedFees(uint256[] _durations, uint256[] _feeBps)",
        params: [
          durations.map(d => BigInt(d)),
          feeBps.map(f => BigInt(f)),
        ],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to set fixed fees");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          durations,
          feeBps,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can set fixed fees");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Setting Fixed Fees",
        description: "Updating the fixed fees...",
      },
      successMessage: {
        title: "Fixed Fees Updated",
        description: "The fixed fees have been updated successfully!",
      },
      errorMessage: {
        title: "Update Failed",
        description: "Failed to update the fixed fees. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.fees,
      });
    },
    onError: (error) => {
      console.error("Set fixed fees error:", error);
    },
  });
}

// Set recycle BPS
export function useSetRecycleBpsMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bps }: { bps: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function setRecycleBps(uint256 _bps)",
        params: [BigInt(bps)],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to set recycle BPS");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          bps,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can set recycle BPS");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Setting Recycle BPS",
        description: "Updating the recycle BPS...",
      },
      successMessage: {
        title: "Recycle BPS Updated",
        description: "The recycle BPS has been updated successfully!",
      },
      errorMessage: {
        title: "Update Failed",
        description: "Failed to update the recycle BPS. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.fees,
      });
    },
    onError: (error) => {
      console.error("Set recycle BPS error:", error);
    },
  });
}

// Set token
export function useSetTokenMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newToken }: { newToken: string }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function setToken(address _newToken)",
        params: [newToken],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to set token");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          newToken,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can set token");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Setting Token",
        description: "Updating the token address...",
      },
      successMessage: {
        title: "Token Updated",
        description: "The token address has been updated successfully!",
      },
      errorMessage: {
        title: "Update Failed",
        description: "Failed to update the token address. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.erc20TokenAddress,
      });
    },
    onError: (error) => {
      console.error("Set token error:", error);
    },
  });
}

// Collect fees
export function useCollectFeesMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      to, 
      amount 
    }: { 
      to: string; 
      amount: number 
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function collectFees(address _to, uint256 _amount)",
        params: [to, ethers.parseEther(amount.toString())],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to collect fees");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          to,
          amount,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can collect fees");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Collecting Fees",
        description: "Collecting accumulated fees...",
      },
      successMessage: {
        title: "Fees Collected",
        description: "The fees have been collected successfully!",
      },
      errorMessage: {
        title: "Collection Failed",
        description: "Failed to collect fees. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.fees,
      });
    },
    onError: (error) => {
      console.error("Collect fees error:", error);
    },
  });
}

// Collect native fees
export function useCollectNativeFeesMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      to, 
      amount 
    }: { 
      to: string; 
      amount: number 
    }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function collectNativeFees(address _to, uint256 _amount)",
        params: [to, ethers.parseEther(amount.toString())],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to collect native fees");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          to,
          amount,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Only owner can collect native fees");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Collecting Native Fees",
        description: "Collecting accumulated native fees...",
      },
      successMessage: {
        title: "Native Fees Collected",
        description: "The native fees have been collected successfully!",
      },
      errorMessage: {
        title: "Collection Failed",
        description: "Failed to collect native fees. Please try again.",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.fees,
      });
    },
    onError: (error) => {
      console.error("Collect native fees error:", error);
    },
  });
}

// Emergency withdraw
export function useEmergencyWithdrawMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function emergencyWithdraw(uint256 _id)",
        params: [BigInt(id)],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to emergency withdraw");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          id,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Position not found or not owner");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Emergency Withdraw",
        description: "Processing emergency withdrawal...",
      },
      successMessage: {
        title: "Emergency Withdrawal Successful",
        description: "The emergency withdrawal has been processed successfully!",
      },
      errorMessage: {
        title: "Withdrawal Failed",
        description: "Failed to process emergency withdrawal. Please try again.",
      },
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.position(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.userPositions(account?.address),
      });
    },
    onError: (error) => {
      console.error("Emergency withdraw error:", error);
    },
  });
}

// Emergency withdraw native
export function useEmergencyWithdrawNativeMutation() {
  const { account } = useUserChainInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const stakingContract = getContract({ type: "staking" });

      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function emergencyWithdrawNative(uint256 _id)",
        params: [BigInt(id)],
      });

      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });

        if (transactionReceipt.status === "reverted") {
          throw new Error("Failed to emergency withdraw native");
        }

        return {
          transactionHash: transactionReceipt.transactionHash,
          id,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("execution reverted")) {
          throw new Error("Transaction failed: Position not found or not owner");
        }
        throw error;
      }
    },
    meta: {
      loadingMessage: {
        title: "Emergency Withdraw Native",
        description: "Processing emergency native withdrawal...",
      },
      successMessage: {
        title: "Emergency Native Withdrawal Successful",
        description: "The emergency native withdrawal has been processed successfully!",
      },
      errorMessage: {
        title: "Withdrawal Failed",
        description: "Failed to process emergency native withdrawal. Please try again.",
      },
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.nativePosition(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staking.userNativePositions(account?.address),
      });
    },
    onError: (error) => {
      console.error("Emergency withdraw native error:", error);
    },
  });
} 