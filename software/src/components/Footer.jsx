import { Heart, Github, Twitter, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[120px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path
                  d="M1.04356 6.35771L13.6437 0.666504C14.4831 0.301764 15.4435 0.301764 16.2829 0.666504L28.883 6.35771C30.1618 6.9226 31 8.18146 31 9.57523V22.4248C31 23.8185 30.1618 25.0774 28.883 25.6423L16.2829 31.3335C15.4435 31.6982 14.4831 31.6982 13.6437 31.3335L1.04356 25.6423C-0.235232 25.0774 -1.07343 23.8185 -1.07343 22.4248V9.57523C-1.07343 8.18146 -0.235232 6.9226 1.04356 6.35771Z"
                  fill="white"
                  transform="translate(5, 5)"
                />
              </svg>
              <span className="font-manrope font-bold text-lg text-white">Suraxit</span>
            </div>
            <p className="font-inter text-sm text-white/40 leading-relaxed max-w-xs">
              Fall detection &amp; sewage worker safety monitoring, powered by
              edge ML and Solana blockchain identity.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-cabin font-semibold text-sm text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {['Dashboard', 'Fall Detection', 'Air Quality', 'Sensor Network'].map((item) => (
                <li key={item}>
                  <a href="#" className="font-inter text-sm text-white/40 hover:text-white/80 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-cabin font-semibold text-sm text-white mb-4">Technology</h4>
            <ul className="space-y-3">
              {['Solana Smart Contract', 'TFLite ML Model', 'ESP32 Hardware', 'Anchor Framework'].map((item) => (
                <li key={item}>
                  <a href="#" className="font-inter text-sm text-white/40 hover:text-white/80 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-cabin font-semibold text-sm text-white mb-4">Connect</h4>
            <ul className="space-y-3">
              {[
                { label: 'GitHub', href: 'https://github.com' },
                { label: 'Documentation', href: '#' },
                { label: 'Contact', href: '#contact' }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-inter text-sm text-white/40 hover:text-white/80 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Github size={16} />, href: 'https://github.com' },
                { icon: <Twitter size={16} />, href: '#' },
                { icon: <Mail size={16} />, href: 'mailto:hello@suraxit.com' }
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/30">
            &copy; {new Date().getFullYear()} Suraxit. All rights reserved.
          </p>
          <p className="font-inter text-xs text-white/30 flex items-center gap-1">
            Built with <Heart size={10} className="text-red-400" /> using React, Solana &amp; TensorFlow
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
