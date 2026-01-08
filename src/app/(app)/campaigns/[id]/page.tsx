'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { 
  Send, 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  Eye, 
  Save, 
  Settings,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Zap,
  Layout
} from 'lucide-react';
import Link from 'next/link';

interface CampaignDetail {
  id: number;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  html_body: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at: string | null;
  lists: { id: number; name: string }[];
}

interface List {
  id: number;
  name: string;
}

interface Stats {
  total_messages: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  open_rate: number;
  click_rate: number;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'audience' | 'content' | 'schedule' | 'stats'>('settings');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const fetchCampaign = async () => {
    try {
      const response = await api.get(`/api/v1/campaigns/${id}`);
      setCampaign(response.data.campaign || response.data);
    } catch (err) {
      console.error('Failed to fetch campaign', err);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await api.get('/api/v1/lists');
      setLists(response.data.lists || []);
    } catch (err) {
      console.error('Failed to fetch lists', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/v1/campaigns/${id}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCampaign(), fetchLists(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      await api.put(`/api/v1/campaigns/${id}`, data);
      setMessage({ type: 'success', text: 'Campaign updated successfully.' });
      fetchCampaign();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update campaign.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudienceUpdate = async () => {
    setSubmitting(true);
    try {
      const selectedListIds = (document.querySelectorAll('input[name="lists"]:checked') as any);
      const listIds = Array.from(selectedListIds).map((el: any) => parseInt(el.value));
      await api.post(`/api/v1/campaigns/${id}/audience`, { list_ids: listIds });
      setMessage({ type: 'success', text: 'Audience updated.' });
      fetchCampaign();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update audience.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await api.post(`/api/v1/campaigns/${id}/preview`, { 
        vars: { name: 'Test User' } 
      });
      setPreviewHtml(response.data.html);
    } catch (err) {
      alert('Failed to generate preview.');
    }
  };

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const scheduled_at = (document.getElementById('scheduled_at') as HTMLInputElement).value;
    try {
      await api.post(`/api/v1/campaigns/${id}/schedule`, { scheduled_at });
      setMessage({ type: 'success', text: 'Campaign scheduled.' });
      fetchCampaign();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to schedule campaign.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNow = async () => {
    if (!confirm('Are you sure you want to send this campaign now?')) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/campaigns/${id}/send-now`);
      setMessage({ type: 'success', text: 'Campaign is being sent!' });
      fetchCampaign();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to trigger send.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-600 border-r-2 border-transparent"></div>
      </div>
    );
  }

  if (!campaign) return <div className="p-8 text-center text-red-500 premium-card">Campaign not found.</div>;

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'content', label: 'Email Design', icon: Layout },
    { id: 'schedule', label: 'Scheduling', icon: Clock },
    { id: 'stats', label: 'Performance', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <Link href="/campaigns" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-primary-600 transition-colors mb-2 group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Campaigns
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 
              campaign.status === 'sending' ? 'bg-amber-50 text-amber-600 animate-pulse' :
              'bg-slate-100 text-slate-500'
            }`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Campaign ID: <span className="font-mono">{campaign.id}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          {campaign.status === 'draft' && (
            <button
              onClick={handleSendNow}
              disabled={submitting}
              className="btn-primary"
            >
              <Zap className="mr-2 h-4 w-4 fill-white" />
              Launch Now
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        } transition-all animate-in fade-in slide-in-from-top-4`}>
          {message.type === 'success' ? <CheckCircle2 className="mr-3 h-5 w-5" /> : <AlertCircle className="mr-3 h-5 w-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          <div className="premium-card p-10">
            {activeTab === 'settings' && (
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Internal Name</label>
                      <input name="name" defaultValue={campaign.name} className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Subject</label>
                      <input name="subject" defaultValue={campaign.subject} className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11" required />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sender Name</label>
                      <input name="from_name" defaultValue={campaign.from_name} className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sender Email</label>
                      <input name="from_email" defaultValue={campaign.from_email} className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11" required />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[160px]">
                    <Save className="mr-2 h-4 w-4" />
                    {submitting ? 'Updating...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'audience' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Target Audience</h3>
                  <p className="text-slate-500 text-sm mt-1">Select the mailing lists that will receive this campaign.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lists.map((list) => (
                    <label key={list.id} className="flex items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="lists"
                          value={list.id}
                          defaultChecked={campaign.lists.some(l => l.id === list.id)}
                          className="h-5 w-5 text-primary-600 rounded-lg border-slate-300 focus:ring-primary-500 transition-all"
                        />
                      </div>
                      <div className="ml-4">
                        <span className="text-sm font-bold text-slate-900 block group-hover:text-primary-600 transition-colors">{list.name}</span>
                        <span className="text-xs text-slate-400">ID: {list.id}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <button onClick={handleAudienceUpdate} disabled={submitting} className="btn-primary min-w-[180px]">
                    Update Audience
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Email Designer</h3>
                    <p className="text-slate-500 text-sm mt-1">Craft your message using HTML.</p>
                  </div>
                  <button onClick={handlePreview} className="btn-secondary text-primary-600 border-primary-100 bg-primary-50/30">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="flex flex-col space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">HTML Source Code</label>
                    <textarea
                      id="html-editor"
                      className="flex-1 w-full border-none rounded-2xl font-mono text-sm p-6 bg-slate-900 text-slate-300 min-h-[500px] focus:ring-2 focus:ring-primary-500/50 outline-none"
                      defaultValue={campaign.html_body || ''}
                    />
                    <button 
                      onClick={async () => {
                        const el = document.getElementById('html-editor') as HTMLTextAreaElement;
                        await api.put(`/api/v1/campaigns/${id}`, { html_body: el.value });
                        setMessage({ type: 'success', text: 'Design saved successfully.' });
                      }}
                      className="btn-primary w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Design
                    </button>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rendered Result</label>
                    <div className="flex-1 border border-slate-100 rounded-2xl bg-slate-50/50 overflow-hidden relative min-h-[500px] shadow-inner">
                      {previewHtml ? (
                        <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="Live Preview" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                          <Layout className="h-10 w-10 mb-4 opacity-20" />
                          <p className="text-sm italic font-medium leading-relaxed">
                            Render your design to see the live preview here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="max-w-md space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delivery Schedule</h3>
                  <p className="text-slate-500 text-sm mt-1">Pick a future date to launch your campaign.</p>
                </div>
                <form onSubmit={handleSchedule} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Target Date & Time</label>
                    <input
                      type="datetime-local"
                      id="scheduled_at"
                      defaultValue={campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : ''}
                      className="mt-1 block w-full border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-11"
                      required
                    />
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl text-primary-700 text-xs font-medium leading-relaxed">
                    Note: Your campaign will enter the 'scheduled' queue and will be processed automatically.
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    Save Schedule
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Recipients', value: stats?.total_messages || 0, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Delivered', value: stats?.delivered_count || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Opened', value: stats?.opened_count || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Clicked', value: stats?.clicked_count || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map((s) => (
                    <div key={s.label} className={`p-6 rounded-2xl border border-slate-100 ${s.bg}`}>
                      <p className="text-2xl font-black text-slate-900">{s.value}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${s.color}`}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Growth Metrics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-bold">
                          <span className="text-slate-600">Open Rate</span>
                          <span className="text-emerald-600">{stats?.open_rate || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats?.open_rate || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-bold">
                          <span className="text-slate-600">Click Rate</span>
                          <span className="text-indigo-600">{stats?.click_rate || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats?.click_rate || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-slate-50 rounded-3xl flex flex-col justify-center text-center">
                    <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 italic font-medium">
                      Real-time analytics for your campaign are being gathered.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
