import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-devices-1046-large.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 mt-32">
        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-3 px-4 h-[38px] rounded-[10px] bg-[rgba(85,80,110,0.4)] backdrop-blur-md border border-[rgba(164,132,215,0.5)] mb-8">
          <span className="px-2.5 py-1 bg-primary rounded-md font-cabin font-medium text-sm text-white">
            New
          </span>
          <span className="font-cabin font-medium text-sm text-white">
            Advanced Fall Detection & Safety Monitoring
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-white text-5xl md:text-[96px] leading-[1.1] mb-6 max-w-5xl">
          Real-time monitoring <span className="italic">and</span> safety alerts
        </h1>

        {/* Subtext */}
        <p className="font-inter text-lg text-white/70 max-w-[662px] mb-10">
          Track vital signs, detect falls instantly, and ensure worker safety with our advanced sensor network. Monitor SPO2 levels, accelerometer data, and environmental conditions in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-primary rounded-[10px] font-cabin font-medium text-base text-white hover:bg-purple-600 transition-all duration-300 shadow-lg"
          >
            View Dashboard
          </button>
          <button className="px-8 py-4 bg-accent rounded-[10px] font-cabin font-medium text-base text-[#f6f7f9] hover:bg-[#3a2f5a] transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing
