import { getContract } from "@/modules/blockchain";
import { useUserChainInfo } from "@/modules/query";
import { chain1StakingContract } from "@/utils/configs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendAndConfirmTransaction } from "thirdweb";
import { approve } from "thirdweb/extensions/erc20";

export function useApproveMutation() {
  const { account } = useUserChainInfo();
  return useMutation({
    mutationFn: async ({ amount }: { amount: string | number }) => {
      if (!account) {
        throw new Error("No active account found");
      }

      const usdtContract = getContract({ type: "token" });

      const transaction = await approve({
        contract: usdtContract,
        spender: chain1StakingContract,
        amount: amount,
      });

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
      };
    },
    onSuccess: (data, variables, context) => {},
    onError: (error, variables, context) => {},
  });
}
