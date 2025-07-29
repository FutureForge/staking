import { useUserChainInfo } from "@/modules/query";
import { EpochInfo, StatsOverview, UserProfile } from ".";

export function StakingDashboard() {
  const { account } = useUserChainInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Header */}
      <div className="relative bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Staking Dashboard</h1>
              <p className="text-purple-200 mt-1 drop-shadow-sm">Manage your staking positions and rewards</p>
            </div>
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="text-right">
                  <p className="text-white font-medium drop-shadow-sm">{account.address?.slice(0, 6)}...{account.address?.slice(-4)}</p>
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Stats Overview */}
          <div className="xl:col-span-3 space-y-8">
            <StatsOverview />
            <EpochInfo />
          </div>

          {/* Right Column - User Profile */}
          <div className="xl:col-span-1">
            <UserProfile />
          </div>
        </div>
      </div>
    </div>
  );
}