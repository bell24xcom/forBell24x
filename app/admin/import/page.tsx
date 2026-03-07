'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, AlertTriangle, CheckCircle, Send, FileText } from 'lucide-react';

interface ParsedRow { [key: string]: string }
interface MappedSupplier { company: string; category: string; city: string; state?: string; gstNumber?: string; phone?: string; description?: string }

const REQUIRED_FIELDS = ['company', 'category', 'city'];
const ALL_FIELDS = [...REQUIRED_FIELDS, 'state', 'gstNumber', 'phone', 'description'];

const guessMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  const aliases: Record<string, string[]> = {
    company:     ['company', 'company_name', 'name', 'business_name', 'firm'],
    category:    ['category', 'industry', 'sector', 'type', 'product_category'],
    city:        ['city', 'town', 'district'],
    state:       ['state', 'province', 'region'],
    gstNumber:   ['gst', 'gstin', 'gst_number', 'gst_no'],
    phone:       ['phone', 'mobile', 'contact', 'phone_number', 'mobile_number'],
    description: ['description', 'about', 'desc', 'details', 'products'],
  };
  for (const [field, alts] of Object.entries(aliases)) {
    for (const h of headers) {
      if (alts.includes(h.toLowerCase().trim().replace(/\s+/g, '_'))) {
        mapping[field] = h;
        break;
      }
    }
  }
  return mapping;
};

export default function ImportSuppliersPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [headers,   setHeaders]   = useState<string[]>([]);
  const [rows,      setRows]      = useState<ParsedRow[]>([]);
  const [mapping,   setMapping]   = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [inviting,  setInviting]  = useState(false);
  const [result,    setResult]    = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [invResult, setInvResult] = useState<{ sent: number } | null>(null);
  const [fileName,  setFileName]  = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setInvResult(null);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hdrs = res.meta.fields || [];
        setHeaders(hdrs);
        setRows(res.data);
        setMapping(guessMapping(hdrs));
      },
    });
  };

  const preview = rows.slice(0, 5);

  const buildSuppliers = (): MappedSupplier[] =>
    rows.map(row => ({
      company:     row[mapping.company]     || '',
      category:    row[mapping.category]    || '',
      city:        row[mapping.city]        || '',
      state:       row[mapping.state]       || undefined,
      gstNumber:   row[mapping.gstNumber]   || undefined,
      phone:       row[mapping.phone]       || undefined,
      description: row[mapping.description] || undefined,
    })).filter(s => s.company && s.category && s.city);

  const handleImport = async () => {
    const suppliers = buildSuppliers();
    if (suppliers.length === 0) { alert('No valid rows to import. Ensure company, category, city columns are mapped.'); return; }

    setImporting(true);
    try {
      const res = await fetch('/api/admin/import-suppliers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suppliers }),
      });
      const data = await res.json();
      if (data.success) setResult({ imported: data.imported, skipped: data.skipped, errors: data.errors || [] });
      else alert(data.error || 'Import failed');
    } catch { alert('Network error'); }
    finally { setImporting(false); }
  };

  const handleSendInvitations = async () => {
    setInviting(true);
    try {
      const res = await fetch('/api/admin/send-invitations', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setInvResult({ sent: data.sent });
      else alert(data.error || 'Failed to send invitations');
    } catch { alert('Network error'); }
    finally { setInviting(false); }
  };

  const validCount = rows.length > 0 ? buildSuppliers().length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Import Suppliers</h1>
        <p className="text-slate-400 text-sm">Bulk upload unclaimed supplier profiles from CSV. Max 500 per import.</p>
      </div>

      {/* File Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-10 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        {fileName
          ? <p className="text-white font-medium">{fileName}</p>
          : <p className="text-slate-400">Click to upload CSV file</p>}
        <p className="text-slate-500 text-xs mt-1">Columns: company, category, city, state, gstNumber, phone, description</p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {/* Column Mapping */}
      {headers.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Column Mapping</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_FIELDS.map(field => (
              <div key={field}>
                <label className="block text-xs text-slate-400 mb-1 capitalize">
                  {field} {REQUIRED_FIELDS.includes(field) ? <span className="text-red-400">*</span> : ''}
                </label>
                <select
                  value={mapping[field] || ''}
                  onChange={e => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— not mapped —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-3">{rows.length} rows parsed · {validCount} valid (company + category + city present)</p>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> Preview (first 5 rows)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  {ALL_FIELDS.filter(f => mapping[f]).map(f => (
                    <th key={f} className="px-3 py-2 text-left text-slate-400 uppercase tracking-wider whitespace-nowrap">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-700/20">
                    {ALL_FIELDS.filter(f => mapping[f]).map(f => (
                      <td key={f} className="px-3 py-2 text-slate-300 max-w-[140px] truncate">{row[mapping[f]] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Button */}
      {validCount > 0 && !result && (
        <button onClick={handleImport} disabled={importing}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
          <Upload className="w-4 h-4" />
          {importing ? 'Importing…' : `Import ${validCount} Suppliers`}
        </button>
      )}

      {/* Import Result */}
      {result && (
        <div className="bg-slate-800/60 border border-green-700/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Import Complete</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3 text-center">
              <p className="text-green-400 font-bold text-xl">{result.imported}</p>
              <p className="text-slate-400 text-xs">Imported</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-amber-400 font-bold text-xl">{result.skipped}</p>
              <p className="text-slate-400 text-xs">Skipped (dupes)</p>
            </div>
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-center">
              <p className="text-red-400 font-bold text-xl">{result.errors.length}</p>
              <p className="text-slate-400 text-xs">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
              <p className="text-red-400 text-xs font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Errors (first 10)</p>
              {result.errors.map((e, i) => <p key={i} className="text-red-300 text-xs">{e}</p>)}
            </div>
          )}
          {result.imported > 0 && (
            <div className="pt-2">
              <p className="text-slate-400 text-sm mb-3">Send claim invitation emails to newly imported suppliers?</p>
              <button onClick={handleSendInvitations} disabled={inviting || !!invResult}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 min-h-[44px]">
                <Send className="w-4 h-4" />
                {inviting ? 'Sending…' : invResult ? `Sent to ${invResult.sent} suppliers ✓` : 'Send Claim Invitations'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-slate-300 font-medium text-sm mb-3">CSV Format Guide</h3>
        <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-400 overflow-x-auto">
          company,category,city,state,gstNumber,phone,description<br />
          Textile Mill Pvt Ltd,Textiles,Surat,Gujarat,27AAPFU0939F1ZV,9876543210,&quot;Premium cotton fabrics&quot;
        </div>
        <ul className="mt-3 space-y-1 text-xs text-slate-500">
          <li>• Required: <span className="text-white">company, category, city</span></li>
          <li>• Duplicates (same company + city) are skipped automatically</li>
          <li>• GST number gives +10 trust score bonus</li>
          <li>• Max 500 rows per import</li>
        </ul>
      </div>
    </div>
  );
}
