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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-600 border-r-2 border-transparent"></div>
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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
        <div className="flex items-center space-x-3">
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
                <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Recent Campaigns</h2>
            <Link href="/campaigns" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center">
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No recent campaigns</h3>
            <p className="text-slate-500 max-w-xs mt-2">Start your marketing journey by creating your first campaign.</p>
            <Link href="/campaigns" className="mt-6 btn-primary">
              Launch Campaign
            </Link>
          </div>
        </div>

        <div className="premium-card p-8 bg-primary-900 text-white border-none shadow-xl shadow-primary-200">
          <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <CreditCard className="h-6 w-6 text-primary-200" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
          <p className="text-primary-100 text-sm leading-relaxed mb-8">
            Get 10,000+ credits, priority delivery, and advanced analytics to scale your business.
          </p>
          <button className="w-full py-3 bg-white text-primary-900 font-bold rounded-xl transition-transform hover:scale-[1.03] active:scale-[0.97]">
            View Pricing
          </button>
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-primary-900 bg-primary-800 flex items-center justify-center text-[10px] font-bold">
                  {i}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full border-2 border-primary-900 bg-primary-700 flex items-center justify-center text-[10px] font-bold">
                +42
              </div>
            </div>
            <span className="text-xs text-primary-200">Joined Pro this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
