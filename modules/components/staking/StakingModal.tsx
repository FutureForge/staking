import { useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  useUserChainInfo,
  useUserNativeBalance,
  useERC20TokenBalance,
} from "@/modules/query";
import { useStakeMutation } from "@/modules/mutation";
import { cn } from "@/modules/app/utils";

type DurationOption = {
  value:
    | "dynamic"
    | "15days"
    | "30days"
    | "60days"
    | "90days"
    | "180days"
    | "365days";
  label: string;
  multiplier: string;
  description: string;
};

const durationOptions: DurationOption[] = [
  {
    value: "dynamic",
    label: "Dynamic",
    multiplier: "1.0x",
    description: "No lock period, flexible unstaking",
  },
  {
    value: "15days",
    label: "15 Days",
    multiplier: "1.1x",
    description: "15-day lock period",
  },
  {
    value: "30days",
    label: "30 Days",
    multiplier: "1.2x",
    description: "30-day lock period",
  },
  {
    value: "60days",
    label: "60 Days",
    multiplier: "1.5x",
    description: "60-day lock period",
  },
  {
    value: "90days",
    label: "90 Days",
    multiplier: "1.5x",
    description: "90-day lock period",
  },
  {
    value: "180days",
    label: "180 Days",
    multiplier: "2.0x",
    description: "180-day lock period",
  },
  {
    value: "365days",
    label: "365 Days",
    multiplier: "2.0x",
    description: "365-day lock period",
  },
];

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakeType: "erc20" | "native";
}

export function StakingModal({
  isOpen,
  onClose,
  stakeType,
}: StakingModalProps) {
  const { account } = useUserChainInfo();
  const {
    balanceData: nativeBalance,
    isBalanceLoading: isNativeBalanceLoading,
  } = useUserNativeBalance();
  const { data: erc20Balance, isLoading: isERC20BalanceLoading } =
    useERC20TokenBalance(account?.address);
  const stakeMutation = useStakeMutation();

  const [amount, setAmount] = useState("");
  const [selectedDuration, setSelectedDuration] =
    useState<DurationOption["value"]>("dynamic");
  const [isProcessing, setIsProcessing] = useState(false);

  const userBalance =
    stakeType === "native"
      ? Number(nativeBalance?.displayValue).toFixed(3) || "0"
      : erc20Balance
      ? (erc20Balance / 1e18).toFixed(3)
      : "0";

  const isLoading =
    stakeType === "native" ? isNativeBalanceLoading : isERC20BalanceLoading;

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);
    try {
      await stakeMutation.mutateAsync({
        amount: parseFloat(amount),
        duration: selectedDuration,
        stakeType,
      });
      onClose();
      setAmount("");
      setSelectedDuration("dynamic");
    } catch (error) {
      console.error("Staking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(userBalance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h2 className="text-xl font-bold text-white">
            Stake {stakeType === "native" ? "Native" : "ERC20"} Tokens
          </h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors duration-300"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance Display */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-purple-200 text-sm">Available Balance</span>
              <span className="text-white font-semibold">
                {isLoading ? "Loading..." : `${userBalance} XFI`}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-purple-200 text-sm font-medium">
              Amount to Stake
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleMaxAmount}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-300"
                disabled={isProcessing}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <label className="text-purple-200 text-sm font-medium">
              Staking Duration
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all duration-300",
                    selectedDuration === option.value
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10 hover:border-purple-500/30"
                  )}
                  disabled={isProcessing}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs opacity-75">
                        {option.description}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-purple-300">
                      {option.multiplier}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleStake}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                isProcessing ||
                stakeMutation.isPending
              }
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium transition-all duration-300",
                !amount ||
                  parseFloat(amount) <= 0 ||
                  isProcessing ||
                  stakeMutation.isPending
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:scale-105"
              )}
            >
              {isProcessing || stakeMutation.isPending
                ? "Processing..."
                : "Stake Tokens"}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg font-medium bg-white/5 border border-white/10 text-purple-200 hover:bg-white/10 transition-all duration-300"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
