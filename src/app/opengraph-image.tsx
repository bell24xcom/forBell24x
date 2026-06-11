import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'VyaparSethu — Protected Trade Infrastructure'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ background: '#0B1F45', width: '100%', height: '100%', display: 'flex',
          flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
          padding: '60px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ color: '#00A7A0', fontSize: '72px', fontWeight: 'bold', marginRight: '4px' }}>V</div>
          <div style={{ color: '#ffffff', fontSize: '52px', fontWeight: 'bold' }}>yaparSethu</div>
        </div>
        <div style={{ color: '#F7F5F0', fontSize: '28px', marginBottom: '12px' }}>
          Protected Trade Infrastructure for Indian MSMEs
        </div>
        <div style={{ background: '#00A7A0', color: '#ffffff', padding: '12px 28px',
            borderRadius: '24px', fontSize: '22px', fontWeight: 'bold', marginBottom: '32px' }}>
          Wipe Out Bad Debt
        </div>
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <div style={{ color: '#ffffff', fontSize: '20px' }}>✓ Verified Suppliers</div>
          <div style={{ color: '#ffffff', fontSize: '20px' }}>✓ Protected Payments</div>
          <div style={{ color: '#ffffff', fontSize: '20px' }}>✓ 24-Hour Quotations</div>
        </div>
        <div style={{ color: '#9ECACA', fontSize: '18px' }}>vyaparsethu.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
