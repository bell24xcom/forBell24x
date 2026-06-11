import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Voice RFQ — Speak Your Requirement in Hindi or English',
  description: 'Post a procurement request by speaking. AI converts your voice into a structured RFQ in seconds. Get quotes from verified suppliers across India.',
  openGraph: {
    title: 'Speak Requirement — Post Your Requirement by Speaking | VyaparSethu',
    description: 'India\'s first voice-powered B2B procurement. Speak in Hindi or English — AI does the rest.',
    url: `${SITE_URL}/voice-rfq`,
  },
};

export default function VoiceRFQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
