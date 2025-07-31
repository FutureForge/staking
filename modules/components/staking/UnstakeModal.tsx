import { useState } from "react";
import { useUserChainInfo } from "@/modules/query";
import {
  useUserPositionsERC20,
  useUserNativePositions,
  usePositionERC20,
  usePositionNative,
} from "@/modules/query";
import { useUnstakeMutation } from "@/modules/mutation";

interface UnstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PositionWithDetails {
  id: number;
  type: "erc20" | "native";
  amount: number;
  unlockTime: number;
  multiplierBps: number;
  duration: number;
  active: boolean;
  plan: "DYNAMIC" | "FIXED";
  isNative: boolean;
}

export function UnstakeModal({ isOpen, onClose }: UnstakeModalProps) {
  const { account } = useUserChainInfo();
  const userAddress = account?.address;

  const [selectedPosition, setSelectedPosition] =
    useState<PositionWithDetails | null>(null);

  const { data: erc20Positions, isLoading: isERC20Loading } =
    useUserPositionsERC20();
  const { data: nativePositions, isLoading: isNativeLoading } =
    useUserNativePositions();

  // Check if user has any positions at all
  const hasAnyPositions =
    (erc20Positions && erc20Positions.length > 0) ||
    (nativePositions && nativePositions.length > 0);

  const unstakeMutation = useUnstakeMutation();

  const formatTokenAmount = (amount: number) => {
    return (amount / 1e18).toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const handleUnstake = () => {
    if (!selectedPosition) return;

    unstakeMutation.mutate(
      {
        positionId: selectedPosition.id,
        stakeType: selectedPosition.type,
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedPosition(null);
        },
        onError: () => {
          // Error handling is done by the mutation
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    setSelectedPosition(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-sm">
            Unstake Positions
          </h2>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* ERC20 Positions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
              ERC20 Positions ({erc20Positions?.length || 0})
            </h3>
            {isERC20Loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            ) : erc20Positions && erc20Positions.length > 0 ? (
              <div className="space-y-3">
                {erc20Positions.map((positionId) => (
                  <PositionCard
                    key={`erc20-${positionId}`}
                    positionId={positionId}
                    type="erc20"
                    usePositionQuery={usePositionERC20}
                    isSelected={
                      selectedPosition?.id === positionId &&
                      selectedPosition?.type === "erc20"
                    }
                    onSelect={(position) => setSelectedPosition(position)}
                    formatTokenAmount={formatTokenAmount}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <div className="text-4xl mb-2">📭</div>
                <p>No ERC20 positions found</p>
                <p className="text-sm mt-2">
                  You haven't staked any ERC20 tokens yet
                </p>
              </div>
            )}
          </div>

          {/* Native Positions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">
              Native Positions ({nativePositions?.length || 0})
            </h3>
            {isNativeLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            ) : nativePositions && nativePositions.length > 0 ? (
              <div className="space-y-3">
                {nativePositions.map((positionId) => (
                  <PositionCard
                    key={`native-${positionId}`}
                    positionId={positionId}
                    type="native"
                    usePositionQuery={usePositionNative}
                    isSelected={
                      selectedPosition?.id === positionId &&
                      selectedPosition?.type === "native"
                    }
                    onSelect={(position) => setSelectedPosition(position)}
                    formatTokenAmount={formatTokenAmount}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <div className="text-4xl mb-2">📭</div>
                <p>No native positions found</p>
                <p className="text-sm mt-2">
                  You haven't staked any native tokens yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/20">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnstake}
            disabled={!selectedPosition || unstakeMutation.isPending}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedPosition && !unstakeMutation.isPending
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-105"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {unstakeMutation.isPending ? "Unstaking..." : "Unstake Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PositionCardProps {
  positionId: number;
  type: "erc20" | "native";
  usePositionQuery: (id: number) => any;
  isSelected: boolean;
  onSelect: (position: PositionWithDetails) => void;
  formatTokenAmount: (amount: number) => string;
  formatDate: (timestamp: number) => string;
  formatTime: (timestamp: number) => string;
}

function PositionCard({
  positionId,
  type,
  usePositionQuery,
  isSelected,
  onSelect,
  formatTokenAmount,
  formatDate,
  formatTime,
}: PositionCardProps) {
  const { data: position, isLoading, isError } = usePositionQuery(positionId);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white/10 rounded-lg p-4">
        <div className="h-4 bg-white/20 rounded mb-2"></div>
        <div className="h-3 bg-white/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (isError || !position) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300 text-sm">
          {isError
            ? `Error loading position ${positionId}`
            : `Position ${positionId} not found`}
        </p>
        <p className="text-red-200 text-xs mt-1">
          This position may have been already unstaked or doesn't exist
        </p>
      </div>
    );
  }

  const positionWithDetails: PositionWithDetails = {
    id: positionId,
    type,
    ...position,
  };

  const isUnlocked =
    position.plan === "DYNAMIC" || Date.now() / 1000 >= position.unlockTime;
  const multiplier = position.multiplierBps / 100;

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-red-400 bg-red-500/20 shadow-lg"
          : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
      }`}
      onClick={() => onSelect(positionWithDetails)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{type === "erc20" ? "💰" : "⚡"}</span>
          <span className="font-semibold text-white">
            Position #{positionId}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              type === "erc20"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-purple-500/20 text-purple-300"
            }`}
          >
            {type.toUpperCase()}
          </span>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            isUnlocked
              ? "bg-green-500/20 text-green-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}
        >
          {isUnlocked ? "Unlocked" : "Locked"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-white/70">Amount</p>
          <p className="text-white font-medium">
            {formatTokenAmount(position.amount)} XFI
          </p>
        </div>
        <div>
          <p className="text-white/70">Multiplier</p>
          <p className="text-white font-medium">{multiplier}x</p>
        </div>
        <div>
          <p className="text-white/70">Plan</p>
          <p className="text-white font-medium">{position.plan}</p>
        </div>
        <div>
          <p className="text-white/70">Unlock Time</p>
          <p className="text-white font-medium">
            {position.plan === "DYNAMIC"
              ? "No Lock"
              : formatDate(position.unlockTime)}
          </p>
          <p className="text-white/50 text-xs">
            {position.plan === "DYNAMIC"
              ? "Unstake anytime"
              : formatTime(position.unlockTime)}
          </p>
        </div>
      </div>

      {!isUnlocked && position.plan !== "DYNAMIC" && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-300">
          ⚠️ This position is still locked. Early unstaking may incur penalties.
        </div>
      )}
    </div>
  );
}
