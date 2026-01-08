'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  FileText, 
  List, 
  Activity, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 w-64 lg:w-72 fixed inset-y-0 z-50">
      <div className="flex items-center h-20 px-8 border-b border-slate-50">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">GasyCoder</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white ring-1 ring-slate-100">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
