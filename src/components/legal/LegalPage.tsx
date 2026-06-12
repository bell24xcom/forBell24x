import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '../../app/config/legal';
import DraftBanner from './DraftBanner';

interface Props {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, lastUpdated, children }: Props) {
  const isDraft = process.env.NODE_ENV !== 'production';
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {isDraft && <DraftBanner />}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-medium mb-2">{LEGAL_ENTITY.platform} · Legal</p>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 text-sm mt-2">
            Last updated: {lastUpdated ?? POLICY_LAST_UPDATED} · Operated by {LEGAL_ENTITY.name} ({LEGAL_ENTITY.type})
          </p>
        </div>
        <div className="prose prose-invert prose-slate max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-li:text-slate-300 prose-strong:text-white
          prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
          {children}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-700/50 text-slate-400 text-sm space-y-1">
          <p><strong className="text-slate-300">Data Fiduciary / Grievance Officer:</strong> {LEGAL_ENTITY.proprietor}</p>
          <p><strong className="text-slate-300">Operating Entity:</strong> {LEGAL_ENTITY.name}, GSTIN {LEGAL_ENTITY.gstin}</p>
          <p><strong className="text-slate-300">Address:</strong> {LEGAL_ENTITY.address}</p>
          <p><strong className="text-slate-300">Email:</strong>{' '}
            <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="text-indigo-400 hover:underline">
              {LEGAL_ENTITY.grievanceEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
