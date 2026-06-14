'use client';
import { useState } from 'react';

export type LeadStatus = 'new' | 'contacted' | 'claimed' | 'converted' | 'opted_out';
export type LeadSegment = 'steel' | 'textiles' | 'packaging' | 'chemicals' | 'other';

export interface Lead {
  id: string;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  location?: string | null;
  segment?: LeadSegment | null;
  status: LeadStatus;
  claimToken?: string | null;
  isClaimed: boolean;
  dpdpConsentStatus: boolean;
  createdAt: string;
}

interface LeadFiltersProps {
  leads: Lead[];
  onFiltered: (filtered: Lead[]) => void;
}

export default function LeadFilters({ leads, onFiltered }: LeadFiltersProps) {
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatus]     = useState<LeadStatus | 'all'>('all');
  const [segmentFilter, setSegment]   = useState<LeadSegment | 'all'>('all');
  const [claimedFilter, setClaimed]   = useState<'all' | 'claimed' | 'unclaimed'>('all');

  const apply = (
    term: string,
    status: typeof statusFilter,
    segment: typeof segmentFilter,
    claimed: typeof claimedFilter,
  ) => {
    const q = term.trim().toLowerCase();
    const result = leads.filter(lead => {
      const matchesSearch =
        !q ||
        (lead.companyName?.toLowerCase() ?? '').includes(q) ||
        (lead.contactName?.toLowerCase() ?? '').includes(q) ||
        (lead.email?.toLowerCase()       ?? '').includes(q) ||
        (lead.phone                      ?? '').includes(q) ||
        (lead.gstin                      ?? '').includes(q) ||
        (lead.location?.toLowerCase()    ?? '').includes(q);

      const matchesStatus  = status  === 'all' || lead.status    === status;
      const matchesSegment = segment === 'all' || lead.segment   === segment;
      const matchesClaimed =
        claimed === 'all' ||
        (claimed === 'claimed'   && lead.isClaimed) ||
        (claimed === 'unclaimed' && !lead.isClaimed);

      return matchesSearch && matchesStatus && matchesSegment && matchesClaimed;
    });
    onFiltered(result);
  };

  const handleSearch = (v: string) => {
    setSearchTerm(v);
    apply(v, statusFilter, segmentFilter, claimedFilter);
  };

  const handleStatus = (v: LeadStatus | 'all') => {
    setStatus(v);
    apply(searchTerm, v, segmentFilter, claimedFilter);
  };

  const handleSegment = (v: LeadSegment | 'all') => {
    setSegment(v);
    apply(searchTerm, statusFilter, v, claimedFilter);
  };

  const handleClaimed = (v: typeof claimedFilter) => {
    setClaimed(v);
    apply(searchTerm, statusFilter, segmentFilter, v);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="search"
        placeholder="Search company, contact, email, GSTIN..."
        value={searchTerm}
        onChange={e => handleSearch(e.target.value)}
        className="flex-1 min-w-[240px] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
      />

      <select
        value={statusFilter}
        onChange={e => handleStatus(e.target.value as typeof statusFilter)}
        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
      >
        <option value="all">All Statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="claimed">Claimed</option>
        <option value="converted">Converted</option>
        <option value="opted_out">Opted Out</option>
      </select>

      <select
        value={segmentFilter}
        onChange={e => handleSegment(e.target.value as typeof segmentFilter)}
        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
      >
        <option value="all">All Segments</option>
        <option value="steel">Steel & Metals</option>
        <option value="textiles">Textiles</option>
        <option value="packaging">Eco-Packaging</option>
        <option value="chemicals">Chemicals</option>
        <option value="other">Other</option>
      </select>

      <select
        value={claimedFilter}
        onChange={e => handleClaimed(e.target.value as typeof claimedFilter)}
        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
      >
        <option value="all">Claimed & Unclaimed</option>
        <option value="unclaimed">Unclaimed Only</option>
        <option value="claimed">Claimed Only</option>
      </select>
    </div>
  );
}
