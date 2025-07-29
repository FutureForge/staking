import { useState } from "react";
import { useUserChainInfo } from "@/modules/query";
import {
  useUserPositionsERC20,
  useUserNativePositions,
  usePendingRewards,
  useUserInfoERC20,
  useUserInfoNative,
} from "@/modules/query";
import { useClaimERC20RewardsMutation, useClaimNativeRewardsMutation } from "@/modules/mutation";
import { StakingModal } from "./StakingModal";
import { IS_TESTNET } from "@/utils/configs";

export function UserProfile() {
  const { account } = useUserChainInfo();
  const userAddress = account?.address;

  const [isERC20ModalOpen, setIsERC20ModalOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);

  const { data: erc20Positions, isLoading: isERC20Loading } =
    useUserPositionsERC20(userAddress);
  const { data: nativePositions, isLoading: isNativeLoading } =
    useUserNativePositions(userAddress);
  const { data: pendingRewards, isLoading: isRewardsLoading } =
    usePendingRewards(userAddress);
  const { data: userInfoERC20, isLoading: isUserInfoERC20Loading } =
    useUserInfoERC20(userAddress);
  const { data: userInfoNative, isLoading: isUserInfoNativeLoading } =
    useUserInfoNative(userAddress);

  const claimERC20Mutation = useClaimERC20RewardsMutation();
  const claimNativeMutation = useClaimNativeRewardsMutation();

  const formatTokenAmount = (amount: number) => {
    return (amount / 1e18).toFixed(4);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
  };

  const handleClaimAllRewards = async () => {
    try {
      // Claim both ERC20 and Native rewards
      const promises = [];
      
      if (pendingRewards && pendingRewards.erc20Rewards > 0) {
        promises.push(claimERC20Mutation.mutateAsync());
      }
      
      if (pendingRewards && pendingRewards.nativeRewards > 0) {
        promises.push(claimNativeMutation.mutateAsync());
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Claim rewards error:", error);
    }
  };

  const hasRewardsToClaim = pendingRewards && 
    (pendingRewards.erc20Rewards > 0 || pendingRewards.nativeRewards > 0);

  const isClaiming = claimERC20Mutation.isPending || claimNativeMutation.isPending;

  if (!userAddress) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 drop-shadow-lg">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
            Connect Wallet
          </h2>
          <p className="text-purple-200">
            Connect your wallet to view your staking profile and positions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg drop-shadow-sm">
              {userAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white drop-shadow-sm">
              Your Profile
            </h2>
            <p className="text-purple-200 text-sm font-mono truncate">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <p className="text-purple-200 text-sm">Total Positions</p>
            <p className="text-white font-bold text-lg drop-shadow-sm">
              {(erc20Positions?.length || 0) + (nativePositions?.length || 0)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <p className="text-purple-200 text-sm">Total Weight</p>
            <p className="text-white font-bold text-lg drop-shadow-sm">
              {formatNumber(
                (userInfoERC20?.weight || 0) + (userInfoNative?.weight || 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Rewards */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl drop-shadow-lg">🎁</span>
          <h3 className="text-lg font-semibold drop-shadow-sm">
            Pending Rewards
          </h3>
        </div>

        {isRewardsLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-6 bg-white/20 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-100">ERC20 Rewards</span>
              <span className="font-bold text-lg drop-shadow-sm">
                {pendingRewards
                  ? formatTokenAmount(pendingRewards.erc20Rewards)
                  : "0"}{" "}
                XFI
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-100">Native Rewards</span>
              <span className="font-bold text-lg drop-shadow-sm">
                {pendingRewards
                  ? formatTokenAmount(pendingRewards.nativeRewards)
                  : "0"}{" "}
                XFI
              </span>
            </div>
            <div className="border-t border-green-400/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-green-100 font-semibold">Total</span>
                <span className="font-bold text-xl drop-shadow-sm">
                  {pendingRewards
                    ? formatTokenAmount(
                        pendingRewards.erc20Rewards +
                          pendingRewards.nativeRewards
                      )
                    : "0"}{" "}
                  XFI
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
          Position Summary
        </h3>

        <div className="space-y-4">
          {/* ERC20 Positions */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-200 font-medium">
                ERC20 Positions
              </span>
              <span className="text-white font-bold drop-shadow-sm">
                {erc20Positions?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-200">Weight</span>
              <span className="text-white">
                {formatNumber(userInfoERC20?.weight || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-200">Reward Debt</span>
              <span className="text-white">
                {formatNumber(userInfoERC20?.rewardDebt || 0)}
              </span>
            </div>
          </div>

          {/* Native Positions */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-200 font-medium">
                Native Positions
              </span>
              <span className="text-white font-bold drop-shadow-sm">
                {nativePositions?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-200">Weight</span>
              <span className="text-white">
                {formatNumber(userInfoNative?.weight || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-200">Reward Debt</span>
              <span className="text-white">
                {formatNumber(userInfoNative?.rewardDebt || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
          Quick Actions
        </h3>

        <div className="space-y-3">
          <button 
            onClick={() => setIsERC20ModalOpen(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Stake ERC20 Tokens
          </button>
          <button 
            onClick={() => setIsNativeModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Stake Native Tokens
          </button>
          <button 
            onClick={handleClaimAllRewards}
            disabled={!hasRewardsToClaim || isClaiming}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              hasRewardsToClaim && !isClaiming
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isClaiming ? "Claiming..." : "Claim All Rewards"}
          </button>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            <span className="text-white font-medium drop-shadow-sm">
              Network Status
            </span>
          </div>
          <span className="text-green-400 text-sm font-medium">Connected</span>
        </div>
        <p className="text-purple-200 text-sm mt-2">
          CrossFi {IS_TESTNET ? "Testnet" : "Mainnet"} • All systems
          operational
        </p>
      </div>

      {/* Staking Modals */}
      <StakingModal
        isOpen={isERC20ModalOpen}
        onClose={() => setIsERC20ModalOpen(false)}
        stakeType="erc20"
      />
      <StakingModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
        stakeType="native"
      />
    </div>
  );
}
