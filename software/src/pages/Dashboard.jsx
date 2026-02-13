import { ArrowUpRight, Activity, Wind, Droplet, AlertTriangle, Check, TrendingUp, TrendingDown, Radio, Heart, Thermometer, Droplets, Wifi, WifiOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotGrid from '../components/DotGrid'
import { useSensorData } from '../hooks/useSensorData'

const Dashboard = () => {
  const { data, connected } = useSensorData(1500)

  if (!data) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <DotGrid dotSize={5} gap={15} baseColor="#271E37" activeColor="#5227FF" proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-inter text-white/60">Loading sensor data...</p>
        </div>
      </div>
    )
  }

  const { spo2, heart_rate, accelerometer, gyroscope, fall_detection, environment, devices } = data

  const axPct = Math.min(Math.abs(accelerometer.x) / 2 * 100, 100)
  const ayPct = Math.min(Math.abs(accelerometer.y) / 2 * 100, 100)
  const azPct = Math.min(Math.abs(accelerometer.z) / 2 * 100, 100)

  const fallColor = fall_detection.detected ? 'red' : 'green'
  const spo2Trend = spo2.value >= 95

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* DotGrid Background */}
      <div className="absolute inset-0 z-0">
        <DotGrid dotSize={5} gap={15} baseColor="#271E37" activeColor="#5227FF" proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-[120px] pt-28 pb-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">Overview</h1>
            <p className="font-inter text-base text-white/60">
              Real-time sensor data and safety monitoring
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-cabin text-sm ${connected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? 'ML Server Connected' : 'Simulated Data'}
            </div>
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
                  <span className="font-serif text-7xl md:text-8xl text-white transition-all duration-500">{spo2.value}</span>
                  <span className="font-manrope text-3xl text-white/80">{spo2.unit}</span>
                </div>
                <p className="font-inter text-sm text-white/70 mt-2">SPO2 Saturation</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg">
                  {spo2Trend ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                  <span className="font-inter text-sm text-white">{spo2.status}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg">
                  <Heart size={16} className="text-red-400" />
                  <span className="font-inter text-sm text-white">{heart_rate.value} {heart_rate.unit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-cabin text-sm text-white/80 mb-1">Motion Detection</h3>
                <p className="font-serif text-2xl text-white">{accelerometer.activity}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">X-Axis</span>
                <span className="font-manrope text-sm text-white">{accelerometer.x}g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.max(axPct, 2)}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">Y-Axis</span>
                <span className="font-manrope text-sm text-white">{accelerometer.y}g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.max(ayPct, 2)}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-white/60">Z-Axis</span>
                <span className="font-manrope text-sm text-white">{accelerometer.z}g</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${Math.max(azPct, 2)}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`bg-[#1a1a1a]/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${fall_detection.detected ? 'border-red-500/50 hover:border-red-500/80' : 'border-[#2a2a2a] hover:border-green-500/30'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fall_detection.detected ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                {fall_detection.detected
                  ? <AlertTriangle size={20} className="text-red-500 animate-pulse" />
                  : <Check size={20} className="text-green-500" />
                }
              </div>
              <h3 className="font-cabin text-sm text-white/80">Fall Detection</h3>
            </div>
            <p className={`font-serif text-3xl mb-2 ${fall_detection.detected ? 'text-red-400' : 'text-white'}`}>
              {fall_detection.status}
            </p>
            <p className="font-inter text-sm text-white/60">
              Probability: {(fall_detection.probability * 100).toFixed(1)}%
            </p>
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <p className="font-inter text-xs text-white/50">Threshold Sensitivity</p>
              <p className="font-manrope text-sm text-primary mt-1">{fall_detection.sensitivity}</p>
            </div>
          </div>

          <div className={`bg-[#1a1a1a]/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${environment.air_quality === 'Hazardous' ? 'border-red-500/50' : 'border-[#2a2a2a] hover:border-primary/30'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${environment.air_quality === 'Good' ? 'bg-blue-500/20' : environment.air_quality === 'Moderate' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                <Wind size={20} className={environment.air_quality === 'Good' ? 'text-blue-400' : environment.air_quality === 'Moderate' ? 'text-yellow-400' : 'text-red-400'} />
              </div>
              <h3 className="font-cabin text-sm text-white/80">Air Quality</h3>
            </div>
            <p className={`font-serif text-3xl mb-2 ${environment.air_quality === 'Hazardous' ? 'text-red-400' : 'text-white'}`}>
              {environment.air_quality}
            </p>
            <p className="font-inter text-sm text-white/60">{environment.air_status}</p>
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-white/50">Gas Level</span>
                <span className={`font-manrope text-sm ${environment.gas_ppm < 25 ? 'text-green-400' : environment.gas_ppm < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {environment.gas_ppm} ppm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-white/50">Temp</span>
                <span className="font-manrope text-sm text-white/80">{environment.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-white/50">Humidity</span>
                <span className="font-manrope text-sm text-white/80">{environment.humidity}%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-cabin text-base text-white">Gyroscope</h3>
              <span className="font-inter text-xs text-white/60">°/s</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#0a0a0a] rounded-xl text-center">
                <p className="font-inter text-xs text-white/50 mb-2">Roll (X)</p>
                <p className="font-manrope text-2xl text-white">{gyroscope.x}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl text-center">
                <p className="font-inter text-xs text-white/50 mb-2">Pitch (Y)</p>
                <p className="font-manrope text-2xl text-white">{gyroscope.y}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl text-center">
                <p className="font-inter text-xs text-white/50 mb-2">Yaw (Z)</p>
                <p className="font-manrope text-2xl text-white">{gyroscope.z}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <h3 className="font-cabin text-base text-white mb-6">Device Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Radio size={16} className="text-primary" />
                  <span className="font-cabin text-xs text-white/60">ESP32</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">{devices.esp32.status}</p>
                <p className="font-inter text-xs text-green-400">{devices.esp32.connection}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={16} className="text-blue-400" />
                  <span className="font-cabin text-xs text-white/60">MPU6050</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">{devices.mpu6050.status}</p>
                <p className="font-inter text-xs text-green-400">{devices.mpu6050.connection}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Droplet size={16} className="text-red-400" />
                  <span className="font-cabin text-xs text-white/60">SPO2 Sensor</span>
                </div>
                <p className="font-manrope text-lg text-white mb-1">{devices.spo2_sensor.status}</p>
                <p className="font-inter text-xs text-green-400">{devices.spo2_sensor.connection}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className={devices.buzzer.status === 'ALERT' ? 'text-red-400 animate-pulse' : 'text-yellow-400'} />
                  <span className="font-cabin text-xs text-white/60">Buzzer</span>
                </div>
                <p className={`font-manrope text-lg mb-1 ${devices.buzzer.status === 'ALERT' ? 'text-red-400' : 'text-white'}`}>{devices.buzzer.status}</p>
                <p className="font-inter text-xs text-white/60">{devices.buzzer.connection}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
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
