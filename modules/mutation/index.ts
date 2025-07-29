export * from './stake/stake.mutation'
export * from './unstake/unstake.mutation'
export * from './claim/claim-erc20-rewards.mutation'
export * from './claim/claim-native-rewards.mutation'

import { useMutation, useQueryClient } from "@tanstack/react-query";
// syntax
export function useMutationExample() {
  // call needed functions

  return useMutation({
    mutationFn: async () => {
      // your mutation logic here
    },
    onSuccess: (data, variables, context) => {
      // your success callback here
    },
    onError: (error, variables, context) => {
      // your error callback here
    },
    // other options like retry, etc.
  });
}
