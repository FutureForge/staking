import { useContractState, useERC20TokenSymbol, useNativeStakingTokenSymbol } from "@/modules/query";
import { useUserNativeBalance, useERC20TokenBalance } from "@/modules/query";
import { toWei, toEther, toTokens } from "thirdweb";

export function StatsOverview() {
  const { data: contractState, isLoading: isContractLoading } =
    useContractState();
  const { balanceData: nativeBalance, isBalanceLoading: isNativeBalanceLoading } = useUserNativeBalance();
  const { data: erc20Balance, isLoading: isERC20BalanceLoading } = useERC20TokenBalance();
  const { data: erc20Symbol } = useERC20TokenSymbol();
  const { data: nativeSymbol } = useNativeStakingTokenSymbol();
  
  // const { data: stats, isLoading: isStatsLoading } = useStakingStats();

  // console.log({ stats, contractState });

  console.log({ contractState });

  const formatNumber = (num: number | string) => {
    let numberValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numberValue)) return "0";
    if (numberValue < 0) return "0";
    if (numberValue === 0) return "0";
    if (typeof numberValue !== "number") return "0";
    if (numberValue === Infinity) return "∞";
    if (numberValue === -Infinity) return "-∞";
    if (typeof numberValue !== "number") return "0";

    if (numberValue >= 1e9) return (numberValue / 1e9).toFixed(2) + "B";
    if (numberValue >= 1e6) return (numberValue / 1e6).toFixed(2) + "M";
    if (numberValue >= 1e3) return (numberValue / 1e3).toFixed(2) + "K";
    return numberValue.toLocaleString();
  };

  const statsCards = [
    {
      title: "Total Staked (ERC20)",
      value: contractState
        ? toTokens(BigInt(contractState.totalStaked), 18)
        : "0",
      unit: "XFI",
      icon: "💰",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      isLoading: isContractLoading,
    },
    {
      title: "Total Staked (Native)",
      value: contractState
        ? toEther(BigInt(contractState.totalNativeStaked))
        : "0",
      unit: "XFI",
      icon: "⚡",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
      isLoading: isContractLoading,
    },
    // {
    //   title: "Total Positions",
    //   value: stats
    //     ? (stats.totalPositions + stats.totalNativePositions).toString()
    //     : "0",
    //   unit: "Positions",
    //   icon: "👥",
    //   color: "from-green-500 to-green-600",
    //   hoverColor: "from-green-600 to-green-700",
    //   isLoading: isStatsLoading,
    // },
    // {
    //   title: "Average Stake",
    //   value: stats ? formatTokenAmount(stats.averageStakeAmount) : "0",
    //   unit: "XFI",
    //   icon: "📊",
    //   color: "from-orange-500 to-orange-600",
    //   hoverColor: "from-orange-600 to-orange-700",
    //   isLoading: isStatsLoading,
    // },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm">
        Platform Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} hover:${card.hoverColor} rounded-xl p-4 lg:p-6 text-white relative overflow-hidden min-h-[120px] transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-16 h-16 lg:w-20 lg:h-20 opacity-10">
              <div className="text-3xl lg:text-4xl">{card.icon}</div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl lg:text-2xl">{card.icon}</span>
                <h3 className="text-xs lg:text-sm font-medium text-white/80 leading-tight">
                  {card.title}
                </h3>
              </div>

              {card.isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 lg:h-8 bg-white/20 rounded mb-1"></div>
                  <div className="h-4 bg-white/20 rounded w-12 lg:w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl lg:text-2xl font-bold mb-1 drop-shadow-sm">
                    {card.value}
                  </div>
                  <div className="text-xs lg:text-sm text-white/70">
                    {card.unit}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
            Weight Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Weight</span>
              <span className="text-white font-medium">
                {contractState
                  ? formatNumber(
                      toTokens(BigInt(contractState.totalWeight), 18)
                    )
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Weight</span>
              <span className="text-white font-medium">
                {contractState
                  ? formatNumber(
                      toEther(BigInt(contractState.totalNativeWeight))
                    )
                  : "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
            Wallet Balance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Balance</span>
              <span className="text-white font-medium">
                {isERC20BalanceLoading ? "Loading..." : `${(erc20Balance / 1e18).toFixed(3)} ${erc20Symbol || "XFI"}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Balance</span>
              <span className="text-white font-medium">
                {isNativeBalanceLoading ? "Loading..." : `${Number(nativeBalance?.displayValue || 0).toFixed(3)} ${nativeSymbol || "XFI"}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
