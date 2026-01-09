'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Users, 
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
        <div className="h-10 w-10 animate-spin rounded-full border-r-2 border-t-2 border-indigo-500 border-transparent"></div>
      </div>
    );
  }

  if (!campaign)
    return (
      <div className="premium-card p-8 text-center text-rose-500">Campaign not found.</div>
    );

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'content', label: 'Email Design', icon: Layout },
    { id: 'schedule', label: 'Scheduling', icon: Clock },
    { id: 'stats', label: 'Performance', icon: BarChart3 },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <Link
            href="/campaigns"
            className="group mb-2 inline-flex items-center text-sm font-medium text-slate-400 transition-colors hover:text-indigo-600"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Campaigns
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 break-words">
              {campaign.name}
            </h1>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                campaign.status === 'sent'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                  : campaign.status === 'sending'
                    ? 'bg-amber-50 text-amber-600 animate-pulse dark:bg-amber-500/20 dark:text-amber-200'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Campaign ID: <span className="font-mono">{campaign.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {campaign.status === 'draft' && (
            <Button onClick={handleSendNow} disabled={submitting}>
              <Zap className="h-4 w-4 fill-white" />
              Launch Now
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center rounded-2xl border p-4 text-sm transition-all ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="mr-3 h-5 w-5" />
          ) : (
            <AlertCircle className="mr-3 h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full space-y-1 lg:w-64">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/40'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon
                    className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                  />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className="premium-card p-6 md:p-10">
            {activeTab === 'settings' && (
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <Input
                      label="Internal Name"
                      name="name"
                      defaultValue={campaign.name}
                      required
                    />
                    <Input
                      label="Email Subject"
                      name="subject"
                      defaultValue={campaign.subject}
                      required
                    />
                  </div>
                  <div className="space-y-6">
                    <Input
                      label="Sender Name"
                      name="from_name"
                      defaultValue={campaign.from_name}
                      required
                    />
                    <Input
                      label="Sender Email"
                      name="from_email"
                      defaultValue={campaign.from_email}
                      required
                    />
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button type="submit" disabled={submitting} className="min-w-[160px]">
                    <Save className="h-4 w-4" />
                    {submitting ? 'Updating...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'audience' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Target Audience
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select the mailing lists that will receive this campaign.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {lists.map((list) => (
                    <label
                      key={list.id}
                      className="group flex cursor-pointer items-center rounded-2xl border border-slate-200 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="lists"
                          value={list.id}
                          defaultChecked={campaign.lists.some(l => l.id === list.id)}
                          className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 transition-all focus:ring-indigo-500 dark:border-slate-600"
                        />
                      </div>
                      <div className="ml-4 min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100">
                          {list.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">ID: {list.id}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button
                    onClick={handleAudienceUpdate}
                    disabled={submitting}
                    className="min-w-[180px]"
                  >
                    Update Audience
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Email Designer
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Craft your message using HTML.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={handlePreview}>
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <div className="flex flex-col space-y-4 min-w-0">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      HTML Source Code
                    </label>
                    <textarea
                      id="html-editor"
                      className="min-h-[500px] w-full flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-6 font-mono text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 whitespace-pre-wrap break-words"
                      defaultValue={campaign.html_body || ''}
                    />
                    <Button 
                      onClick={async () => {
                        const el = document.getElementById('html-editor') as HTMLTextAreaElement;
                        await api.put(`/api/v1/campaigns/${id}`, { html_body: el.value });
                        setMessage({ type: 'success', text: 'Design saved successfully.' });
                      }}
                      className="w-full"
                    >
                      <Save className="h-4 w-4" />
                      Save Design
                    </Button>
                  </div>

                  <div className="flex flex-col space-y-4 min-w-0">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rendered Result
                    </label>
                    <div className="relative min-h-[500px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
                      {previewHtml ? (
                        <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="Live Preview" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                          <Layout className="mb-4 h-10 w-10 opacity-20" />
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Delivery Schedule
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Pick a future date to launch your campaign.
                  </p>
                </div>
                <form onSubmit={handleSchedule} className="space-y-6">
                  <Input
                    label="Target Date & Time"
                    type="datetime-local"
                    id="scheduled_at"
                    defaultValue={
                      campaign.scheduled_at
                        ? new Date(campaign.scheduled_at).toISOString().slice(0, 16)
                        : ''
                    }
                    required
                  />
                  <div className="rounded-xl bg-indigo-50 p-4 text-xs font-medium leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                    Note: Your campaign will enter the 'scheduled' queue and will be processed automatically.
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    <Clock className="h-4 w-4" />
                    Save Schedule
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    {
                      label: 'Recipients',
                      value: stats?.total_messages || 0,
                      color: 'text-slate-900 dark:text-slate-100',
                      bg: 'bg-slate-50 dark:bg-slate-900/70',
                    },
                    {
                      label: 'Delivered',
                      value: stats?.delivered_count || 0,
                      color: 'text-blue-600 dark:text-blue-200',
                      bg: 'bg-blue-50 dark:bg-blue-500/10',
                    },
                    {
                      label: 'Opened',
                      value: stats?.opened_count || 0,
                      color: 'text-emerald-600 dark:text-emerald-200',
                      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                    },
                    {
                      label: 'Clicked',
                      value: stats?.clicked_count || 0,
                      color: 'text-indigo-600 dark:text-indigo-200',
                      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:p-6 ${s.bg}`}
                    >
                      <p className="text-2xl font-semibold">{s.value}</p>
                      <p className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${s.color}`}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Growth Metrics
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                          <span className="text-slate-600 dark:text-slate-300">Open Rate</span>
                          <span className="text-emerald-600 dark:text-emerald-200">
                            {stats?.open_rate || 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${stats?.open_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                          <span className="text-slate-600 dark:text-slate-300">Click Rate</span>
                          <span className="text-indigo-600 dark:text-indigo-200">
                            {stats?.click_rate || 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all duration-1000"
                            style={{ width: `${stats?.click_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center rounded-3xl bg-slate-50 p-8 text-center dark:bg-slate-900/70">
                    <BarChart3 className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium italic text-slate-500 dark:text-slate-400">
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
