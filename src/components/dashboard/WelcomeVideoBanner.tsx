'use client'
import { useState, useEffect, useRef } from 'react'

export default function WelcomeVideoBanner() {
  const [visible, setVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const seen = localStorage.getItem('vs_welcome_v1')
    if (!seen) {
      setVisible(true)
      const t = setTimeout(() => dismiss(), 28000)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('vs_welcome_v1', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="w-full mb-6 rounded-2xl overflow-hidden
                    bg-[#000c18] border border-[#D4AF37]/20
                    shadow-[0_0_40px_rgba(212,175,55,0.08)]">
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Video panel */}
        <div className="flex-shrink-0 w-full sm:w-40 relative
                        bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/brand-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scale(1.22) translateY(-7%)', transformOrigin: 'center top' }}
          />
        </div>

        {/* Content panel */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#00A7A0] tracking-[3px] uppercase mb-2">
              Welcome to VyaparSethu
            </p>
            <h3 className="text-white font-bold text-lg leading-snug mb-2">
              Bad Debt Khatam.<br />
              <span className="text-[#D4AF37]">Trade with Confidence.</span>
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              India's first B2B Trade Network with Protected Payments and
              Verified Suppliers. Browse new requirements and submit quotes
              to grow your business.
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[#D4AF37]/40 text-xs tracking-widest uppercase">
              vyaparsethu.com
            </p>
            <button
              onClick={dismiss}
              className="text-white/40 hover:text-white/80 text-xs px-3 py-1.5
                         rounded-lg border border-white/10 hover:border-white/20
                         transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
