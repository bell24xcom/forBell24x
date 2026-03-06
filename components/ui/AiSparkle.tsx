'use client';
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiSparkleProps {
  fieldName: string;
  currentValue: string;
  context?: string;
  onSuggestion: (text: string) => void;
  buttonLabel?: string;
}

export default function AiSparkle({ fieldName, currentValue, context, onSuggestion, buttonLabel }: AiSparkleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSuggestion = async () => {
    if (!currentValue.trim()) {
      setError('Enter something first');
      setTimeout(() => setError(''), 2500);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/sparkle', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName, currentValue, context }),
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        onSuggestion(data.suggestion);
      } else {
        setError(data.error || 'AI unavailable');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={generateSuggestion}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800/40 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={`AI-generate ${fieldName}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {loading ? 'Generating…' : (buttonLabel || '✨ AI Suggest')}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
