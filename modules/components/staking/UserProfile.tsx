import { useState } from "react";
import {
  useUserChainInfo,
  useUserPositionsERC20,
  useUserNativePositions,
  usePendingRewards,
  useUserInfoERC20,
  useUserInfoNative,
  useBondTokenBalances,
} from "@/modules/query";
import {
  useClaimERC20RewardsMutation,
  useClaimNativeRewardsMutation,
} from "@/modules/mutation";
import { StakingModal } from "./StakingModal";
import { UnstakeModal } from "./UnstakeModal";
import { IS_TESTNET } from "@/utils/configs";
import { toEther, toTokens } from "thirdweb";
import { formatNumber } from "@/utils/global";

export function UserProfile() {
  const { account } = useUserChainInfo();
  const userAddress = account?.address;

  const [isERC20ModalOpen, setIsERC20ModalOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);

  const { data: erc20Positions, isLoading: isERC20Loading } =
    useUserPositionsERC20();
  const { data: nativePositions, isLoading: isNativeLoading } =
    useUserNativePositions();
  const { data: pendingRewards, isLoading: isRewardsLoading } =
    usePendingRewards();
  const { data: userInfoERC20, isLoading: isUserInfoERC20Loading } =
    useUserInfoERC20();
  const { data: userInfoNative, isLoading: isUserInfoNativeLoading } =
    useUserInfoNative();
  const { data: bondTokenBalances, isLoading: isBondTokenBalancesLoading } =
    useBondTokenBalances();

  console.log({
    // erc20Positions,
    // nativePositions,
    pendingRewards,
    // userInfoERC20,
    // userInfoNative,
    // bondTokenBalances,
  });

  const claimERC20Mutation = useClaimERC20RewardsMutation();
  const claimNativeMutation = useClaimNativeRewardsMutation();
  const isLoading =
    isERC20Loading ||
    isNativeLoading ||
    isRewardsLoading ||
    isUserInfoERC20Loading ||
    isUserInfoNativeLoading ||
    isBondTokenBalancesLoading;

  const hasERC20RewardsToClaim =
    pendingRewards && pendingRewards.erc20Rewards > 0;

  const hasNativeRewardsToClaim =
    pendingRewards && pendingRewards.nativeRewards > 0;

  const isClaimingERC20 = claimERC20Mutation.isPending;
  const isClaimingNative = claimNativeMutation.isPending;

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

        {/* Bond Token Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <p className="text-purple-200 text-sm">STOKEN Balance</p>
            <p className="text-white font-bold text-lg drop-shadow-sm">
              {bondTokenBalances
                ? formatNumber(bondTokenBalances.stokenBalance)
                : "0"}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <p className="text-purple-200 text-sm">SNATIVE Balance</p>
            <p className="text-white font-bold text-lg drop-shadow-sm">
              {bondTokenBalances
                ? formatNumber(bondTokenBalances.snativeBalance)
                : "0"}
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
                  ? Number(
                      toTokens(BigInt(pendingRewards.erc20Rewards), 18)
                    ).toFixed(4)
                  : "0"}{" "}
                USDT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-100">Native Rewards</span>
              <span className="font-bold text-lg drop-shadow-sm">
                {pendingRewards
                  ? Number(
                      toEther(BigInt(pendingRewards.nativeRewards))
                    ).toFixed(4)
                  : "0"}{" "}
                XFI
              </span>
            </div>
            {/* <div className="border-t border-green-400/30 pt-3 mt-3">
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
            </div> */}
          </div>
        )}
      </div>

      {/* Bond Token Balances */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl drop-shadow-lg">🏦</span>
          <h3 className="text-lg font-semibold drop-shadow-sm">
            Bond Token Balances
          </h3>
        </div>

        {isBondTokenBalancesLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-6 bg-white/20 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">STOKEN Balance</span>
              <span className="font-bold text-lg drop-shadow-sm">
                {bondTokenBalances
                  ? formatNumber(bondTokenBalances.stokenBalance)
                  : "0"}{" "}
                STOKEN
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">SNATIVE Balance</span>
              <span className="font-bold text-lg drop-shadow-sm">
                {bondTokenBalances
                  ? formatNumber(bondTokenBalances.snativeBalance)
                  : "0"}{" "}
                SNATIVE
              </span>
            </div>
            <div className="border-t border-blue-400/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                {/* <span className="text-blue-100 font-semibold">
                  Total Bond Tokens
                </span> */}
                {/* <span className="font-bold text-xl drop-shadow-sm">
                  {bondTokenBalances
                    ? formatTokenAmount(
                        bondTokenBalances.stokenBalance +
                          bondTokenBalances.snativeBalance
                      )
                    : "0"}{" "}
                  Tokens
                </span> */}
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
            onClick={() => setIsUnstakeModalOpen(true)}
            disabled={
              (erc20Positions?.length || 0) + (nativePositions?.length || 0) ===
              0
            }
            className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              (erc20Positions?.length || 0) + (nativePositions?.length || 0) > 0
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            Unstake Positions
          </button>
          <button
            onClick={() => claimERC20Mutation.mutate()}
            disabled={!hasERC20RewardsToClaim || isClaimingERC20}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              hasERC20RewardsToClaim && !isClaimingERC20
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isClaimingERC20 ? "Claiming ERC20..." : "Claim ERC20 Rewards"}
          </button>
          <button
            onClick={() => claimNativeMutation.mutate()}
            disabled={!hasNativeRewardsToClaim || isClaimingNative}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              hasNativeRewardsToClaim && !isClaimingNative
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isClaimingNative ? "Claiming Native..." : "Claim Native Rewards"}
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
          CrossFi {IS_TESTNET ? "Testnet" : "Mainnet"} • All systems operational
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
      <UnstakeModal
        isOpen={isUnstakeModalOpen}
        onClose={() => setIsUnstakeModalOpen(false)}
      />
    </div>
  );
}
