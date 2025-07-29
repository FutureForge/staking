import { useContractState, useStakingStats } from "@/modules/query";

export function StatsOverview() {
  const { data: contractState, isLoading: isContractLoading } = useContractState();
  const { data: stats, isLoading: isStatsLoading } = useStakingStats();

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatTokenAmount = (amount: number) => {
    return (amount / 1e18).toFixed(2);
  };

  const statsCards = [
    {
      title: "Total Staked (ERC20)",
      value: contractState ? formatTokenAmount(contractState.totalStaked) : "0",
      unit: "XFI",
      icon: "💰",
      color: "from-blue-500 to-blue-600",
      isLoading: isContractLoading,
    },
    {
      title: "Total Staked (Native)",
      value: contractState ? formatTokenAmount(contractState.totalNativeStaked) : "0",
      unit: "XFI",
      icon: "⚡",
      color: "from-purple-500 to-purple-600",
      isLoading: isContractLoading,
    },
    {
      title: "Total Users",
      value: stats ? (stats.totalPositions + stats.totalNativePositions).toString() : "0",
      unit: "Users",
      icon: "👥",
      color: "from-green-500 to-green-600",
      isLoading: isStatsLoading,
    },
    {
      title: "Average Stake",
      value: stats ? formatTokenAmount(stats.averageStakeAmount) : "0",
      unit: "XFI",
      icon: "📊",
      color: "from-orange-500 to-orange-600",
      isLoading: isStatsLoading,
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className="text-4xl">{card.icon}</div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-sm font-medium text-white/80">{card.title}</h3>
              </div>
              
              {card.isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/20 rounded mb-1"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1">
                    {card.value}
                  </div>
                  <div className="text-sm text-white/70">
                    {card.unit}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Weight Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Weight</span>
              <span className="text-white font-medium">
                {contractState ? formatNumber(contractState.totalWeight) : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Weight</span>
              <span className="text-white font-medium">
                {contractState ? formatNumber(contractState.totalNativeWeight) : "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Position Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Positions</span>
              <span className="text-white font-medium">
                {stats?.totalPositions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Positions</span>
              <span className="text-white font-medium">
                {stats?.totalNativePositions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}