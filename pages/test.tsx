import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export default function TestPage() {
  return (
    <div className={`${geistSans.variable} font-sans dark min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg">
          Tailwind CSS Test Page
        </h1>
        
        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4 drop-shadow-sm">Colors</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-purple-200">Purple</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-blue-200">Blue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-green-200">Green</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            <h2 className="text-xl font-bold mb-4 drop-shadow-sm">Gradients</h2>
            <p className="text-purple-100">This card uses gradient backgrounds and hover effects.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 drop-shadow-sm">Typography</h2>
            <div className="space-y-2">
              <p className="text-white font-bold">Bold Text</p>
              <p className="text-purple-200">Secondary Text</p>
              <p className="text-sm text-gray-300">Small Text</p>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm">Interactive Elements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                Primary Button
              </button>
              
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                Secondary Button
              </button>
              
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                Success Button
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <h3 className="text-white font-semibold mb-2">Hover Card</h3>
                <p className="text-purple-200 text-sm">This card changes on hover</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
                <h3 className="font-semibold mb-2">Gradient Card</h3>
                <p className="text-red-100 text-sm">This card uses a gradient background</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm">Status Indicators</h2>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-white font-medium">Connected</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-white font-medium">Pending</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-white font-medium">Error</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-purple-200">
            If you can see this page with all the styling applied, Tailwind CSS is working correctly! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}