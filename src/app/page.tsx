'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
        Find Verified Suppliers in 24 Hours
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
        India's AI-powered B2B RFQ marketplace. Voice, Video, and Text RFQs
        matched to verified suppliers instantly.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/rfq/create')}
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            minHeight: '44px'
          }}>
          🎤 Post Voice RFQ Free →
        </button>
        <button
          onClick={() => router.push('/marketplace')}
          style={{
            backgroundColor: 'transparent',
            color: '#94a3b8',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
            fontSize: '1rem',
            cursor: 'pointer',
            minHeight: '44px'
          }}>
          Browse Live RFQs
        </button>
      </div>
      <div style={{
        marginTop: '4rem',
        display: 'flex',
        gap: '3rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { value: '157', label: 'Verified Suppliers' },
          { value: '450+', label: 'Categories' },
          { value: '24H', label: 'Response Time' }
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {stat.value}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <p style={{
        position: 'fixed', bottom: '1rem',
        color: '#1e293b', fontSize: '0.75rem'
      }}>
        bell24h.com — B2B RFQ Intelligence Platform
      </p>
    </main>
  );
}
