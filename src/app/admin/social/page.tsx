'use client';
import { useState } from 'react';
import { SOCIAL_POSTS, CALENDAR_WEEKS, type SocialPost } from '@/src/data/social-calendar';

const TYPE_COLORS: Record<string, string> = {
  'Founder Story':     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Education':         'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Social Proof':      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Feature Spotlight': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Industry Insight':  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'CTA':               'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const PLATFORM_COLORS: Record<string, string> = {
  'LinkedIn':   'bg-blue-600/30 text-blue-300',
  'Twitter/X':  'bg-slate-700 text-slate-300',
};

type PostStatus = 'draft' | 'scheduled' | 'posted' | 'skip';

const STATUS_STYLES: Record<PostStatus, string> = {
  draft:     'bg-slate-700 text-slate-400',
  scheduled: 'bg-amber-500/20 text-amber-300',
  posted:    'bg-emerald-500/20 text-emerald-300',
  skip:      'bg-slate-800 text-slate-600',
};

export default function SocialCalendarPage() {
  const [statuses, setStatuses] = useState<Record<string, PostStatus>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('social_statuses') || '{}'); } catch { return {}; }
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<number | 'all'>('all');

  const setStatus = (id: string, status: PostStatus) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    try { localStorage.setItem('social_statuses', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const copyPost = async (post: SocialPost) => {
    const text = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`;
    await navigator.clipboard.writeText(text);
    setCopied(post.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const counts = {
    total:  SOCIAL_POSTS.length,
    posted: SOCIAL_POSTS.filter(p => statuses[p.id] === 'posted').length,
    scheduled: SOCIAL_POSTS.filter(p => statuses[p.id] === 'scheduled').length,
  };

  const filtered = weekFilter === 'all' ? SOCIAL_POSTS : SOCIAL_POSTS.filter(p => p.week === weekFilter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Content Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">LinkedIn + Twitter/X — 3 posts/week, Jun 16 – Jul 11</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{counts.posted}</p>
          <p className="text-slate-400 text-xs">of {counts.total} posted</p>
        </div>
      </div>

      {/* Week filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setWeekFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${weekFilter === 'all' ? 'bg-[#D4AF37] text-[#001f3f]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          All Weeks
        </button>
        {CALENDAR_WEEKS.map(w => (
          <button key={w.week} onClick={() => setWeekFilter(w.week)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${weekFilter === w.week ? 'bg-[#D4AF37] text-[#001f3f]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            Week {w.week}: {w.theme}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post: SocialPost) => {
          const status: PostStatus = statuses[post.id] || 'draft';
          const isExpanded = expanded === post.id;

          return (
            <div key={post.id}
              className={`bg-slate-800/40 border rounded-xl overflow-hidden transition-all ${
                status === 'posted' ? 'border-emerald-500/30' :
                status === 'skip'   ? 'border-slate-800 opacity-40' :
                                      'border-slate-700/50'
              }`}>
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-slate-500 text-[10px] font-mono">{post.date} · {post.day}</span>
                      {post.platform.map(p => (
                        <span key={p} className={`px-2 py-0.5 rounded text-[10px] font-medium ${PLATFORM_COLORS[p]}`}>{p}</span>
                      ))}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${TYPE_COLORS[post.type]}`}>{post.type}</span>
                    </div>
                    {/* Hook */}
                    <p className="text-white font-semibold text-sm leading-snug">{post.hook}</p>
                    {post.image && (
                      <p className="text-slate-500 text-[10px] mt-1">Visual: {post.image}</p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={status} onChange={e => setStatus(post.id, e.target.value as PostStatus)}
                      className={`text-xs rounded-lg px-2 py-1.5 border-0 outline-none cursor-pointer ${STATUS_STYLES[status]}`}>
                      <option value="draft">✏️ Draft</option>
                      <option value="scheduled">📅 Scheduled</option>
                      <option value="posted">✅ Posted</option>
                      <option value="skip">⏭ Skip</option>
                    </select>
                    <button onClick={() => setExpanded(isExpanded ? null : post.id)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors">
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded full post */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-900/40">
                  <div className="bg-slate-800/60 rounded-xl p-4 mb-3">
                    <p className="text-white font-semibold text-sm mb-3">{post.hook}</p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.body}</p>
                    <p className="text-[#D4AF37] text-sm font-medium mb-3">{post.cta}</p>
                    <p className="text-slate-500 text-xs">{post.hashtags.map(h => `#${h}`).join(' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyPost(post)}
                      className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold rounded-lg text-xs transition-colors">
                      {copied === post.id ? '✓ Copied!' : '📋 Copy Full Post'}
                    </button>
                    {post.platform.includes('LinkedIn') && (
                      <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs transition-colors">
                        LinkedIn →
                      </a>
                    )}
                    {post.platform.includes('Twitter/X') && (
                      <a href="https://x.com/compose/tweet" target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors">
                        X/Twitter →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-10 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
        <h2 className="text-white font-bold text-sm mb-4">Posting Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <p className="text-white font-semibold mb-2">Best Times (IST)</p>
            <ul className="space-y-1">
              <li>LinkedIn: Mon/Wed/Fri 8–9 AM or 12–1 PM</li>
              <li>Twitter/X: Wed/Fri 10 AM – 12 PM</li>
              <li>Avoid: weekends, national holidays, IPO days</li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Engagement Rules</p>
            <ul className="space-y-1">
              <li>Reply to every comment within 2 hours on post day</li>
              <li>Tag 2-3 relevant people in industry posts</li>
              <li>Repurpose LinkedIn long-form → Twitter thread 24h later</li>
              <li>Screenshot comments for WhatsApp social proof</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
