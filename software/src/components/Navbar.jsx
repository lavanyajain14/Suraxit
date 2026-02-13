import { Menu } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-20 px-6 md:px-[120px] py-[16px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M1.04356 6.35771L13.6437 0.666504C14.4831 0.301764 15.4435 0.301764 16.2829 0.666504L28.883 6.35771C30.1618 6.9226 31 8.18146 31 9.57523V22.4248C31 23.8185 30.1618 25.0774 28.883 25.6423L16.2829 31.3335C15.4435 31.6982 14.4831 31.6982 13.6437 31.3335L1.04356 25.6423C-0.235232 25.0774 -1.07343 23.8185 -1.07343 22.4248V9.57523C-1.07343 8.18146 -0.235232 6.9226 1.04356 6.35771Z"
                fill="white"
                transform="translate(5, 5)"
              />
            </svg>
            <span className="ml-3 font-manrope font-bold text-xl text-white">Suraxit</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="font-manrope font-medium text-sm text-white hover:opacity-80 transition-opacity">
              Home
            </a>
            <a href="#features" className="font-manrope font-medium text-sm text-white hover:opacity-80 transition-opacity">
              Features
            </a>
            <a href="#contact" className="font-manrope font-medium text-sm text-white hover:opacity-80 transition-opacity">
              Contact
            </a>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2.5 bg-white border border-[#d4d4d4] rounded-lg text-[#171717] font-manrope font-semibold text-sm hover:bg-gray-100 transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2.5 bg-primary rounded-lg text-[#fafafa] font-manrope font-semibold text-sm shadow-lg hover:bg-purple-600 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white text-2xl"
            >
              ×
            </button>
            <a href="/" className="font-manrope font-medium text-2xl text-white">Home</a>
            <a href="#features" className="font-manrope font-medium text-2xl text-white">Features</a>
            <a href="#contact" className="font-manrope font-medium text-2xl text-white">Contact</a>
            <div className="flex flex-col gap-4 mt-8">
              <button className="px-6 py-3 bg-white rounded-lg text-black font-manrope font-semibold">
                Sign In
              </button>
              <button className="px-6 py-3 bg-primary rounded-lg text-white font-manrope font-semibold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
