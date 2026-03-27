import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-8 text-cyan-400">About BELL</h1>
      <p className="mb-4 text-xl font-semibold">
        BELL is India's first AI-powered B2B procurement platform. Our mission: connect Indian businesses with verified suppliers using voice, video, and AI in 12+ languages.
      </p>
      <ul className="my-6 space-y-2">
        <li>🔔 Over 10,000+ verified suppliers & buyers</li>
        <li>🌎 Pan-India coverage; local + export businesses</li>
        <li>📈 AI-matching, voice/video/text RFQs, 24H quoting</li>
        <li>🇮🇳 Made in India, for India</li>
      </ul>
      <div className="mt-8 bg-gray-900/50 p-4 rounded-lg">
        <p className="font-mono">Contact: <a href="mailto:support@bell24h.com" className="text-cyan-400 underline">support@bell24h.com</a></p>
      </div>
    </div>
  );
}
