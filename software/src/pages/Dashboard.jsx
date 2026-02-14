import { useState, useEffect } from 'react'
import { ArrowUpRight, Activity, Wind, Droplet, AlertTriangle, Check, TrendingUp, TrendingDown, Radio, Heart, Thermometer, Droplets, Wifi, WifiOff, Wallet, Link2, Users, Shield, Copy, ExternalLink, RefreshCw, Zap, ZapOff, Cpu, Signal, SignalZero, Timer, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotGrid from '../components/DotGrid'
import { useSensorData } from '../hooks/useSensorData'
import { useMeshStatus } from '../hooks/useMeshStatus'
import { useWallet } from '../solana/WalletProvider'
import { useKeyRegistry } from '../hooks/useKeyRegistry'

const Dashboard = () => {
  const { data, connected, hardwareOnline } = useSensorData(1500)
  const meshCtx = useMeshStatus(2000)
  const walletCtx = useWallet()
  const registry = useKeyRegistry()
  const [usernameInput, setUsernameInput] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerMsg, setRegisterMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false)
  const [blackoutCountdown, setBlackoutCountdown] = useState(0)

  // Show emergency overlay when fall is detected
  useEffect(() => {
    if (data?.fall_detection?.detected) {
      setShowEmergencyOverlay(true)
      const timer = setTimeout(() => setShowEmergencyOverlay(false), 30000)
      return () => clearTimeout(timer)
    }
  }, [data?.fall_detection?.detected])

  // Blackout countdown timer
  useEffect(() => {
    if (meshCtx.blackoutRemaining > 0) {
      setBlackoutCountdown(Math.ceil(meshCtx.blackoutRemaining))
      const interval = setInterval(() => {
        setBlackoutCountdown(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setBlackoutCountdown(0)
    }
  }, [meshCtx.blackoutRemaining])

  const handleRegister = async () => {
    if (!usernameInput || usernameInput.length < 3) {
      setRegisterMsg('Username must be at least 3 characters')
      return
    }
    setRegistering(true)
    setRegisterMsg('')
    try {
      await registry.register(usernameInput)
      setRegisterMsg('Registered on-chain!')
      setUsernameInput('')
    } catch (err) {
      setRegisterMsg(err.message?.includes('already in use') ? 'Username taken' : 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const copyAddress = () => {
    if (walletCtx.publicKey) {
      navigator.clipboard.writeText(walletCtx.publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!data) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <DotGrid dotSize={5} gap={15} baseColor="#271E37" activeColor="#5227FF" proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {connected ? (
            // Server is up but no hardware data yet
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                <Cpu size={36} className="text-amber-400 animate-pulse" />
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Waiting for ESP32</h2>
              <p className="font-inter text-sm text-white/50 mb-6">
                Server is running but no hardware data received yet.<br />
                Make sure your ESP32 is powered on and pushing data.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="font-cabin text-sm text-amber-400">Listening for hardware...</span>
              </div>
              <div className="mt-6 p-4 bg-[#1a1a1a]/60 rounded-xl border border-[#2a2a2a] text-left">
                <p className="font-cabin text-xs text-white/40 mb-2">Checklist:</p>
                <ul className="space-y-1 font-inter text-xs text-white/50">
                  <li>• ESP32 connected to Wi-Fi</li>
                  <li>• Posting to <span className="text-amber-400">http://&lt;server-ip&gt;:3000/</span></li>
                  <li>• Flask server running on port 3000</li>
                </ul>
              </div>
            </>
          ) : (
            // Server is down
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <WifiOff size={36} className="text-red-400" />
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Server Offline</h2>
              <p className="font-inter text-sm text-white/50 mb-4">
                Cannot reach the Flask API server.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="font-cabin text-sm text-red-400">Disconnected</span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const { spo2, heart_rate, accelerometer, fall_detection } = data

  const axPct = Math.min(Math.abs(accelerometer.x) / 2 * 100, 100)
  const ayPct = Math.min(Math.abs(accelerometer.y) / 2 * 100, 100)
  const azPct = Math.min(Math.abs(accelerometer.z) / 2 * 100, 100)

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
          <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
            {/* Server connection */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-cabin text-sm ${connected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? 'Server Connected' : 'Offline'}
            </div>
            {/* Data source badge — always hardware when we reach here */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border font-cabin text-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Cpu size={14} />
              ESP32 Hardware
            </div>
            {/* Mesh indicator */}
            {meshCtx.meshActive && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-violet-500/10 border-violet-500/30 text-violet-400 font-cabin text-sm">
                <Signal size={14} />
                ESP-NOW Mesh
              </div>
            )}
            {/* Blackout mode warning */}
            {meshCtx.blackoutMode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-red-500/15 border-red-500/40 text-red-400 font-cabin text-sm animate-pulse">
                <ZapOff size={14} />
                BLACKOUT {blackoutCountdown > 0 && `(${blackoutCountdown}s)`}
              </div>
            )}
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

        {/* Emergency Overlay */}
        {showEmergencyOverlay && data?.fall_detection?.detected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="max-w-lg w-full mx-4 bg-gradient-to-br from-red-950 to-red-900 border-2 border-red-500/60 rounded-2xl p-8 shadow-2xl shadow-red-500/20 animate-pulse-slow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-red-500/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-serif text-3xl text-white">EMERGENCY</h2>
                  <p className="font-inter text-sm text-red-300">Fall Detected — Immediate Attention Required</p>
                </div>
              </div>

              {meshCtx.blackoutMode && (
                <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                  <p className="font-cabin text-sm text-orange-300 flex items-center gap-2">
                    <Signal size={14} />
                    Relayed via ESP-NOW Mesh — Orphan Transaction Path
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-black/30 rounded-lg text-center">
                  <p className="font-inter text-xs text-red-300">SpO2</p>
                  <p className="font-manrope text-2xl text-white">{data.spo2?.value}%</p>
                </div>
                <div className="p-3 bg-black/30 rounded-lg text-center">
                  <p className="font-inter text-xs text-red-300">Heart Rate</p>
                  <p className="font-manrope text-2xl text-white">{data.heart_rate?.value}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-lg text-center">
                  <p className="font-inter text-xs text-red-300">Fall Prob</p>
                  <p className="font-manrope text-2xl text-white">{(data.fall_detection.probability * 100).toFixed(0)}%</p>
                </div>
              </div>

              {meshCtx.emergencies.length > 0 && meshCtx.emergencies[0].solana_tx && (
                <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                  <p className="font-inter text-xs text-indigo-300 mb-1">Orphan Transaction</p>
                  <a href={`https://explorer.solana.com/tx/${meshCtx.emergencies[0].solana_tx}?cluster=devnet`}
                     target="_blank" rel="noopener noreferrer"
                     className="font-mono text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    {meshCtx.emergencies[0].solana_tx.slice(0, 20)}...
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}

              <button
                onClick={() => setShowEmergencyOverlay(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-cabin text-sm text-white transition-colors"
              >
                Acknowledge & Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Blackout Mode Banner */}
        {meshCtx.blackoutMode && (
          <div className="mb-6 relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/80 via-orange-950/80 to-red-950/80 p-5">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,0,0,0.1) 10px, rgba(255,0,0,0.1) 20px)',
                animation: 'slide 1s linear infinite',
              }} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <ZapOff size={24} className="text-red-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-cabin text-lg text-red-300 font-bold">BLACKOUT MODE</h3>
                  <p className="font-inter text-sm text-red-400/80">
                    Wi-Fi down — ESP-NOW mesh relay active — Emergency packets routed through helper nodes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-manrope text-3xl text-red-400">{blackoutCountdown}s</p>
                <p className="font-inter text-xs text-red-400/60">remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">

          {/* Blockchain / Wallet Card */}
          <div className="lg:col-span-4 bg-gradient-to-r from-[#1a1a2e]/90 to-[#16213e]/90 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-cabin text-base text-white">Solana Key Registry</h3>
                  <p className="font-inter text-xs text-white/50 mt-0.5">
                    Devnet &middot; On-chain identity &amp; group management
                  </p>
                </div>
              </div>

              {!walletCtx.connected ? (
                <button
                  onClick={walletCtx.createWallet}
                  disabled={walletCtx.connecting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-lg font-cabin text-sm text-white transition-colors"
                >
                  <Wallet size={16} />
                  {walletCtx.connecting ? 'Creating...' : 'Create Wallet'}
                </button>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Wallet address pill */}
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-xs text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {walletCtx.shortenedAddress}
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-white/40" />}
                  </button>

                  {/* Balance */}
                  <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <span className="font-mono text-xs text-white/80">
                      {walletCtx.balance !== null ? `${walletCtx.balance.toFixed(4)} SOL` : '...'}
                    </span>
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={() => { walletCtx.refreshBalance(); registry.refresh() }}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw size={14} className="text-white/60" />
                  </button>

                  {/* Disconnect */}
                  <button
                    onClick={walletCtx.disconnect}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-cabin text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* On-chain identity section */}
            {walletCtx.connected && (
              <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Username status */}
                <div className="p-4 bg-[#0a0a0a]/60 rounded-xl">
                  <p className="font-inter text-xs text-white/50 mb-2">On-Chain Username</p>
                  {registry.registered ? (
                    <div className="flex items-center gap-2">
                      <span className="font-manrope text-lg text-indigo-400">@{registry.username}</span>
                      <Check size={16} className="text-green-400" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="choose_username"
                        maxLength={20}
                        className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                      />
                      <button
                        onClick={handleRegister}
                        disabled={registering || registry.loading}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-lg font-cabin text-xs text-white transition-colors whitespace-nowrap"
                      >
                        {registering ? '...' : 'Register'}
                      </button>
                    </div>
                  )}
                  {registerMsg && (
                    <p className={`font-inter text-xs mt-2 ${registerMsg.includes('Registered') ? 'text-green-400' : 'text-red-400'}`}>
                      {registerMsg}
                    </p>
                  )}
                </div>

                {/* Groups */}
                <div className="p-4 bg-[#0a0a0a]/60 rounded-xl">
                  <p className="font-inter text-xs text-white/50 mb-2">Groups</p>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" />
                    <span className="font-manrope text-lg text-white">{registry.groups.length}</span>
                    <span className="font-inter text-xs text-white/40">on-chain groups</span>
                  </div>
                  {registry.groups.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {registry.groups.slice(0, 3).map((g, i) => (
                        <p key={i} className="font-inter text-xs text-white/60 truncate">
                          {g.name} &middot; {g.memberCount} members
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Network info */}
                <div className="p-4 bg-[#0a0a0a]/60 rounded-xl">
                  <p className="font-inter text-xs text-white/50 mb-2">Network</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 size={16} className="text-indigo-400" />
                    <span className="font-manrope text-lg text-white capitalize">{walletCtx.network}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-inter text-xs text-white/50">Solana RPC Connected</span>
                  </div>
                  <a
                    href={`https://explorer.solana.com/address/${walletCtx.publicKey?.toBase58()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 font-inter text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Explorer <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}
          </div>
          
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
                  <Radio size={16} className={devices.esp32.status === 'Online' ? 'text-emerald-400' : 'text-primary'} />
                  <span className="font-cabin text-xs text-white/60">ESP32</span>
                </div>
                <p className={`font-manrope text-lg mb-1 ${devices.esp32.status === 'Online' ? 'text-emerald-400' : 'text-white'}`}>{devices.esp32.status}</p>
                <p className={`font-inter text-xs ${devices.esp32.connection === 'Hardware' ? 'text-emerald-400' : 'text-amber-400'}`}>{devices.esp32.connection}</p>
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
                  <Signal size={16} className={devices.esp_now?.status === 'Active' ? 'text-violet-400' : 'text-white/40'} />
                  <span className="font-cabin text-xs text-white/60">ESP-NOW Mesh</span>
                </div>
                <p className={`font-manrope text-lg mb-1 ${devices.esp_now?.status === 'Active' ? 'text-violet-400' : 'text-white/50'}`}>
                  {devices.esp_now?.status || 'Inactive'}
                </p>
                <p className="font-inter text-xs text-white/60">{devices.esp_now?.connection || 'No Peers'}</p>
              </div>
            </div>
          </div>

          {/* ═══ Mesh Network Card ═══ */}
          <div className="lg:col-span-4 bg-gradient-to-r from-[#1a1020]/90 to-[#0f1a2e]/90 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <Signal size={24} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="font-cabin text-base text-white">Mesh Network — Blackout Protocol</h3>
                  <p className="font-inter text-xs text-white/50 mt-0.5">
                    ESP-NOW dual-path relay &middot; Disaster-resilient emergency routing
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-cabin ${
                meshCtx.meshActive
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}>
                <div className={`w-2 h-2 rounded-full ${meshCtx.meshActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                {meshCtx.meshActive ? 'Mesh Active' : 'No Peers'}
              </div>
            </div>

            {/* Network Topology Visualization */}
            <div className="relative h-28 mb-6 flex items-center justify-center">
              {/* Sensor Node */}
              <div className="flex flex-col items-center z-10">
                <div className="w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all bg-emerald-500/20 border-emerald-500/40">
                  <Cpu size={24} className="text-emerald-400" />
                </div>
                <p className="font-cabin text-xs text-white/80 mt-2">Sensor Node</p>
                <p className="font-inter text-[10px] text-emerald-400">Hardware</p>
              </div>

              {/* ESP-NOW Link */}
              <div className="flex-1 max-w-[200px] mx-4 relative">
                <svg className="w-full h-8" viewBox="0 0 200 32">
                  <line x1="0" y1="16" x2="200" y2="16"
                    stroke={meshCtx.meshActive ? '#8b5cf6' : '#333'}
                    strokeWidth="2"
                    strokeDasharray={meshCtx.blackoutMode ? '8,4' : meshCtx.meshActive ? '4,4' : '2,6'}
                    className={meshCtx.meshActive ? 'animate-dash' : ''}
                  />
                  {/* Radio wave dots */}
                  {meshCtx.meshActive && (
                    <>
                      <circle cx="60" cy="16" r="3" fill="#8b5cf6" opacity="0.6" className="animate-ping" />
                      <circle cx="100" cy="16" r="3" fill="#8b5cf6" opacity="0.4" className="animate-ping" style={{ animationDelay: '0.3s' }} />
                      <circle cx="140" cy="16" r="3" fill="#8b5cf6" opacity="0.6" className="animate-ping" style={{ animationDelay: '0.6s' }} />
                    </>
                  )}
                </svg>
                <p className="text-center font-inter text-[10px] text-violet-400/80">
                  {meshCtx.meshActive ? 'ESP-NOW' : 'Waiting...'}
                </p>
              </div>

              {/* Relay Node */}
              <div className="flex flex-col items-center z-10">
                <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                  meshCtx.nodes.some(n => n.node_type === 'relay' && n.online)
                    ? 'bg-violet-500/20 border-violet-500/40'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <Radio size={24} className={
                    meshCtx.nodes.some(n => n.node_type === 'relay' && n.online)
                      ? 'text-violet-400'
                      : 'text-white/40'
                  } />
                </div>
                <p className="font-cabin text-xs text-white/80 mt-2">Relay Node</p>
                <p className={`font-inter text-[10px] ${
                  meshCtx.nodes.some(n => n.node_type === 'relay' && n.online)
                    ? 'text-violet-400' : 'text-white/30'
                }`}>
                  {meshCtx.nodes.some(n => n.node_type === 'relay' && n.online) ? 'Online' : 'Offline'}
                </p>
              </div>

              {/* Internet → Solana */}
              <div className="flex-1 max-w-[120px] mx-4 relative">
                <svg className="w-full h-8" viewBox="0 0 120 32">
                  <line x1="0" y1="16" x2="120" y2="16"
                    stroke={meshCtx.nodes.some(n => n.node_type === 'relay' && n.online && n.wifi) ? '#3b82f6' : '#333'}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                </svg>
                <p className="text-center font-inter text-[10px] text-blue-400/80">Internet</p>
              </div>

              {/* Solana */}
              <div className="flex flex-col items-center z-10">
                <div className="w-16 h-16 rounded-xl border-2 bg-indigo-500/20 border-indigo-500/40 flex items-center justify-center">
                  <Shield size={24} className="text-indigo-400" />
                </div>
                <p className="font-cabin text-xs text-white/80 mt-2">Solana</p>
                <p className="font-inter text-[10px] text-indigo-400">Devnet</p>
              </div>
            </div>

            {/* Mesh Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0a0a0a]/60 rounded-xl">
                <p className="font-inter text-xs text-white/50 mb-1">Data Source</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-manrope text-sm text-emerald-400">Hardware</span>
                </div>
              </div>
              <div className="p-3 bg-[#0a0a0a]/60 rounded-xl">
                <p className="font-inter text-xs text-white/50 mb-1">Mesh Nodes</p>
                <span className="font-manrope text-sm text-white">
                  {meshCtx.nodes.filter(n => n.online).length} / {meshCtx.nodes.length} online
                </span>
              </div>
              <div className="p-3 bg-[#0a0a0a]/60 rounded-xl">
                <p className="font-inter text-xs text-white/50 mb-1">Emergency Relays</p>
                <span className="font-manrope text-sm text-white">{meshCtx.totalEmergencies}</span>
              </div>
              <div className="p-3 bg-[#0a0a0a]/60 rounded-xl">
                <p className="font-inter text-xs text-white/50 mb-1">Network Mode</p>
                <span className={`font-manrope text-sm ${meshCtx.blackoutMode ? 'text-red-400' : 'text-green-400'}`}>
                  {meshCtx.blackoutMode ? 'Blackout' : 'Normal'}
                </span>
              </div>
            </div>

            {/* Recent Emergency Events */}
            {meshCtx.emergencies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-cabin text-xs text-white/50 mb-3">Recent Emergency Relays</p>
                <div className="space-y-2">
                  {meshCtx.emergencies.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={14} className="text-red-400" />
                        <div>
                          <p className="font-inter text-xs text-white/80">
                            {e.alert_type === 1 ? 'Fall' : e.alert_type === 2 ? 'Low SpO2' : e.alert_type === 3 ? 'Gas Hazard' : 'SOS'}
                            {' '}&middot; {e.hop_count || 0} hop{(e.hop_count || 0) !== 1 ? 's' : ''}
                            {e.is_orphan && (
                              <span className="ml-2 px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px] font-cabin">ORPHAN TX</span>
                            )}
                          </p>
                          <p className="font-inter text-[10px] text-white/40">From: {e.origin_mac || '?'} → Relay: {e.relay_mac || '?'}</p>
                        </div>
                      </div>
                      {e.solana_tx && (
                        <a href={`https://explorer.solana.com/tx/${e.solana_tx}?cluster=devnet`}
                           target="_blank" rel="noopener noreferrer"
                           className="font-mono text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          View Tx <ExternalLink size={8} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
            <h3 className="font-cabin text-base text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Simulate Blackout */}
              <button
                onClick={() => meshCtx.simulateBlackout(30)}
                className={`p-4 rounded-xl font-cabin text-sm text-white text-left flex items-center justify-between group transition-colors ${
                  meshCtx.blackoutMode
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                }`}
              >
                <span className="flex items-center gap-2">
                  {meshCtx.blackoutMode ? <Zap size={16} /> : <ZapOff size={16} />}
                  {meshCtx.blackoutMode ? 'Stop Blackout' : 'Simulate Blackout'}
                </span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {/* Simulate Fall */}
              <button
                onClick={() => meshCtx.simulateFall()}
                className="p-4 bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600 rounded-xl font-cabin text-sm text-white text-left flex items-center justify-between group transition-colors"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Simulate Fall
                </span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {/* Test Alert */}
              <button className="p-4 bg-accent rounded-xl font-cabin text-sm text-white hover:bg-accent/80 transition-colors text-left flex items-center justify-between group">
                <span>Test Alert System</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              {/* Download Report */}
              <button className="p-4 bg-accent rounded-xl font-cabin text-sm text-white hover:bg-accent/80 transition-colors text-left flex items-center justify-between group">
                <span>Download Report</span>
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
