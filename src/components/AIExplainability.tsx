'use client';

import { Brain, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import ShapChart from './ShapChart';
import LimeExplanation from './LimeExplanation';

interface FeatureScore {
  feature: string;
  label: string;
  score: number;
  contribution?: string;
  description?: string;
}

interface Props {
  supplierName?: string;
  matchScore?: number;
  confidence?: number;
  featureImportance?: FeatureScore[];
  reasons?: string[];
  source?: 'python_microservice' | 'computed_fallback';
}

export default function AIExplainability({
  supplierName,
  matchScore,
  confidence = 0.82,
  featureImportance = [],
  reasons = [],
  source,
}: Props) {
  const shapItems = featureImportance.map((f) => ({
    feature: f.label || f.feature,
    importance: f.score,
    contribution: f.contribution || (f.score >= 0.5 ? 'positive' : 'negative'),
  }));

  const limeItems = featureImportance.map((f) => ({
    feature: f.label || f.feature,
    text: f.description || `Score: ${Math.round(f.score * 100)}%`,
  }));

  const confidencePct = Math.round(confidence * 100);
  const matchPct = matchScore !== undefined ? Math.round(matchScore * 100) : null;

  return (
    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#001f3f]/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-semibold text-white text-sm">
            AI Explainability
            {supplierName && <span className="text-slate-400 font-normal"> — {supplierName}</span>}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {matchPct !== null && (
            <span className="text-xs font-bold text-indigo-300 bg-indigo-900/40 border border-indigo-700/40 px-2.5 py-1 rounded-full">
              {matchPct}% Match
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            confidencePct >= 80
              ? 'text-green-300 bg-green-900/30 border-green-700/40'
              : 'text-amber-300 bg-amber-900/30 border-amber-700/40'
          }`}>
            {confidencePct}% Confidence
          </span>
          {source === 'python_microservice' && (
            <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live ML
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* SHAP section */}
        {shapItems.length > 0 && (
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-sm font-semibold text-white">SHAP Feature Importance</h4>
              <span className="text-xs text-slate-500 ml-auto">How each factor drives the score</span>
            </div>
            <div className="space-y-2">
              {shapItems.map((item, i) => {
                const pct = Math.round((item.importance / Math.max(...shapItems.map((s) => s.importance), 0.0001)) * 100);
                return (
                  <div key={i} className="flex items-center gap-3 text-xs" data-testid={`feature-${i}`}>
                    <span className="text-slate-400 w-36 flex-shrink-0 truncate">{item.feature}</span>
                    <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.contribution === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                        data-testid={`shap-bar-${item.feature}`}
                      />
                    </div>
                    <span className="text-slate-300 w-10 text-right font-mono">{item.importance.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIME section */}
        {limeItems.length > 0 && (
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">LIME Local Explanation</h4>
              <span className="text-xs text-slate-500 ml-auto">Plain-language reasoning</span>
            </div>
            <ul className="space-y-1.5">
              {limeItems.map((e, i) => (
                <li key={i} className="text-xs text-slate-300 flex gap-2" data-testid={`lime-explanation-${i}`}>
                  <span className="text-[#D4AF37] flex-shrink-0">▸</span>
                  <span><strong className="text-white">{e.feature}:</strong> {e.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI reasoning tags */}
        {reasons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Reasoning</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reasons.map((r, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-full">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {featureImportance.length === 0 && reasons.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No explanation data available for this match.</p>
        )}
      </div>
    </div>
  );
}
