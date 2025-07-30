export * from "./query-keys";

// User queries
export { useUserChainInfo, useUserNativeBalance } from "./user/user.query";

// Staking queries
export {
  usePendingRewardsERC20,
  usePendingRewardsNative,
  usePendingRewards,
  useUserPositionsERC20,
  useUserNativePositions,
  usePositionERC20,
  usePositionNative,
  useERC20TokenInfo,
  useStakingTokenInfo,
  useEpochInfo,
  useNextEpochTime,
  useTimeUntilNextEpoch,
  useFeeInfo,
  useContractState,
  useUserInfoERC20,
  useUserInfoNative,
  useStakingStats,
  useERC20TokenBalance,
  useBondTokenBalances,
} from "./staking/staking.query";
export * from "./staking/staking.types";
export * from "./staking/staking.contract";

import { useQuery, useQueryClient } from "@tanstack/react-query";

// syntax
export function useQueryExample() {
  // call needed functions

  return useQuery({
    queryKey: ["exampleQueryKey"],
    queryFn: async () => {},
    initialData: null,
    enabled: true,
    refetchInterval: 60000, // refetch every minute
  });
}
