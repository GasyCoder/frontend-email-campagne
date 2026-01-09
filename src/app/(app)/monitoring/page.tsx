'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Button from '@/components/ui/Button';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface Message {
  id: number;
  campaign_name: string;
  recipient_email: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced' | 'complained' | 'unsubscribed';
  sent_at: string | null;
  error_message: string | null;
}

export default function MonitoringPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Local debouncing for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/messages', {
        params: {
          page,
          status: status || undefined,
          search: debouncedSearch || undefined,
        }
      });
      setMessages(response.data.data || []);
      setTotalPage(response.data.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, status, debouncedSearch]);

  const getStatusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
      opened: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
      clicked: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200',
      failed: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
      bounced: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200',
    };
    return (
      <span
        className={`inline-flex rounded-full px-2 text-xs font-semibold uppercase tracking-wide ${colors[s] || colors.pending}`}
      >
        {s}
      </span>
    );
  };

  const columns = [
    {
      header: 'Recipient',
      accessor: 'recipient_email' as keyof Message,
      className: 'max-w-[220px] break-words',
    },
    {
      header: 'Campaign',
      accessor: (m: Message) => m.campaign_name || 'N/A',
      className: 'max-w-[220px] break-words',
    },
    { header: 'Status', accessor: (m: Message) => getStatusBadge(m.status) },
    {
      header: 'Processed At',
      accessor: (m: Message) => (m.sent_at ? new Date(m.sent_at).toLocaleString() : '-'),
    },
    {
      header: 'Error',
      accessor: (m: Message) =>
        m.error_message ? (
          <span
            className="block max-w-xs break-words text-xs text-rose-500"
            title={m.error_message}
          >
            {m.error_message}
          </span>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track delivery and engagement for every message sent.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchMessages()}
          className="h-10 w-10 rounded-full p-0"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email or campaign..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-offset-slate-950"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="block w-full min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
            <option value="failed">Failed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>

      <Table columns={columns} data={messages} loading={loading} />
      <Pagination currentPage={page} totalPage={totalPage} onPageChange={setPage} />
    </div>
  );
}
