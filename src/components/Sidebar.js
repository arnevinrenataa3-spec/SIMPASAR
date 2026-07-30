'use client';

/**
 * @description Sidebar interaktif yang menampilkan menu sesuai peran dan halaman aktif.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah, Aditya Syahestiano
 */

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { logoutAction } from '../app/actions/auth.js';
import { baseNavItems, adminNavItems } from './navConfig.js';

export default function Sidebar({ user }) {
  // Hook navigasi hanya tersedia di Client Component dan mengembalikan segmen URL aktif.
  const segment = useSelectedLayoutSegment();

  // Menu pengelolaan pasar dan pengguna hanya ditampilkan kepada admin.
  const navItems = user?.role === 'admin' ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Identitas aplikasi */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
            SP
          </div>
          <div>
            <span className="font-extrabold text-slate-100 tracking-tight text-lg block leading-none">
              SIMPASAR
            </span>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              Management System
            </span>
          </div>
        </div>

        {/* Daftar navigasi */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const isActive = item.segment === segment;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors duration-150'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.isAdminOnly && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ringkasan pengguna dan formulir logout melalui Server Action */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug break-words" title={user?.name || 'Petugas'}>
                {user?.name || 'Petugas'}
              </p>
              <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                {user?.role || 'petugas'}
              </span>
            </div>
          </div>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              title="Keluar / Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition duration-150 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
