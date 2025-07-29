import { useUserChainInfo } from "@/modules/query";
import { EpochInfo, StatsOverview, UserProfile } from ".";
// import { StatsOverview } from "./StatsOverview";
// import { UserProfile } from "./UserProfile";
// import { EpochInfo } from "./EpochInfo";

export function StakingDashboard() {
  const { account } = useUserChainInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
              <p className="text-purple-200 mt-1">Manage your staking positions and rewards</p>
            </div>
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="text-right">
                  <p className="text-white font-medium">{account.address?.slice(0, 6)}...{account.address?.slice(-4)}</p>
                  <p className="text-purple-200 text-sm">Connected</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-white font-medium">Not Connected</p>
                  <p className="text-purple-200 text-sm">Connect your wallet to start</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats Overview */}
          <div className="lg:col-span-2 space-y-8">
            <StatsOverview />
            <EpochInfo />
          </div>

          {/* Right Column - User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>
        </div>
      </div>
    </div>
  );
}