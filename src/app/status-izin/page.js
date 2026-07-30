/**
 * @description Public permit lookup page for Pedagang.
 * @author Muhamad Hazmi Alfarizqi
 */

import Link from 'next/link';
import PublicPermitLookup from './PublicPermitLookup.js';

export const metadata = {
  title: 'Cek Izin Publik | SIMPASAR',
  description: 'Periksa status dan masa berlaku izin Ruang Dagang menggunakan nomor kartu.',
};

export default function PublicPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07110e] px-4 py-8 text-slate-100 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(52,211,153,0.14),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(6,182,212,0.1),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl">
        <nav className="mb-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 font-black text-slate-950">SP</span><span><strong className="block tracking-tight">SIMPASAR</strong><small className="text-[10px] uppercase tracking-[0.24em] text-emerald-400">Portal Publik</small></span></Link>
          <Link href="/login" className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300">Login Petugas</Link>
        </nav>
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <header className="pt-4 lg:sticky lg:top-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Validasi Mandiri</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">Kartu pasar Anda, <span className="text-emerald-400">selalu terpantau.</span></h1>
            <p className="mt-5 max-w-md leading-7 text-slate-400">Masukkan Nomor Kartu untuk melihat Ruang Dagang, masa berlaku, dan tingkat Surat Peringatan tanpa login.</p>
            <div className="mt-8 flex gap-6 border-t border-slate-800 pt-6 text-xs text-slate-400"><span>Tanpa NIK</span><span>Tanpa nomor HP</span><span>Data aman</span></div>
          </header>
          <PublicPermitLookup />
        </div>
      </div>
    </main>
  );
}
