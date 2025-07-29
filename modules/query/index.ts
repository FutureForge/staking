export * from "./query-keys";
export * from "./user/user.query";
export * from "./staking/staking.query";
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
