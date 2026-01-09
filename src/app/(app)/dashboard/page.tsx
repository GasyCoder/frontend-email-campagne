'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Send, 
  Users, 
  CreditCard, 
  Calendar, 
  Plus, 
  Upload,
  ArrowUpRight,
  TrendingUp,
  Mail,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface UsageResponse {
  period: { start: string; end: string };
  plan: {
    name: string;
    monthly_credits: number;
    max_recipients_per_campaign: number;
    monthly_recipient_limit: number;
  };
  usage: {
    credits_used: number;
    recipients_sent: number;
  };
  remaining: {
    credits: number;
    recipients: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/api/v1/usage');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-r-2 border-t-2 border-indigo-500 border-transparent"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Credits (Emails)',
      value: data ? data.usage.credits_used : 0,
      total: data ? data.plan.monthly_credits : 0,
      remaining: data ? data.remaining.credits : 0,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      accent: 'bg-blue-600'
    },
    {
      name: 'Monthly Recipients',
      value: data ? data.usage.recipients_sent : 0,
      total: data ? data.plan.monthly_recipient_limit : 0,
      remaining: data ? data.remaining.recipients : 0,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      accent: 'bg-indigo-600'
    },
    {
      name: 'Current Plan',
      value: data?.plan.name || 'Free',
      description: 'Your marketing capacity',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      accent: 'bg-amber-600'
    },
    {
      name: 'Next Reset',
      value: data ? new Date(data.period.end).toLocaleDateString() : 'N/A',
      description: 'Quota renewal date',
      icon: Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      accent: 'bg-emerald-600'
    },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Overview</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here's what's happening with your campaigns.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contacts" className="btn-secondary">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
          <Link href="/campaigns" className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.name} className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.name}</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</h3>
                {item.total && (
                  <span className="text-sm text-slate-400">/ {item.total}</span>
                )}
              </div>
              {item.total ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Usage</span>
                    <span className="font-medium text-slate-700">{Math.round((Number(item.value) / Number(item.total)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${item.accent} h-full transition-all duration-1000`} 
                      style={{ width: `${Math.min(100, (Number(item.value) / Number(item.total)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="premium-card p-6 lg:col-span-2 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent Campaigns
            </h2>
            <Link
              href="/campaigns"
              className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <Mail className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No recent campaigns
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Start your marketing journey by creating your first campaign.
            </p>
            <Link href="/campaigns" className="mt-6 btn-primary">
              Launch Campaign
            </Link>
          </div>
        </div>

        <div className="premium-card border-none bg-indigo-900 p-6 text-white shadow-xl shadow-indigo-200 md:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <CreditCard className="h-6 w-6 text-indigo-200" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Upgrade to Pro</h2>
          <p className="mb-8 text-sm leading-relaxed text-indigo-100">
            Get 10,000+ credits, priority delivery, and advanced analytics to scale your business.
          </p>
          <button className="w-full rounded-xl bg-white py-3 font-bold text-indigo-900 transition-transform hover:scale-[1.03] active:scale-[0.97]">
            View Pricing
          </button>
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-900 bg-indigo-800 text-[10px] font-bold"
                >
                  {i}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-900 bg-indigo-700 text-[10px] font-bold">
                +42
              </div>
            </div>
            <span className="text-xs text-indigo-200">Joined Pro this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
