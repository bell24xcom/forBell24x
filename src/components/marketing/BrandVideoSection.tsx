'use client'

export default function BrandVideoSection() {
  return (
    <section className="w-full py-16 px-4 flex flex-col items-center
                        bg-[#000c18]">
      <p className="text-xs font-semibold text-[#00A7A0] tracking-[3px]
                    uppercase mb-3">
        See VyaparSethu in Action
      </p>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Bad Debt Khatam
      </h2>
      <p className="text-white/70 text-sm mb-8 text-center max-w-xs">
        India's First Trusted B2B Trade Network
      </p>
      <div className="relative w-full max-w-[280px] mx-auto aspect-[9/16]
                      rounded-[28px] overflow-hidden
                      border border-[#D4AF37]/20
                      shadow-[0_0_80px_rgba(212,175,55,0.12)]">
        <video
          src="/brand-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.22) translateY(-7%)', transformOrigin: 'center top' }}
        >
          <track kind="captions" src="" label="No dialogue" srcLang="en" default />
        </video>
      </div>
      <p className="mt-6 text-[#D4AF37] text-xs tracking-widest uppercase">
        vyaparsethu.com
      </p>
    </section>
  )
}
