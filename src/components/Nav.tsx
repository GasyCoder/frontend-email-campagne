'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  Activity,
  ChevronRight,
  FileText,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  User,
  Users,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
];

type NavProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function Nav({ open = false, onClose }: NavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950/90 lg:translate-x-0 lg:static lg:z-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">GasyCoder</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campaign Studio</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Main Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
              )}
            >
              <span className="flex items-center">
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-200'
                  )}
                />
                {item.name}
              </span>
              {isActive ? <ChevronRight className="h-4 w-4 text-indigo-400" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="mt-4 w-full justify-start text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
