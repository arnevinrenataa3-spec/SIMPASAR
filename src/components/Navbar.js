'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { useTransition } from 'react';
import { setPasarScopeAction } from '../app/actions/scope.js';

export default function Navbar({ user, pasars = [], selectedScope = 'all' }) {
  const [isPending, startTransition] = useTransition();

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleScopeChange = (e) => {
    const val = e.target.value;
    startTransition(async () => {
      await setPasarScopeAction(val);
    });
  };

  return (
    <header className="h-16 px-8 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Portal Pengelola Pasar</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-normal">Dashboard Utama</span>
        </h2>
      </div>

      {/* Quick Info Bar */}
      <div className="flex items-center gap-4 text-xs">
        {/* Date Display */}
        <div className="hidden sm:block text-slate-400 text-xs bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
          {currentDate}
        </div>

        {/* Market Selector (Admin) or Badge (Petugas) */}
        {user?.role === 'admin' ? (
          <div className="relative inline-flex items-center">
            <select
              id="pasarScopeSelector"
              value={selectedScope}
              onChange={handleScopeChange}
              disabled={isPending}
              className="appearance-none bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-300 text-sm font-semibold pl-4 pr-10 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition duration-150"
            >
              <option value="all" className="bg-slate-900 text-slate-200 py-1">
                🌐 Semua Pasar
              </option>
              {pasars.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200 py-1">
                  🏢 {p.namaPasar}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full"
            title={user?.pasarNama || 'Petugas'}
          >
            <span className="font-semibold text-sm truncate max-w-[220px]">
              🏢 {user?.pasarNama || 'Petugas'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
