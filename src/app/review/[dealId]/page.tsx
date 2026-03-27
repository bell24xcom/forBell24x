'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';

export default function ReviewSubmissionPage() {
  const { dealId } = useParams();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          reviewer_id: 'current_user_id', // Needs session integration
          reviewer_type: 'buyer', // Needs session role detection
          rating,
          feedback
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-10 rounded-[3rem] text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Review Captured!</h1>
          <p className="text-slate-400">Your feedback helps maintain high standards in the Bell24h Marketplace.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-8 text-indigo-400 font-bold hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">
            <ShieldCheck className="w-3 h-3" /> Secure Trust Loop
          </div>
          <h1 className="text-4xl font-black tracking-tighter">RATE YOUR <span className="text-indigo-500">EXPERIENCE</span></h1>
          <p className="text-slate-500 mt-2">How was your deal experience for #{dealId.toString().substring(0,8)}?</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Rating</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 transition-all transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        (hover || rating) >= star ? 'fill-indigo-500 text-indigo-500' : 'text-slate-700'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Detailed Feedback
              </label>
              <textarea 
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share your thoughts on the quality, speed, and communication..."
                className="w-full bg-black border border-slate-800 rounded-3xl p-6 text-white focus:border-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-3xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? 'Submitting...' : 'Complete Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
