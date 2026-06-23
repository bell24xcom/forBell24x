'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: 'fixed', top: '20px', right: '20px',
        background: '#0B1F45', color: '#D4AF37',
        border: 'none', padding: '10px 20px', borderRadius: '8px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        zIndex: 999,
      }}
      className="print-hide"
    >
      Print / Save as PDF
    </button>
  );
}
