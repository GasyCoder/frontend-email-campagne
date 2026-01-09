'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, CampaignInput } from '@/lib/validators';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  created_at: string;
}

interface Template {
  id: number;
  name: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/campaigns?status=${statusFilter}`);
      setCampaigns(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/v1/templates');
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [statusFilter]);

  const onSubmit = async (data: CampaignInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/campaigns', data);
      setIsModalOpen(false);
      reset();
      // Redirect to the detail page of the new campaign
      window.location.href = `/campaigns/${response.data.id}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
      sending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
      sent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
      failed: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
    };
    return (
      <span
        className={`inline-flex rounded-full px-2 text-xs font-semibold uppercase tracking-wide ${colors[status] || colors.draft}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Campaign, className: 'max-w-[220px] break-words' },
    { header: 'Subject', accessor: 'subject' as keyof Campaign, className: 'max-w-[260px] break-words' },
    { header: 'Status', accessor: (c: Campaign) => getStatusBadge(c.status) },
    { header: 'Created At', accessor: (c: Campaign) => new Date(c.created_at).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (c: Campaign) => (
        <div className="flex space-x-2">
          <Link
            href={`/campaigns/${c.id}`}
            className="text-indigo-600 hover:text-indigo-900"
            title="Manage"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and monitor your email marketing campaigns.
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'draft', 'scheduled', 'sending', 'sent', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <Table columns={columns} data={campaigns} loading={loading} />

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Campaign"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <Input
            label="Campaign Name"
            placeholder="e.g. Winter Sale 2026"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Subject"
            placeholder="Don't miss our deals!"
            error={errors.subject?.message}
            {...register('subject')}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="From Name"
              placeholder="Marketing Team"
              error={errors.from_name?.message}
              {...register('from_name')}
            />
            <Input
              label="From Email"
              placeholder="news@company.com"
              error={errors.from_email?.message}
              {...register('from_email')}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Starting Template (Optional)
            </label>
            <select
              {...register('template_id', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950"
            >
              <option value="">None</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create & Design'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
