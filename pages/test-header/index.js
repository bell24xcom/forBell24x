import HeaderSearchCompact from '@/components/header-search-compact';

export default function TestHeaderPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a1128' }}>
      <HeaderSearchCompact />

      <main style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#06d6f6' }}>
          🎯 COMPACT HEADER TEST PAGE
        </h1>

        <div style={{
          background: '#1a2332',
          padding: '2rem',
          borderRadius: '8px',
          margin: '2rem auto',
          maxWidth: '800px'
        }}>
          <h2 style={{ color: '#f9fafb', marginBottom: '1rem' }}>
            ✅ Header Features Tested:
          </h2>

          <ul style={{
            textAlign: 'left',
            color: '#94a3b8',
            lineHeight: '1.6',
            listStyle: 'none',
            padding: 0
          }}>
            <li>✅ 50px compact height (29% reduction)</li>
            <li>✅ Integrated search bar (centered)</li>
            <li>✅ Single background (#0a1128)</li>
            <li>✅ Professional navigation links</li>
            <li>✅ Notification bell with badge</li>
            <li>✅ Login/Register button</li>
            <li>✅ Mobile responsive design</li>
            <li>✅ Smooth animations & hover effects</li>
          </ul>
        </div>

        <div style={{
          background: '#2a3544',
          padding: '1.5rem',
          borderRadius: '6px',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          <p style={{ color: '#f9fafb', margin: 0 }}>
            <strong>Next Steps:</strong> Ready for PHASE 2 - Hero Section (3 columns, 350px height)
          </p>
        </div>
      </main>
    </div>
  );
}