'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Send, ShieldAlert } from 'lucide-react';

interface StatusResponse {
  success: boolean;
  provider: string;
  status: 'READY' | 'NOT_CONFIGURED';
  phoneConfigured: boolean;
  wabaConfigured: boolean;
  tokenConfigured: boolean;
  webhookConfigured: boolean;
  capabilities: {
    textMessage: boolean;
    templateMessage: boolean;
    webhook: boolean;
    deliveryStatus: boolean;
  };
  missingSendVars: string[];
  missingWebhookVars: string[];
}

interface TestSendResult {
  success: boolean;
  sendResult: 'SENT' | 'FAILED' | 'NOT_AVAILABLE';
  messageId?: string;
  errorMessage?: string;
  reason?: string;
  timestamp?: string;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'red' | 'amber' }) {
  const toneClass = {
    green: 'bg-green-900/40 border-green-700/50 text-green-400',
    red:   'bg-red-900/40 border-red-700/50 text-red-400',
    amber: 'bg-amber-900/40 border-amber-700/50 text-amber-400',
  }[tone];
  return (
    <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${toneClass}`}>
      {children}
    </span>
  );
}

function CapabilityRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
      <span className="text-slate-300 text-sm">{label}</span>
      {on ? (
        <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" /> Available
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
          <XCircle className="w-4 h-4" /> Not available
        </span>
      )}
    </div>
  );
}

export default function WhatsAppCloudApiPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [to, setTo] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<TestSendResult | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/whatsapp-meta/status', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load status');
      setStatus(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleTestSend = async () => {
    setSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/whatsapp-meta/test-send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, confirm }),
      });
      const json = await res.json();
      setTestResult(json);
    } catch (e) {
      setTestResult({ success: false, sendResult: 'FAILED', errorMessage: e instanceof Error ? e.message : 'Network error' });
    } finally {
      setSending(false);
    }
  };

  const ready = status?.status === 'READY';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">WhatsApp Cloud API (Meta)</h1>
          <p className="text-slate-400 text-sm">
            Direct Meta WhatsApp Business Platform integration — transactional infrastructure, separate from{' '}
            <a href="/admin/outreach" className="text-indigo-400 hover:underline">WhatsApp Outreach</a> (MSG91-based bulk campaigns).
          </p>
        </div>
        <button onClick={fetchStatus} disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading && !status && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status && (
        <>
          {/* Status card */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Status</span>
              <Badge tone={ready ? 'green' : 'amber'}>{status.status.replace('_', ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Provider</p>
                <p className="text-white">{status.provider}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Phone</p>
                <p className={status.phoneConfigured ? 'text-green-400' : 'text-slate-500'}>
                  {status.phoneConfigured ? 'Configured' : 'Not configured'}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">WABA</p>
                <p className={status.wabaConfigured ? 'text-green-400' : 'text-slate-500'}>
                  {status.wabaConfigured ? 'Configured' : 'Not configured'}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Access token</p>
                <p className={status.tokenConfigured ? 'text-green-400' : 'text-slate-500'}>
                  {status.tokenConfigured ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            {!ready && status.missingSendVars.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 text-amber-300 text-xs">
                Missing environment variables: {status.missingSendVars.join(', ')}. Set these in Vercel to enable sending.
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Capabilities</h3>
            <CapabilityRow label="Text Message" on={status.capabilities.textMessage} />
            <CapabilityRow label="Template Message" on={status.capabilities.templateMessage} />
            <CapabilityRow label="Webhook" on={status.capabilities.webhook} />
            <CapabilityRow label="Delivery Status" on={status.capabilities.deliveryStatus} />
          </div>

          {/* Test send */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-green-400" /> Test Send
            </h3>

            {!ready ? (
              <p className="text-slate-500 text-sm">
                Test Send is not available — the Meta WhatsApp Cloud API is not configured on this deployment.
              </p>
            ) : (
              <>
                <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/40 rounded-lg px-3 py-2 text-amber-300 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  This sends a real WhatsApp message to the number below via Meta&apos;s live API. It is not a preview.
                </div>
                <input
                  type="text"
                  placeholder="Recipient — E.164 digits, e.g. 919876543210"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
                />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} />
                  I understand this sends a real message to this number.
                </label>
                <button
                  onClick={handleTestSend}
                  disabled={sending || !to || !confirm}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {sending ? 'Sending…' : 'Send Test Message'}
                </button>
              </>
            )}

            {testResult && (
              <div className={`rounded-lg px-4 py-3 text-sm ${
                testResult.sendResult === 'SENT' ? 'bg-green-900/20 border border-green-700/40 text-green-300'
                : testResult.sendResult === 'NOT_AVAILABLE' ? 'bg-slate-900/50 border border-slate-700 text-slate-400'
                : 'bg-red-900/20 border border-red-700/40 text-red-300'
              }`}>
                <p className="font-semibold">{testResult.sendResult}</p>
                {testResult.messageId && <p className="text-xs mt-1">Meta message ID: {testResult.messageId}</p>}
                {testResult.errorMessage && <p className="text-xs mt-1">{testResult.errorMessage}</p>}
                {testResult.reason && <p className="text-xs mt-1">{testResult.reason}</p>}
                {testResult.timestamp && <p className="text-xs mt-1 text-slate-500">{testResult.timestamp}</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
