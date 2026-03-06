'use client';

interface TrustScoreProps {
  score: number;
  gstVerified: boolean;
  profileComplete: number;
  responseRate?: number;
  dealsCompleted?: number;
  compact?: boolean;
}

export default function TrustScore({ score, gstVerified, profileComplete, responseRate, dealsCompleted, compact }: TrustScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'New';
  };

  const getBarColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const ringStroke = score >= 60 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={ringStroke} strokeWidth="3" strokeDasharray={`${score}, 100`} />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        <div>
          <p className={`text-sm font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
          {gstVerified && <span className="text-xs text-green-400">GST ✓</span>}
        </div>
      </div>
    );
  }

  const factors = [
    { label: 'GST Verified', value: gstVerified ? 100 : 0, weight: '30%', display: gstVerified ? 'Verified ✓' : 'Not verified' },
    { label: 'Profile Complete', value: profileComplete, weight: '25%', display: `${profileComplete}%` },
    { label: 'Response Rate', value: responseRate ?? 0, weight: '25%', display: responseRate != null ? `${responseRate}%` : 'No data' },
    { label: 'Deals Completed', value: Math.min((dealsCompleted ?? 0) * 10, 100), weight: '20%', display: `${dealsCompleted ?? 0} deals` },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Trust Score</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={ringStroke} strokeWidth="3" strokeDasharray={`${score}, 100`} />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
          <div>
            <p className={`text-lg font-bold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
            <p className="text-xs text-slate-400">out of 100</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{factor.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{factor.weight}</span>
                <span className="text-sm font-medium text-white">{factor.display}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(factor.value)}`}
                style={{ width: `${factor.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          Improve your score:{' '}
          {!gstVerified
            ? 'Add GST number (+30 pts)'
            : profileComplete < 80
            ? 'Complete your profile (+25 pts)'
            : (dealsCompleted ?? 0) < 5
            ? 'Win more deals (+20 pts)'
            : 'Keep responding to RFQs quickly'}
        </p>
      </div>
    </div>
  );
}
