import { useUserChainInfo } from "@/modules/query";
import { EpochInfo, StatsOverview, UserProfile } from ".";

export function StakingDashboard() {
  const { account } = useUserChainInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 via-indigo-900/60 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Stats Overview */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
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
