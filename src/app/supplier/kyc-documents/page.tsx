'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Upload, Loader2, FileText } from 'lucide-react';

interface KycDocument {
  id: string;
  documentType: 'ID_PROOF' | 'GST_CERTIFICATE' | 'BUSINESS_REGISTRATION';
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
}

const DOCUMENT_TYPES: { type: KycDocument['documentType']; label: string; hint: string }[] = [
  { type: 'ID_PROOF', label: 'ID Proof', hint: 'Aadhaar, PAN, or Voter ID' },
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', hint: 'GST registration certificate' },
  { type: 'BUSINESS_REGISTRATION', label: 'Business Registration', hint: 'Udyam / Shop Act / incorporation certificate' },
];

const STATUS_STYLE: Record<KycDocument['status'], string> = {
  PENDING: 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50',
  VERIFIED: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
  REJECTED: 'bg-red-900/50 text-red-400 border-red-700/50',
};

export default function SupplierKycDocumentsPage() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/kyc/documents', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch {
      setError('Failed to load your documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (documentType: string, file: File) => {
    setUploading(documentType);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      const res = await fetch('/api/kyc/documents', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchDocuments();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">KYC Documents</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload these to get your account verified — each is reviewed individually by our team.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {DOCUMENT_TYPES.map(({ type, label, hint }) => {
            const doc = documents.find(d => d.documentType === type);
            return (
              <div key={type} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" /> {label}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">{hint}</p>
                  </div>
                  {doc && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLE[doc.status]}`}>
                      {doc.status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                      {doc.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {doc.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {doc.status}
                    </span>
                  )}
                </div>

                {doc?.status === 'REJECTED' && doc.rejectionReason && (
                  <p className="text-red-400 text-xs mb-3">Reason: {doc.rejectionReason}</p>
                )}

                <div className="flex items-center gap-3 mt-3">
                  {doc && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 text-xs hover:underline"
                    >
                      View uploaded file
                    </a>
                  )}
                  <label className="ml-auto cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    {uploading === type ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {doc ? 'Re-upload' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={uploading === type}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(type, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
