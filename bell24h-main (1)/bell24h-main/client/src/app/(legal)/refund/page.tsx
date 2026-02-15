import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-4xl font-black mb-8 text-cyan-400">Refund Policy</h1>
      <p className="mb-4 text-lg">BELL operates as a B2B platform provider. All payments and refunds are handled directly between buyers and suppliers unless BELL is explicitly listed as a payment processor or escrow. For disputes, contact your transaction partner or support@bell24h.com for assistance.</p>
      <p className="mt-6 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  );
}
