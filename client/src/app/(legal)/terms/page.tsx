import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-4xl font-black mb-8 text-cyan-400">Terms of Service</h1>
      <p className="mb-4 text-lg">By using bell24h.com (“BELL”), you agree to our terms and conditions. Please review carefully.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Platform is for B2B use only.</li>
        <li>No prohibited products or services.</li>
        <li>BELL is not liable for user transactions. Use due diligence.</li>
        <li>Terms may change; you are responsible for reviewing updates.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-400">Questions: support@bell24h.com</p>
    </div>
  );
}
