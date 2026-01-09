'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Nav from '@/components/Nav';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-full w-full max-w-7xl overflow-hidden">
        <Nav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex w-full items-center gap-4 px-4 py-4 md:px-6">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Admin Panel
                  </h1>
                </div>
                <div className="hidden min-w-0 flex-1 lg:block">
                  <input
                    type="search"
                    placeholder="Search campaigns, contacts..."
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-offset-slate-950"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="hidden items-center gap-2 text-right sm:flex">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1">
            <div className="px-4 py-6 md:px-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
