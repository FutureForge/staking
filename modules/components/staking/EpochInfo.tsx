import { useEpochInfo, useFeeInfo, useNextEpochTime, useTimeUntilNextEpoch } from "@/modules/query";

export function EpochInfo() {
  const { data: epochInfo, isLoading: isEpochLoading } = useEpochInfo();
  const { data: feeInfo, isLoading: isFeeLoading } = useFeeInfo();
  const { data: nextEpochTime, isLoading: isNextEpochLoading } = useNextEpochTime();
  const { data: timeUntilNextEpoch, isLoading: isTimeUntilNextEpochLoading } = useTimeUntilNextEpoch();

  console.log({ epochInfo, feeInfo });

  const formatTimeUTC = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-GB', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "0m";
    
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

  const getEpochProgress = () => {
    if (!epochInfo) return 0;
    const now = Math.floor(Date.now() / 1000);
    const epochStart = epochInfo.epochEnd - epochInfo.epochLength;
    const elapsed = now - epochStart;
    const progress = (elapsed / epochInfo.epochLength) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const timeUntilEpochEnd = getTimeUntilEpochEnd();
  const epochProgress = getEpochProgress();

  const formatTokenAmount = (amount: number) => {
    return (amount / 1e18).toFixed(2);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm">
        Epoch Information
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Epoch */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl drop-shadow-lg">⏰</span>
            <h3 className="text-lg font-semibold drop-shadow-sm">
              Current Epoch
            </h3>
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
                <p className="font-medium text-sm drop-shadow-sm">
                  {epochInfo
                    ? formatTimeUTC(epochInfo.epochEnd - epochInfo.epochLength)
                    : "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-100">End Time</p>
                <p className="font-medium text-sm drop-shadow-sm">
                  {epochInfo ? formatTimeUTC(epochInfo.epochEnd) : "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-100">Duration</p>
                <p className="font-medium text-sm drop-shadow-sm">
                  {epochInfo
                    ? formatDuration(epochInfo.epochLength)
                    : "Loading..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Epoch Countdown */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl drop-shadow-lg">🔥</span>
            <h3 className="text-lg font-semibold drop-shadow-sm">
              Time Remaining
            </h3>
          </div>

          {isEpochLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mb-2 drop-shadow-lg">
                {timeUntilEpochEnd !== null
                  ? formatDuration(timeUntilEpochEnd)
                  : "Loading..."}
              </div>
              <p className="text-red-100 text-sm drop-shadow-sm">
                Until current epoch ends
              </p>
            </div>
          )}
        </div>

        {/* Next Epoch Info */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl drop-shadow-lg">🚀</span>
            <h3 className="text-lg font-semibold drop-shadow-sm">
              Next Epoch
            </h3>
          </div>

          {isNextEpochLoading || isTimeUntilNextEpochLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-green-100">Start Time</p>
                <p className="font-medium text-sm drop-shadow-sm">
                  {nextEpochTime
                    ? formatTimeUTC(Math.floor(nextEpochTime.getTime() / 1000))
                    : "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-100">Time Until Start</p>
                <p className="font-medium text-sm drop-shadow-sm">
                  {timeUntilNextEpoch !== undefined
                    ? formatDuration(timeUntilNextEpoch)
                    : "Loading..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Information */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
            Reward Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">ERC20 Rewards</span>
              <span className="text-white font-medium drop-shadow-sm">
                {epochInfo ? formatTokenAmount(epochInfo.rewardPerEpoch) : "0"}{" "}
                XFI
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Native Rewards</span>
              <span className="text-white font-medium drop-shadow-sm">
                {epochInfo
                  ? formatTokenAmount(epochInfo.nativeRewardPerEpoch)
                  : "0"}{" "}
                XFI
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Total Rewards</span>
              <span className="text-white font-medium drop-shadow-sm">
                {epochInfo
                  ? formatTokenAmount(
                      epochInfo.rewardPerEpoch + epochInfo.nativeRewardPerEpoch
                    )
                  : "0"}{" "}
                XFI
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
            Fee Structure
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Dynamic Fee</span>
              <span className="text-white font-medium drop-shadow-sm">
                {feeInfo ? (feeInfo.feeDynamic / 100).toFixed(2) : "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Fixed Fee</span>
              <span className="text-white font-medium drop-shadow-sm">
                {feeInfo ? (feeInfo.feeFixed / 100).toFixed(2) : "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Early Unstake</span>
              <span className="text-white font-medium drop-shadow-sm">
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
            <span className="text-sm text-purple-200 drop-shadow-sm">
              Current Epoch Progress
            </span>
            <span className="text-sm text-white drop-shadow-sm">
              {Math.floor(epochProgress)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 shadow-lg"
              style={{
                width: `${epochProgress}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
