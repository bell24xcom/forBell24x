'use client';

/**
 * Shared display panels for the supplier pipeline and the marketplace activation dashboard (MA-01).
 * Presentation only: every number comes from the API (src/lib/discovery/pipeline*.ts). A stage or KPI that cannot be
 * measured is shown as "not measurable", never as 0, and nothing here ever labels anything "healthy".
 */

import type { ActivationResult, Alert, CohortRow, FunnelStep, Kpi, PilotCoverageRow, PipelineResult } from '@/src/lib/discovery/pipeline-core';

const STAGE_LABEL: Record<string, string> = {
  DISCOVERED: 'Discovered',
  QUALIFIED: 'Qualified',
  DEDUPLICATED: 'Deduplicated',
  INVITATION_READY: 'Invitation ready',
  INVITED: 'Invited (sent, unverified)',
  OPENED: 'Opened',
  CLAIMED: 'Claimed',
  PROFILE_COMPLETED: 'Profile completed',
  RFQ_ELIGIBLE: 'RFQ eligible',
};

const STATUS_CLASS: Record<string, string> = {
  ok: 'border-green-600/40 text-green-300',
  warn: 'border-amber-600/40 text-amber-300',
  bad: 'border-red-600/50 text-red-300',
  info: 'border-slate-700/50 text-white',
  not_measurable: 'border-slate-700/50 text-slate-500',
};

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function SeedToggle({ includeSeed, onChange }: { includeSeed: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
      <input type="checkbox" checked={includeSeed} onChange={(e) => onChange(e.target.checked)} />
      Include seed accounts
    </label>
  );
}

export function Banners({ banners }: { banners: string[] }) {
  if (banners.length === 0) return null;
  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <p key={b} className="bg-amber-900/20 border border-amber-700/40 text-amber-200 text-sm px-4 py-2 rounded-lg">
          {b}
        </p>
      ))}
    </div>
  );
}

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return <p className="text-slate-500 text-sm">No alert condition is currently met. That is not evidence that everything works.</p>;
  }
  return (
    <ul className="space-y-2">
      {alerts.map((a) => (
        <li key={a.key} className={`text-sm px-3 py-2 rounded-lg border ${a.severity === 'bad' ? 'border-red-700/50 bg-red-900/20 text-red-200' : 'border-amber-700/40 bg-amber-900/20 text-amber-200'}`}>
          {a.message}
        </li>
      ))}
    </ul>
  );
}

export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((k) => (
        <div key={k.key} className={`bg-slate-800/60 border rounded-xl p-4 ${STATUS_CLASS[k.status]}`}>
          <p className="text-slate-500 text-xs uppercase">{k.label}</p>
          <p className="text-2xl font-bold mt-1">{k.value === null ? 'not measurable' : typeof k.value === 'number' && k.key.includes('rate') ? `${k.value}%` : k.value}</p>
          {k.note && <p className="text-slate-500 text-xs mt-1">{k.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function KpiTable({ items }: { items: Kpi[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((k) => (
          <tr key={k.key} className="border-t border-slate-700/40 first:border-0 align-top">
            <td className="py-2 pr-3 text-slate-300">{k.label}</td>
            <td className={`py-2 pr-3 font-semibold whitespace-nowrap ${(STATUS_CLASS[k.status] ?? '').split(' ')[1]}`}>
              {k.value === null ? 'not measurable' : /percent|share|rate|participation|completed among/i.test(k.label) && typeof k.value === 'number' ? `${k.value}%` : k.value}
            </td>
            <td className="py-2 text-slate-500 text-xs">{k.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FunnelPanel({ funnel }: { funnel: FunnelStep[] }) {
  const max = Math.max(1, ...funnel.map((f) => f.count));
  return (
    <div className="space-y-3">
      {funnel.map((s) => (
        <div key={s.stage}>
          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-sm w-44 shrink-0">{STAGE_LABEL[s.stage] ?? s.stage}</span>
            {s.measurable ? (
              <div className="flex-1 bg-slate-900 rounded h-4 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded" style={{ width: `${(s.count / max) * 100}%` }} />
              </div>
            ) : (
              <div className="flex-1 text-slate-500 text-xs italic">not measurable</div>
            )}
            <span className="text-slate-300 text-sm w-14 text-right tabular-nums">{s.measurable ? s.count : '—'}</span>
            <span className="text-slate-500 text-xs w-14 text-right tabular-nums">{s.stepRate === null ? '—' : `${s.stepRate}%`}</span>
          </div>
          {s.note && <p className="text-slate-500 text-xs ml-44 pl-3 mt-0.5">{s.note}</p>}
        </div>
      ))}
      <p className="text-slate-500 text-xs">
        Right-hand figure is the share of the previous row. Stages are not strictly nested (a claimed supplier need not have been invited through this system), so a rate above 100% is possible and real.
      </p>
    </div>
  );
}

export function CohortTable({ rows, keyLabel, limit = 15 }: { rows: CohortRow[]; keyLabel: string; limit?: number }) {
  if (rows.length === 0) return <p className="text-slate-500 text-sm">No data.</p>;
  const shown = rows.slice(0, limit);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 text-xs uppercase">
            <th className="py-1 pr-3">{keyLabel}</th>
            {['Suppliers', 'Qualified', 'Ready', 'Invited', 'Opened', 'Claimed', 'Completed', 'RFQ elig.'].map((h) => (
              <th key={h} className="py-1 pr-3 text-right">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.key} className="border-t border-slate-700/40 text-slate-300">
              <td className="py-1.5 pr-3">{r.key}</td>
              {[r.suppliers, r.qualified, r.invitationReady, r.invited, r.opened, r.claimed, r.profileCompleted, r.rfqEligible].map((v, i) => (
                <td key={i} className="py-1.5 pr-3 text-right tabular-nums">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit && <p className="text-slate-500 text-xs mt-2">Top {limit} of {rows.length} by supplier count.</p>}
    </div>
  );
}

export function PilotCoveragePanel({ rows }: { rows: PilotCoverageRow[] }) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 text-xs uppercase">
            <th className="py-1 pr-3">Category</th>
            <th className="py-1 pr-3 text-right">Ready</th>
            <th className="py-1 pr-3 text-right">Fresh</th>
            <th className="py-1 pr-3 text-right">Gap to {rows[0]?.target ?? 50}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.category} className="border-t border-slate-700/40">
              <td className="py-1.5 pr-3 text-slate-300">{r.category}</td>
              <td className={`py-1.5 pr-3 text-right tabular-nums font-semibold ${STATUS_CLASS[r.status].split(' ')[1]}`}>{r.invitationReady}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-slate-300">{r.fresh}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-slate-300">{r.gap}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-500 text-xs mt-2">Category matching is by keyword (interim, until one category taxonomy exists). Target and red/amber thresholds are proposals.</p>
      {rows.filter((r) => r.note).map((r) => (
        <p key={r.category} className="text-slate-500 text-xs mt-1">{r.category}: {r.note}{r.broaderReady !== undefined ? ` Invitation-ready in the broader steel categories: ${r.broaderReady}.` : ''}</p>
      ))}
    </div>
  );
}

export function PipelineOverview({ pipeline }: { pipeline: PipelineResult }) {
  return (
    <div className="space-y-6">
      <Banners banners={pipeline.banners} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title={`Supplier pipeline (${pipeline.scope.considered} of ${pipeline.scope.supplierAccounts} accounts)`}>
          <FunnelPanel funnel={pipeline.funnel} />
        </Panel>
        <Panel title="Supply coverage — pilot categories">
          <PilotCoveragePanel rows={pipeline.pilotCoverage} />
        </Panel>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="By source">
          <CohortTable rows={pipeline.bySource} keyLabel="Source" />
        </Panel>
        <Panel title="By category">
          <CohortTable rows={pipeline.byCategory} keyLabel="Category" />
        </Panel>
      </div>
    </div>
  );
}

export function ActivationOverview({ activation }: { activation: ActivationResult }) {
  return (
    <div className="space-y-6">
      <Panel title="Alerts (proposed thresholds)">
        <AlertList alerts={activation.alerts} />
      </Panel>
      <KpiStrip items={activation.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Supplier health">
          <KpiTable items={activation.supplierHealth} />
        </Panel>
        <Panel title="RFQ readiness">
          <KpiTable items={activation.rfqReadiness} />
        </Panel>
        <Panel title="Outreach performance">
          <KpiTable items={activation.outreach} />
        </Panel>
      </div>
      <Panel title="RFQ lifecycle">
        <p className="text-slate-300 text-sm">
          {activation.rfqLifecycle.rfqTotal} RFQs · {activation.rfqLifecycle.quotes} quotes · buyers alerted to {activation.rfqLifecycle.buyerAlerts} · {activation.rfqLifecycle.deals} deals
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {Object.entries(activation.rfqLifecycle.byStatus).map(([s, n]) => `${s} ${n}`).join(' · ') || 'No RFQs.'}
        </p>
      </Panel>
      {activation.notes.map((n) => (
        <p key={n} className="text-slate-500 text-xs">{n}</p>
      ))}
    </div>
  );
}
