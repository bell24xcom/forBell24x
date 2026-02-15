import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-4xl font-black mb-8 text-cyan-400">Privacy Policy</h1>
      <p className="mb-4 text-lg">Your privacy is important to us at BELL (bell24h.com). This page outlines what data we collect and how we use it.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>We only collect necessary data (account, RFQ, and customer support).</li>
        <li>We never sell your data to third parties.</li>
        <li>Data is stored securely using industry standards.</li>
        <li>Contact support@bell24h.com for any privacy-related requests.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-400">BELL &copy; {new Date().getFullYear()} | Made in India</p>
    </div>
  );
}
