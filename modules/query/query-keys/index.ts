export const queryKeys = {
  user: {
    user: ["user"] as const,
  },
  staking: {
    // User positions
    userPositions: (address?: string) => ["staking", "userPositions", address] as const,
    userNativePositions: (address?: string) => ["staking", "userNativePositions", address] as const,
    
    // Rewards
    pendingRewards: (address?: string) => ["staking", "pendingRewards", address] as const,
    claimableNativeRewards: (positionId?: number) => ["staking", "claimableNativeRewards", positionId] as const,
    
    // User info
    userInfo: (address?: string) => ["staking", "userInfo", address] as const,
    nativeUserInfo: (address?: string) => ["staking", "nativeUserInfo", address] as const,
    
    // Contract state
    totalStaked: ["staking", "totalStaked"] as const,
    totalNativeStaked: ["staking", "totalNativeStaked"] as const,
    totalWeight: ["staking", "totalWeight"] as const,
    totalNativeWeight: ["staking", "totalNativeWeight"] as const,
    contractState: ["staking", "contractState"] as const,
    
    // Position details
    position: (id: number) => ["staking", "position", id] as const,
    nativePosition: (id: number) => ["staking", "nativePosition", id] as const,
    
    // Contract parameters
    fees: ["staking", "fees"] as const,
    epochInfo: ["staking", "epochInfo"] as const,
    nextEpochTime: ["staking", "nextEpochTime"] as const,
    timeUntilNextEpoch: ["staking", "timeUntilNextEpoch"] as const,
    
    // Token info
    erc20TokenInfo: ["staking", "erc20TokenInfo"] as const,
    stakingTokenInfo: ["staking", "stakingTokenInfo"] as const,
    erc20TokenBalance: (address?: string) => ["staking", "erc20TokenBalance", address] as const,
    bondTokenBalances: (address?: string) => ["staking", "bondTokenBalances", address] as const,
    stakingTokenAddress: ["staking", "stakingTokenAddress"] as const,
    nativeStakingTokenAddress: ["staking", "nativeStakingTokenAddress"] as const,
    erc20TokenAddress: ["staking", "erc20TokenAddress"] as const,
    stokenBalance: (address?: string) => ["staking", "stokenBalance", address] as const,
    snativeBalance: (address?: string) => ["staking", "snativeBalance", address] as const,
    
    // Statistics
    stats: ["staking", "stats"] as const,
  },
};
