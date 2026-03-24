'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  Send, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Clock, 
  MessageSquare,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity
} from 'lucide-react';

interface RFQ {
  id: string;
  rfq_text: string;
  category: string;
  quantity: string;
  budget: string;
  urgency: string;
  status: string;
  created_at: string;
}

interface CampaignRule {
  id: string;
  name: string;
  category: string;
  urgency: string;
  action_type: string;
  template_text: string;
  is_active: boolean;
}

export default function MarketingAdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfqs' | 'automation' | 'logs'>('dashboard');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [rules, setRules] = useState<CampaignRule[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [refreshing, setRefreshing] = useState(false);

  // New Rule Form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: '',
    urgency: 'high',
    action_type: 'whatsapp',
    template_text: 'Hi! We have a new RFQ for {{category}} with urgency {{urgency}}. Details: {{text}}'
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/marketing?page=${page}`);
      const data = await res.json();
      if (data.rfqs) {
        setRfqs(data.rfqs);
        setStats(data.stats);
        setPagination(data.pagination);
      }

      const rulesRes = await fetch('/api/admin/marketing/rules');
      const rulesData = await rulesRes.json();
      if (rulesData.rules) setRules(rulesData.rules);

      // In a real app, logs would have their own paginated route
      // For now, we fetch them via a generic InsForge call if possible or a new route
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const updateRfqStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/marketing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchData();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const triggerMatch = async (rfqId: string) => {
    try {
      const res = await fetch('/api/admin/marketing/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId })
      });
      const data = await res.json();
      if (data.success) {
        alert('Vendor matching triggered via n8n!');
        fetchData();
      }
    } catch (error) {
      console.error('Match error:', error);
    }
  };

  const triggerOutreach = async (rfq: RFQ) => {
    try {
      const message = `*Bell24h RFQ Alert*\nCategory: ${rfq.category}\nBudget: ${rfq.budget}\nDetails: ${rfq.rfq_text}`;
      const res = await fetch('/api/admin/marketing/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfqId: rfq.id, 
          message,
          type: 'whatsapp'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('WhatsApp outreach triggered via n8n!');
        fetchData();
      }
    } catch (error) {
      console.error('Outreach error:', error);
    }
  };

  const createRule = async () => {
    try {
      await fetch('/api/admin/marketing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      setShowRuleForm(false);
      fetchData();
    } catch (error) {
      console.error('Create rule error:', error);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await fetch(`/api/admin/marketing/rules?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Delete rule error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-indigo-500 w-8 h-8" />
            Marketing Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">InsForge Isolated Architecture</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['dashboard', 'rfqs', 'automation', 'logs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total RFQs</p>
                <h2 className="text-3xl font-bold text-white">{stats?.totalRfqs || 0}</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Active Flow</p>
                <h2 className="text-3xl font-bold text-white">{stats?.activeRfqs || 0}</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Rules</p>
                <h2 className="text-3xl font-bold text-white">{rules.length}</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">System Health</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-500 text-sm font-bold uppercase tracking-widest">Isolated</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Recent Marketing Activity</h3>
                <div className="space-y-4">
                  {rfqs.slice(0, 5).map(rfq => (
                    <div key={rfq.id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{rfq.rfq_text}</p>
                        <p className="text-slate-500 text-xs">{rfq.category} • {new Date(rfq.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rfq.status === 'new' ? 'bg-slate-800 text-slate-400' :
                        rfq.status === 'matched' ? 'bg-indigo-500/20 text-indigo-400' :
                        rfq.status === 'sent' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> AI Category Trends</h3>
                <div className="space-y-4">
                  {Object.entries(stats?.categoryTrends || {}).slice(0, 5).map(([cat, count]: [string, any]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{cat}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${(count / stats.totalRfqs) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RFQ Manager Tab */}
        {activeTab === 'rfqs' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">InsForge Marketing RFQs</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input type="text" placeholder="Search..." className="bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-indigo-500 outline-none w-64" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold">
                      <th className="px-6 py-4">RFQ Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {rfqs.map(rfq => (
                      <tr key={rfq.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium line-clamp-1">{rfq.rfq_text}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{rfq.urgency.toUpperCase()} • {new Date(rfq.created_at).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-400 border border-slate-700">{rfq.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rfq.status === 'new' ? 'text-slate-400' :
                            rfq.status === 'matched' ? 'text-indigo-400' :
                            rfq.status === 'sent' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => triggerMatch(rfq.id)}
                              disabled={rfq.status !== 'new'}
                              className="p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all disabled:opacity-30"
                              title="Match Vendors"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => triggerOutreach(rfq)}
                              disabled={rfq.status !== 'matched'}
                              className="p-2 bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-all disabled:opacity-30"
                              title="Send Outreach"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Campaign Rules</h3>
              <button onClick={() => setShowRuleForm(!showRuleForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all"><Plus className="w-4 h-4" /> New Rule</button>
            </div>
            {showRuleForm && (
              <div className="bg-slate-900 border border-indigo-500/50 p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Rule Name" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" />
                  <input type="text" placeholder="Category" value={newRule.category} onChange={e => setNewRule({...newRule, category: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button onClick={() => setShowRuleForm(false)} className="px-6 py-2 border border-slate-800 rounded-xl text-sm hover:bg-slate-800 transition-colors">Cancel</button>
                  <button onClick={createRule} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Save Rule</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rules.map(rule => (
                <div key={rule.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-white font-bold">{rule.name}</h4>
                    <button onClick={() => deleteRule(rule.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-white">{rule.category}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Urgency</span><span className="text-amber-500">{rule.urgency}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Action</span><span className="text-indigo-400">{rule.action_type}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Outreach Logs</h3>
            <p className="text-slate-500 text-sm">System is tracking matches and outreach in InsForge outreach_logs table.</p>
          </div>
        )}
      </div>
    </div>
  );
}
