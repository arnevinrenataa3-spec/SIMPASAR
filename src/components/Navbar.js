'use client';

/**
 * @description Header dashboard untuk judul halaman dan pemilih cakupan pasar.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah, Aditya Syahestiano
 */

import { useTransition } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { setPasarScopeAction } from '../app/actions/scope.js';
import Select from './Select.js';
import { baseNavItems, adminNavItems } from './navConfig.js';

const ALL_NAV_ITEMS = [...baseNavItems, ...adminNavItems];

export default function Navbar({ user, pasars = [], selectedScope = 'all' }) {
  // useTransition menjaga UI tetap responsif selama Server Action mengganti cakupan pasar.
  const [isPending, startTransition] = useTransition();
  const segment = useSelectedLayoutSegment();
  const currentPageName = ALL_NAV_ITEMS.find((item) => item.segment === segment)?.name || 'Overview';

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleScopeChange = (val) => {
    startTransition(async () => {
      await setPasarScopeAction(val);
    });
  };

  const scopeOptions = [
    { value: 'all', label: '🌐 Semua Pasar' },
    ...pasars.map((p) => ({ value: p.id, label: `🏢 ${p.namaPasar}` })),
  ];

  return (
    <header className="h-16 px-8 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      {/* Judul halaman mengikuti segmen URL aktif */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Portal Pengelola Pasar</span>
          <span className="text-slate-400">/</span>
          <span className="text-emerald-400 font-normal">{currentPageName}</span>
        </h2>
      </div>

      {/* Informasi singkat */}
      <div className="flex items-center gap-4 text-xs">
        {/* Tanggal hari ini */}
        <div className="hidden sm:block text-slate-400 text-xs bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
          {currentDate}
        </div>

        {/* Admin dapat mengganti cakupan; petugas hanya melihat pasar penempatannya. */}
        {user?.role === 'admin' ? (
          <Select
            options={scopeOptions}
            value={selectedScope}
            onChange={handleScopeChange}
            disabled={isPending}
            className="!bg-emerald-500/10 hover:!bg-emerald-500/20 !border-emerald-500/40 hover:!border-emerald-500/60 !text-emerald-300 !text-sm !font-semibold !pl-4 !pr-10 !py-2 !rounded-full !shadow-md focus:!ring-2 focus:!ring-emerald-500/50"
          />
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
