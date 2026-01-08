'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
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
      pending: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-indigo-100 text-indigo-800',
      clicked: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[s] || 'bg-gray-100'}`}>
        {s}
      </span>
    );
  };

  const columns = [
    { header: 'Recipient', accessor: 'recipient_email' as keyof Message },
    { header: 'Campaign', accessor: (m: Message) => m.campaign_name || 'N/A' },
    { header: 'Status', accessor: (m: Message) => getStatusBadge(m.status) },
    { header: 'Processed At', accessor: (m: Message) => m.sent_at ? new Date(m.sent_at).toLocaleString() : '-' },
    { 
      header: 'Error', 
      accessor: (m: Message) => m.error_message ? <span className="text-red-500 truncate max-w-xs block text-xs" title={m.error_message}>{m.error_message}</span> : '-' 
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Monitoring</h1>
          <p className="text-slate-500 mt-1">Track delivery and engagement for every message sent.</p>
        </div>
        <button 
          onClick={() => fetchMessages()} 
          className="btn-secondary rounded-full! p-2.5"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-4 shadow rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search email or campaign..."
            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
