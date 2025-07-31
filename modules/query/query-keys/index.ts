export const queryKeys = {
  user: {
    user: ["user"] as const,
  },
  staking: {
    // User positions
    userPositions: (address?: string) => ["staking", "userPositions", address] as const,
    userNativePositions: (address?: string) => ["staking", "userNativePositions", address] as const,
    
    // Rewards - made unique for each type
    pendingRewardsERC20: (address?: string) => ["staking", "pendingRewardsERC20", address] as const,
    pendingRewardsNative: (address?: string) => ["staking", "pendingRewardsNative", address] as const,
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
    
    // Position existence and ownership
    positionExists: (id: number) => ["staking", "positionExists", id] as const,
    nativePositionExists: (id: number) => ["staking", "nativePositionExists", id] as const,
    positionOwner: (id: number) => ["staking", "positionOwner", id] as const,
    nativePositionOwner: (id: number) => ["staking", "nativePositionOwner", id] as const,
    
    // Contract parameters
    fees: ["staking", "fees"] as const,
    epochInfo: ["staking", "epochInfo"] as const,
    nextEpochTime: ["staking", "nextEpochTime"] as const,
    timeUntilNextEpoch: ["staking", "timeUntilNextEpoch"] as const,
    fixedFeeByDuration: (duration: number) => ["staking", "fixedFeeByDuration", duration] as const,
    bpsDenom: ["staking", "bpsDenom"] as const,
    lastNativeRewardTime: ["staking", "lastNativeRewardTime"] as const,
    lastRewardTime: ["staking", "lastRewardTime"] as const,
    
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
    
    // Token symbols
    erc20TokenSymbol: ["staking", "erc20TokenSymbol"] as const,
    stakingTokenSymbol: ["staking", "stakingTokenSymbol"] as const,
    nativeStakingTokenSymbol: ["staking", "nativeStakingTokenSymbol"] as const,
    
    // Position arrays
    positions: (address?: string) => ["staking", "positions", address] as const,
    nativePositions: (address?: string) => ["staking", "nativePositions", address] as const,
    
    // Statistics
    stats: ["staking", "stats"] as const,
  },
};
