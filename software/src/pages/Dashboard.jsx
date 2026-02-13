import { ArrowUpRight, Activity, Wind, Droplet, AlertTriangle, Check, X, TrendingUp, Radio } from 'lucide-react'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 md:px-[120px] pt-28 pb-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">Overview</h1>
            <p className="font-inter text-base text-white/60">
              Real-time sensor data and safety monitoring
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-primary rounded-lg font-cabin text-sm text-white">
              Live
            </button>
            <button className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg font-cabin text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors">
              Last Hour
            </button>
            <button className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg font-cabin text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors">
              Today
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
          
          {/* Large Feature Card - SPO2 Monitor */}
          <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-primary to-accent rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:shadow-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="font-cabin text-sm text-white/80">Blood Oxygen Level</span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-cabin text-xs text-white">Active</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-7xl md:text-8xl text-white">98</span>
                  <span className="font-manrope text-3xl text-white/80">%</span>
                </div>
                <p className="font-inter text-sm text-white/70 mt-2">SPO2 Saturation</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg inline-flex">
                <TrendingUp size={16} className="text-green-400" />
                <span className="font-inter text-sm text-white">Normal Range</span>
              </div>
            </div>
          </div>

          {/* Accelerometer Activity */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-cabin text-sm text-white/80 mb-1">Motion Detection</h3>
                <p className="font-serif text-2xl text-white">Stable</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">X-Axis</span>
                <span className="font-manrope text-sm text-white">0.02g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[12%] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">Y-Axis</span>
                <span className="font-manrope text-sm text-white">-0.01g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[8%] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">Z-Axis</span>
                <span className="font-manrope text-sm text-white">1.00g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[100%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Fall Detection Status */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-green-500" />
              </div>
              <h3 className="font-cabin text-sm text-white/80">Fall Detection</h3>
            </div>
            <p className="font-serif text-3xl text-white mb-2">No Falls</p>
            <p className="font-inter text-sm text-white/60">Last 24 hours</p>
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <p className="font-inter text-xs text-white/50">Threshold Sensitivity</p>
              <p className="font-manrope text-sm text-primary mt-1">High</p>
            </div>
          </div>

          {/* Environmental Monitor */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Wind size={20} className="text-blue-400" />
              </div>
              <h3 className="font-cabin text-sm text-white/80">Air Quality</h3>
            </div>
            <p className="font-serif text-3xl text-white mb-2">Good</p>
            <p className="font-inter text-sm text-white/60">Safe working conditions</p>
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-white/50">Gas Level</span>
                <span className="font-manrope text-sm text-green-400">Normal</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-cabin text-base text-white">Recent Alerts</h3>
              <span className="font-inter text-xs text-white/60">Last 24 hours</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-green-500/20">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={16} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-cabin text-sm text-white">System Check Complete</p>
                    <span className="font-inter text-xs text-white/50">2h ago</span>
                  </div>
                  <p className="font-inter text-xs text-white/60">All sensors operational</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-yellow-500/20">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle size={16} className="text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-cabin text-sm text-white">Battery Low Warning</p>
                    <span className="font-inter text-xs text-white/50">5h ago</span>
                  </div>
                  <p className="font-inter text-xs text-white/60">Device battery at 15%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Status Grid */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <h3 className="font-cabin text-base text-white mb-6">Device Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Radio size={16} className="text-primary" />
                  <span className="font-cabin text-xs text-white/60">ESP32</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">Online</p>
                <p className="font-inter text-xs text-green-400">Connected</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={16} className="text-blue-400" />
                  <span className="font-cabin text-xs text-white/60">MPU6050</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">Active</p>
                <p className="font-inter text-xs text-green-400">Streaming</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Droplet size={16} className="text-red-400" />
                  <span className="font-cabin text-xs text-white/60">SPO2 Sensor</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">Active</p>
                <p className="font-inter text-xs text-green-400">98% Ready</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <span className="font-cabin text-xs text-white/60">Buzzer</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">Standby</p>
                <p className="font-inter text-xs text-white/60">Ready</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <h3 className="font-cabin text-base text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-accent rounded-xl font-cabin text-sm text-white hover:bg-accent/80 transition-colors text-left flex items-center justify-between group">
                <span>Test Alert System</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="p-4 bg-accent rounded-xl font-cabin text-sm text-white hover:bg-accent/80 transition-colors text-left flex items-center justify-between group">
                <span>Download Report</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="p-4 bg-accent rounded-xl font-cabin text-sm text-white hover:bg-accent/80 transition-colors text-left flex items-center justify-between group">
                <span>Configure Sensors</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
