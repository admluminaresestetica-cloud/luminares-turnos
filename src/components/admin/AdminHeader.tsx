'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AdminTab } from '@/lib/admin/constants';

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  reservasCount: number;
}

export default function AdminHeader({ activeTab, onTabChange, reservasCount }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'agenda', label: 'Agenda', badge: reservasCount },
    { id: 'precios', label: 'Precios y Calendario' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Panel Admin</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Centro de Estética</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
          >
            Cerrar Sesión
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
