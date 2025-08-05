import {
  useContractState,
  useERC20TokenSymbol,
  useNativeStakingTokenSymbol,
  useLastRewardTime,
  useLastNativeRewardTime,
  useEpochInfo,
  useFeeInfo,
} from "@/modules/query";
import { useUserNativeBalance, useERC20TokenBalance } from "@/modules/query";
import { formatNumber, formatDate, formatTime } from "@/utils/global";
import { toEther, toTokens } from "thirdweb";

export function StatsOverview() {
  const { data: contractState, isLoading: isContractLoading } =
    useContractState();
  const {
    balanceData: nativeBalance,
    isBalanceLoading: isNativeBalanceLoading,
  } = useUserNativeBalance();
  const { data: erc20Balance, isLoading: isERC20BalanceLoading } =
    useERC20TokenBalance();
  const { data: erc20Symbol } = useERC20TokenSymbol();
  const { data: nativeSymbol } = useNativeStakingTokenSymbol();

  // Additional contract data
  const { data: lastRewardTime, isLoading: isLastRewardTimeLoading } =
    useLastRewardTime();
  const {
    data: lastNativeRewardTime,
    isLoading: isLastNativeRewardTimeLoading,
  } = useLastNativeRewardTime();
  const { data: epochInfo, isLoading: isEpochInfoLoading } = useEpochInfo();
  const { data: feeInfo, isLoading: isFeeInfoLoading } = useFeeInfo();

  const statsCards = [
    {
      title: "Total Staked (ERC20)",
      value: contractState
        ? formatNumber(toTokens(BigInt(contractState.totalStaked), 18))
        : "0",
      unit: "USDT",
      icon: "💰",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      isLoading: isContractLoading,
    },
    {
      title: "Total Staked (Native)",
      value: contractState
        ? formatNumber(toEther(BigInt(contractState.totalNativeStaked)))
        : "0",
      unit: "XFI",
      icon: "⚡",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
      isLoading: isContractLoading,
    },
    {
      title: "Last ERC20 Reward",
      value: lastRewardTime ? formatDate(lastRewardTime) : "Never",
      unit: lastRewardTime ? formatTime(lastRewardTime) : "",
      icon: "🕒",
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
      isLoading: isLastRewardTimeLoading,
    },
    {
      title: "Last Native Reward",
      value: lastNativeRewardTime ? formatDate(lastNativeRewardTime) : "Never",
      unit: lastNativeRewardTime ? formatTime(lastNativeRewardTime) : "",
      icon: "⏰",
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
      isLoading: isLastNativeRewardTimeLoading,
    },
    {
      title: "ERC20 Reward/Epoch",
      value: epochInfo ? formatNumber(epochInfo.rewardPerEpoch) : "0",
      unit: "USDT",
      icon: "🎁",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "from-emerald-600 to-emerald-700",
      isLoading: isEpochInfoLoading,
    },
    {
      title: "Native Reward/Epoch",
      value: epochInfo ? formatNumber(epochInfo.nativeRewardPerEpoch) : "0",
      unit: "XFI",
      icon: "🎯",
      color: "from-cyan-500 to-cyan-600",
      hoverColor: "from-cyan-600 to-cyan-700",
      isLoading: isEpochInfoLoading,
    },
    {
      title: "Accrued ERC20 Fees",
      value: feeInfo
        ? formatNumber(toTokens(BigInt(feeInfo.accruedFees), 18))
        : "0",
      unit: "USDT",
      icon: "💸",
      color: "from-red-500 to-red-600",
      hoverColor: "from-red-600 to-red-700",
      isLoading: isFeeInfoLoading,
    },
    {
      title: "Accrued Native Fees",
      value: feeInfo
        ? formatNumber(toEther(BigInt(feeInfo.accruedNativeFees)))
        : "0",
      unit: "XFI",
      icon: "💎",
      color: "from-pink-500 to-pink-600",
      hoverColor: "from-pink-600 to-pink-700",
      isLoading: isFeeInfoLoading,
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-sm">
        Platform Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} hover:${card.hoverColor} rounded-xl p-3 sm:p-4 lg:p-6 text-white relative overflow-hidden min-h-[100px] sm:min-h-[120px] transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 opacity-10">
              <div className="text-2xl sm:text-3xl lg:text-4xl">{card.icon}</div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg sm:text-xl lg:text-2xl">{card.icon}</span>
                <h3 className="text-xs sm:text-sm font-medium text-white/80 leading-tight">
                  {card.title}
                </h3>
              </div>

              {card.isLoading ? (
                <div className="animate-pulse">
                  <div className="h-5 sm:h-6 lg:h-8 bg-white/20 rounded mb-1"></div>
                  <div className="h-3 sm:h-4 bg-white/20 rounded w-12 lg:w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 drop-shadow-sm">
                    {card.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70">
                    {card.unit}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 drop-shadow-sm">
            Weight Distribution
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">ERC20 Weight</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {contractState
                  ? formatNumber(
                      toTokens(BigInt(contractState.totalWeight), 18)
                    )
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">Native Weight</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {contractState
                  ? formatNumber(
                      toEther(BigInt(contractState.totalNativeWeight))
                    )
                  : "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 drop-shadow-sm">
            Wallet Balance
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">ERC20 Balance</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {isERC20BalanceLoading
                  ? "Loading..."
                  : `${formatNumber(toTokens(BigInt(erc20Balance), 18))} ${
                      erc20Symbol || "USDT"
                    }`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">Native Balance</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {isNativeBalanceLoading
                  ? "Loading..."
                  : `${formatNumber(nativeBalance?.displayValue || 0)} ${
                      nativeSymbol || "XFI"
                    }`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 drop-shadow-sm">
            Epoch Information
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">Epoch End</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {epochInfo ? formatDate(epochInfo.epochEnd) : "Loading..."}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">Epoch Length</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {epochInfo
                  ? `${Math.floor(epochInfo.epochLength / 86400)} days`
                  : "Loading..."}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm sm:text-base">Contract Status</span>
              <span
                className={`font-medium px-2 py-1 rounded text-xs ${
                  contractState?.paused
                    ? "bg-red-500/20 text-red-300"
                    : "bg-green-500/20 text-green-300"
                }`}
              >
                {contractState?.paused ? "Paused" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
