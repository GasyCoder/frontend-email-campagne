'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, CampaignInput } from '@/lib/validators';
import { Plus, Eye, Send, BarChart3, Clock } from 'lucide-react';
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
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Campaign },
    { header: 'Subject', accessor: 'subject' as keyof Campaign },
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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
          <p className="text-slate-500 mt-1">Create and monitor your email marketing campaigns.</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            reset();
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </button>
      </div>

      <div className="flex space-x-4 mb-4">
        {['', 'draft', 'scheduled', 'sending', 'sent', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
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
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input
              {...register('name')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. Winter Sale 2026"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Subject</label>
            <input
              {...register('subject')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Don't miss our deals!"
            />
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Name</label>
              <input
                {...register('from_name')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Marketing Team"
              />
              {errors.from_name && <p className="mt-1 text-xs text-red-600">{errors.from_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">From Email</label>
              <input
                {...register('from_email')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="news@company.com"
              />
              {errors.from_email && <p className="mt-1 text-xs text-red-600">{errors.from_email.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Template (Optional)</label>
            <select
              {...register('template_id', { valueAsNumber: true })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">None</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create & Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
