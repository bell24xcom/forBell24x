import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VyaparSethu — Protected Trade Infrastructure';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F172A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Tagline pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(6,182,212,0.12)',
            border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: '999px',
            padding: '8px 24px',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: '#22D3EE', fontSize: 18, fontWeight: 600, letterSpacing: '0.05em' }}>
            WIPE OUT BAD DEBT
          </span>
        </div>

        {/* Logo wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '16px' }}>
          <span
            style={{
              fontSize: 86,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-3px',
              lineHeight: 1,
            }}
          >
            Vyapar
          </span>
          <span
            style={{
              fontSize: 86,
              fontWeight: 900,
              color: '#22D3EE',
              letterSpacing: '-3px',
              lineHeight: 1,
            }}
          >
            Sethu
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: '#94A3B8',
            letterSpacing: '0.02em',
            marginBottom: '48px',
          }}
        >
          Protected Trade Infrastructure · Made in India
        </div>

        {/* Three pillars */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { icon: '✓', label: 'Verified Matching' },
            { icon: '🔒', label: 'Protected Payment' },
            { icon: '⚡', label: 'Faster Trade' },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px 24px',
              }}
            >
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ color: '#CBD5E1', fontSize: 18, fontWeight: 500 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 40,
            color: '#475569',
            fontSize: 16,
            letterSpacing: '0.05em',
          }}
        >
          vyaparsethu.com
        </div>
      </div>
    ),
    { ...size }
  );
}
