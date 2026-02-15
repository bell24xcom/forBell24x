import React from 'react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-8 text-cyan-400">How It Works</h1>
      <ul className="space-y-4 text-lg">
        <li>1️⃣ <span className="text-cyan-300 font-bold">Speak, record, or type</span> your RFQ (supports 12 languages)</li>
        <li>2️⃣ <span className="text-cyan-300 font-bold">AI matches</span> you with best-fit suppliers instantly</li>
        <li>3️⃣ <span className="text-cyan-300 font-bold">Review quotes</span> and complete your deal - fast, secure, trusted</li>
      </ul>
      <p className="mt-8 text-gray-400">Contact us for more details: support@bell24h.com</p>
    </div>
  );
}
