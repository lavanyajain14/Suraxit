import { useNavigate } from 'react-router-dom'
import { Activity, Shield, Radio, Heart, Wind, Users, ArrowRight, Zap, Lock, Globe, ChevronRight, Cpu, Brain, Link2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotGrid from '../components/DotGrid'
import Footer from '../components/Footer'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden bg-[#0a0a0a]">
      {/* DotGrid Background — covers the full page */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* ================================================================ */}
      {/* SECTION 1 — Hero                                                 */}
      {/* ================================================================ */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-3 px-4 h-[38px] rounded-[10px] bg-[rgba(85,80,110,0.4)] backdrop-blur-md border border-[rgba(164,132,215,0.5)] mb-8">
          <span className="px-2.5 py-1 bg-primary rounded-md font-cabin font-medium text-sm text-white">
            New
          </span>
          <span className="font-cabin font-medium text-sm text-white">
            Advanced Fall Detection &amp; Safety Monitoring
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-white text-5xl md:text-[96px] leading-[1.05] mb-6 max-w-5xl">
          Real-time monitoring <span className="italic">and</span> safety alerts
        </h1>

        {/* Subtext */}
        <p className="font-inter text-lg text-white/70 max-w-[662px] mb-10">
          Track vital signs, detect falls instantly, and ensure worker safety
          with our advanced sensor&nbsp;network. Monitor SPO2, accelerometer
          data, and environmental conditions — all in&nbsp;real&#8209;time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="group px-8 py-4 bg-primary rounded-[10px] font-cabin font-medium text-base text-white hover:bg-purple-600 transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            View Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-accent rounded-[10px] font-cabin font-medium text-base text-[#f6f7f9] hover:bg-[#3a2f5a] transition-all duration-300"
          >
            Learn More
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="font-inter text-xs text-white/50">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2 — Features                                             */}
      {/* ================================================================ */}
      <section id="features" className="relative z-10 py-28 md:py-36 px-6 md:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap size={14} className="text-primary" />
              <span className="font-cabin text-sm text-primary">Core Capabilities</span>
            </div>
            <h2 className="font-serif text-white text-4xl md:text-6xl leading-[1.1] mb-5">
              Everything you need to <br className="hidden md:block" />
              <span className="italic">keep workers safe</span>
            </h2>
            <p className="font-inter text-white/50 text-base md:text-lg max-w-xl mx-auto">
              A unified platform combining hardware sensors, machine learning,
              and blockchain-backed identity — purpose-built for hazardous work
              environments.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Heart size={24} />,
                title: 'SPO2 & Heart Rate',
                desc: 'Continuous blood-oxygen and pulse monitoring. Instant alerts when vitals drop below safe thresholds.',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20'
              },
              {
                icon: <Activity size={24} />,
                title: 'Fall Detection',
                desc: 'ML-powered fall recognition using accelerometer and gyroscope data with sub-second response time.',
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20'
              },
              {
                icon: <Wind size={24} />,
                title: 'Air Quality',
                desc: 'Toxic gas concentration, temperature, and humidity tracking for confined-space and sewage work.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20'
              },
              {
                icon: <Shield size={24} />,
                title: 'On-Chain Identity',
                desc: 'Solana-based username registry and encryption key management — no central server owns your data.',
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
                border: 'border-indigo-500/20'
              },
              {
                icon: <Brain size={24} />,
                title: 'Edge ML Inference',
                desc: 'TFLite model runs predictions directly on the device. Offline-capable fall detection with 561-feature analysis.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20'
              },
              {
                icon: <Users size={24} />,
                title: 'Team Management',
                desc: 'Encrypted group channels with role-based access. Supervisors manage teams via blockchain smart contracts.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20'
              }
            ].map((f, i) => (
              <div
                key={i}
                className={`group p-6 md:p-8 bg-[#1a1a1a]/60 backdrop-blur-sm border ${f.border} rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-cabin text-lg text-white mb-2">{f.title}</h3>
                <p className="font-inter text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3 — How It Works                                         */}
      {/* ================================================================ */}
      <section className="relative z-10 py-28 md:py-36 px-6 md:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Radio size={14} className="text-primary" />
              <span className="font-cabin text-sm text-primary">Workflow</span>
            </div>
            <h2 className="font-serif text-white text-4xl md:text-6xl leading-[1.1] mb-5">
              From sensor <span className="italic">to safety</span>
            </h2>
            <p className="font-inter text-white/50 text-base md:text-lg max-w-xl mx-auto">
              Four layers working together — hardware, AI, dashboard, and blockchain — to create a complete safety net.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: <Cpu size={28} />,
                title: 'Sensor Capture',
                desc: 'ESP32 collects accelerometer, gyroscope, SPO2, and environmental data from on-body hardware at 50 Hz.',
                accent: 'from-primary/20 to-transparent'
              },
              {
                step: '02',
                icon: <Brain size={28} />,
                title: 'ML Prediction',
                desc: 'A TFLite binary classifier analyses 561 motion features to detect falls with sub-second latency.',
                accent: 'from-emerald-500/20 to-transparent'
              },
              {
                step: '03',
                icon: <Activity size={28} />,
                title: 'Live Dashboard',
                desc: 'Real-time bento-grid UI streams all vitals, fall probability, air quality, and device status to supervisors.',
                accent: 'from-blue-500/20 to-transparent'
              },
              {
                step: '04',
                icon: <Lock size={28} />,
                title: 'Blockchain Layer',
                desc: 'Solana smart contracts handle identity, encryption keys, and group access — zero backend, full sovereignty.',
                accent: 'from-indigo-500/20 to-transparent'
              }
            ].map((s, i) => (
              <div key={i} className="relative group">
                {/* Connector line (hidden on last card) */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 border-t border-dashed border-white/10 z-0"></div>
                )}
                <div className="relative bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 h-full">
                  {/* Gradient glow */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${s.accent} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <span className="font-manrope text-4xl font-bold text-white/10 mb-4 block">{s.step}</span>
                    <div className="text-primary mb-4">{s.icon}</div>
                    <h3 className="font-cabin text-lg text-white mb-2">{s.title}</h3>
                    <p className="font-inter text-sm text-white/50 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4 — Web3 / Blockchain Highlight                          */}
      {/* ================================================================ */}
      <section className="relative z-10 py-28 md:py-36 px-6 md:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Globe size={14} className="text-indigo-400" />
                <span className="font-cabin text-sm text-indigo-400">Powered by Solana</span>
              </div>
              <h2 className="font-serif text-white text-4xl md:text-5xl leading-[1.1] mb-6">
                Decentralized identity <span className="italic">for every worker</span>
              </h2>
              <p className="font-inter text-white/50 text-base leading-relaxed mb-8 max-w-lg">
                Traditional safety platforms store worker identities on a
                company database. Suraxit puts it on the Solana blockchain —
                workers own their credentials, encryption keys are exchanged
                trustlessly, and access is governed by on-chain smart contracts,
                not admin panels.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { label: 'Username PDA — globally unique, enforced by Solana runtime' },
                  { label: 'X25519 encryption keys stored on-chain for E2E data privacy' },
                  { label: 'Role-based group access — Owner / Admin / Moderator / Member' },
                  { label: 'Invite links with on-chain expiry & usage limits' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight size={12} className="text-indigo-400" />
                    </div>
                    <span className="font-inter text-sm text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="group px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-cabin text-sm text-white transition-colors flex items-center gap-2"
              >
                Connect Wallet on Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right — Visual / Stats card */}
            <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-8 md:p-10 space-y-6">
              {/* Fake terminal header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                <span className="ml-3 font-mono text-xs text-white/30">key-registry — devnet</span>
              </div>

              {/* Code-style stats */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400">network</span>
                  <span className="text-white/30">:</span>
                  <span className="text-emerald-400">Solana Devnet</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400">program</span>
                  <span className="text-white/30">:</span>
                  <span className="text-white/60 truncate">key_registry</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400">framework</span>
                  <span className="text-white/30">:</span>
                  <span className="text-white/60">Anchor 0.29.0</span>
                </div>
                <div className="h-px bg-white/5 my-2"></div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">instructions</span>
                  <span className="text-white/30">:</span>
                  <span className="text-white/80">15</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">accounts</span>
                  <span className="text-white/30">:</span>
                  <span className="text-white/80">5 (PDA-derived)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">tx_cost</span>
                  <span className="text-white/30">:</span>
                  <span className="text-emerald-400">~$0.00025</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">finality</span>
                  <span className="text-white/30">:</span>
                  <span className="text-emerald-400">~400ms</span>
                </div>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {['Username Registry', 'Group Chat', 'E2E Encryption', 'Invite Links', 'Role-based ACL'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/15 rounded-full font-inter text-xs text-indigo-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5 — CTA Banner                                           */}
      {/* ================================================================ */}
      <section className="relative z-10 py-20 px-6 md:px-[120px]">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="font-serif text-white text-3xl md:text-5xl leading-[1.1] mb-4">
                Ready to protect your team?
              </h2>
              <p className="font-inter text-white/70 text-base md:text-lg max-w-lg mx-auto mb-8">
                Deploy sensors, connect your dashboard, and register on-chain
                identity — everything you need in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group px-8 py-4 bg-white rounded-[10px] font-cabin font-medium text-base text-[#0a0a0a] hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  Open Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 backdrop-blur rounded-[10px] font-cabin font-medium text-base text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Link2 size={16} />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Landing
