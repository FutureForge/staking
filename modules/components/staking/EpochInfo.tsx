import { useEpochInfo, useFeeInfo } from "@/modules/query";

export function EpochInfo() {
  const { data: epochInfo, isLoading: isEpochLoading } = useEpochInfo();
  const { data: feeInfo, isLoading: isFeeLoading } = useFeeInfo();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeUntilEpochEnd = () => {
    if (!epochInfo) return null;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = epochInfo.epochEnd - now;
    return timeLeft > 0 ? timeLeft : 0;
  };

  const timeUntilEpochEnd = getTimeUntilEpochEnd();

  const formatTokenAmount = (amount: number) => {
    return (amount / 1e18).toFixed(2);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Epoch Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Epoch */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">⏰</span>
            <h3 className="text-lg font-semibold">Current Epoch</h3>
          </div>
          
          {isEpochLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-indigo-100">Start Time</p>
                <p className="font-medium">
                  {epochInfo ? formatTime(epochInfo.lastRewardTime) : "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-100">End Time</p>
                <p className="font-medium">
                  {epochInfo ? formatTime(epochInfo.epochEnd) : "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-100">Duration</p>
                <p className="font-medium">
                  {epochInfo ? formatDuration(epochInfo.epochLength) : "Loading..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Epoch Countdown */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🔥</span>
            <h3 className="text-lg font-semibold">Time Remaining</h3>
          </div>
          
          {isEpochLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mb-2">
                {timeUntilEpochEnd !== null ? formatDuration(timeUntilEpochEnd) : "Loading..."}
              </div>
              <p className="text-red-100 text-sm">
                Until next epoch
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Reward Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Rewards</span>
              <span className="text-white font-medium">
                {epochInfo ? formatTokenAmount(epochInfo.rewardPerEpoch) : "0"} XFI
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Rewards</span>
              <span className="text-white font-medium">
                {epochInfo ? formatTokenAmount(epochInfo.nativeRewardPerEpoch) : "0"} XFI
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Total Rewards</span>
              <span className="text-white font-medium">
                {epochInfo ? formatTokenAmount(epochInfo.rewardPerEpoch + epochInfo.nativeRewardPerEpoch) : "0"} XFI
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Fee Structure</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Dynamic Fee</span>
              <span className="text-white font-medium">
                {feeInfo ? (feeInfo.feeDynamic / 100).toFixed(2) : "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Fixed Fee</span>
              <span className="text-white font-medium">
                {feeInfo ? (feeInfo.feeFixed / 100).toFixed(2) : "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Early Unstake</span>
              <span className="text-white font-medium">
                {feeInfo ? (feeInfo.feeFixedEarly / 100).toFixed(2) : "0"}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {epochInfo && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-200">Epoch Progress</span>
            <span className="text-sm text-white">
              {Math.floor(((epochInfo.epochEnd - epochInfo.lastRewardTime) / epochInfo.epochLength) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, ((epochInfo.epochEnd - epochInfo.lastRewardTime) / epochInfo.epochLength) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}