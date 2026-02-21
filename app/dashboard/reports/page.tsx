'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  FileBarChart,
  Users,
  DollarSign,
  Brain,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
} from 'lucide-react';

type DateRange = '30d' | '90d' | '1y';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  endpoint: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'rfq-summary',
    title: 'RFQ Summary Report',
    description:
      'A complete breakdown of your RFQs including status distribution, response rates, and category insights.',
    icon: <FileBarChart className="w-6 h-6" />,
    accentColor: 'bg-blue-100 text-blue-700',
    endpoint: '/api/dashboard/rfqs',
  },
  {
    id: 'supplier-performance',
    title: 'Supplier Performance Report',
    description:
      'Evaluate suppliers by quote volume, pricing competitiveness, and response speed across your RFQs.',
    icon: <Users className="w-6 h-6" />,
    accentColor: 'bg-green-100 text-green-700',
    endpoint: '/api/dashboard/quotes',
  },
  {
    id: 'financial-summary',
    title: 'Financial Summary',
    description:
      'Review your total spend, earned value, and transaction history over the selected period.',
    icon: <DollarSign className="w-6 h-6" />,
    accentColor: 'bg-purple-100 text-purple-700',
    endpoint: '/api/dashboard/stats',
  },
  {
    id: 'ai-matching',
    title: 'AI Matching Report',
    description:
      'Insights from AI-powered supplier matching: acceptance rates, match scores, and category coverage.',
    icon: <Brain className="w-6 h-6" />,
    accentColor: 'bg-amber-100 text-amber-700',
    endpoint: '/api/dashboard/stats',
  },
];

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 1 year', value: '1y' },
];

interface ReportState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

function downloadJsonBlob(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ReportCard({
  report,
  dateRange,
  reportState,
  onGenerate,
}: {
  report: ReportType;
  dateRange: DateRange;
  reportState: ReportState;
  onGenerate: (report: ReportType) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Icon & Title */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${report.accentColor}`}>
          {report.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{report.title}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{report.description}</p>
        </div>
      </div>

      {/* Status feedback */}
      {reportState.error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{reportState.error}</span>
        </div>
      )}
      {reportState.success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Report downloaded successfully</span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={() => onGenerate(report)}
        disabled={reportState.loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 mt-auto"
      >
        {reportState.loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {reportState.loading ? 'Generating...' : 'Generate PDF'}
      </button>

      <p className="text-xs text-gray-400 text-center -mt-1">
        Downloads as report.json (PDF export coming soon)
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [reportStates, setReportStates] = useState<Record<string, ReportState>>({});
  const [generatedCount, setGeneratedCount] = useState(0);
  const [lastGeneratedDate, setLastGeneratedDate] = useState<string | null>(null);

  const getReportState = (reportId: string): ReportState =>
    reportStates[reportId] ?? { loading: false, success: false, error: null };

  const handleGenerate = async (report: ReportType) => {
    setReportStates(prev => ({
      ...prev,
      [report.id]: { loading: true, success: false, error: null },
    }));

    try {
      const res = await fetch(report.endpoint);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Server returned ${res.status}`);
      }
      const data = await res.json();

      const payload = {
        reportType: report.id,
        reportTitle: report.title,
        generatedAt: new Date().toISOString(),
        dateRange,
        data,
      };

      const slug = report.id.replace(/\s+/g, '-').toLowerCase();
      downloadJsonBlob(payload, `bell24h-${slug}-${dateRange}.json`);

      const now = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      setGeneratedCount(c => c + 1);
      setLastGeneratedDate(now);
      setReportStates(prev => ({
        ...prev,
        [report.id]: { loading: false, success: true, error: null },
      }));

      // Auto-clear success after 4 seconds
      setTimeout(() => {
        setReportStates(prev => ({
          ...prev,
          [report.id]: { loading: false, success: false, error: null },
        }));
      }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report';
      setReportStates(prev => ({
        ...prev,
        [report.id]: { loading: false, success: false, error: msg },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">Reports</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 text-sm mt-1">Generate and download business reports</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
            {DATE_RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Reports Generated</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{generatedCount}</p>
            <p className="text-xs text-gray-400 mt-1">This session</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Generated</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {lastGeneratedDate ?? '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Date &amp; time</p>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {REPORT_TYPES.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              dateRange={dateRange}
              reportState={getReportState(report.id)}
              onGenerate={handleGenerate}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-300 text-sm font-medium">About these reports</p>
            <p className="text-gray-400 text-xs mt-1">
              Reports currently download as JSON files containing your live data. PDF export is in development and will be available in a future update.
              The selected date range ({DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.label}) is included in the report metadata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
