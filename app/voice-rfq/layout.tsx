import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice RFQ — Speak Your Requirement in Hindi or English',
  description: 'Post a procurement request by speaking. AI converts your voice into a structured RFQ in seconds. Get quotes from verified suppliers across India.',
  openGraph: {
    title: 'Voice RFQ — Post Your Requirement by Speaking | Bell24h',
    description: 'India\'s first voice-powered B2B procurement. Speak in Hindi or English — AI does the rest.',
    url: 'https://bell24h.com/voice-rfq',
  },
};

export default function VoiceRFQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
