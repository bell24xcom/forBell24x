import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-8 text-cyan-400">Contact</h1>
      <p className="mb-4 text-xl">Have questions? Email <a href="mailto:support@bell24h.com" className="text-cyan-400 underline">support@bell24h.com</a>.</p>
      <div className="bg-gray-900/70 p-8 rounded-xl">
        <h2 className="text-lg mb-4 font-bold">Contact Form (Coming Soon)</h2>
        <input className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-400" placeholder="Your email" disabled />
        <textarea className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-400" placeholder="Your message" rows={4} disabled></textarea>
        <button className="w-full px-6 py-3 rounded-lg bg-cyan-500 font-bold text-white opacity-50 cursor-not-allowed" disabled>Send (Soon)</button>
      </div>
    </div>
  );
}
