'use client';

/**
 * @description Public permit search and Digital ID result.
 * @author Muhamad Hazmi Alfarizqi
 */

import { useActionState } from 'react';
import { checkStatusPublik } from '../actions/publik.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function PublicPermitLookup() {
  const [state, action, pending] = useActionState(checkStatusPublik, null);
  const permit = state?.data;
  const active = permit?.status === 'aktif';
  const warning = permit?.peringatan?.toUpperCase();

  return (
    <section className="space-y-6">
      <form action={action} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
        <label htmlFor="nomorKartu" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Nomor Kartu</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id="nomorKartu" name="nomorKartu" required maxLength={100} placeholder="Contoh: SPTB-2026-001" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-black/20 px-4 py-3 font-mono text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-slate-600 focus:border-emerald-400" />
          <button disabled={pending} className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">{pending ? 'Memeriksa...' : 'Cek Status'}</button>
        </div>
        {state?.error && <p role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{state.error}</p>}
      </form>

      {permit && (
        <article className={`relative overflow-hidden rounded-[2rem] border bg-slate-900 p-6 shadow-2xl sm:p-8 ${active ? 'border-emerald-400/50 shadow-emerald-950' : 'border-rose-500/60 shadow-rose-950'}`}>
          <div className={`absolute inset-x-0 top-0 h-1.5 ${active ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[35px] border-white/[0.025]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Digital Market Permit</p><h2 className="mt-2 text-xl font-black">{permit.namaPasar}</h2></div>
              <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${active ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>{permit.status}</span>
            </div>
            <div className="my-8 grid grid-cols-[1fr_auto] items-end gap-6 border-y border-slate-800 py-7">
              <div><p className="text-xs uppercase tracking-wider text-slate-500">Nomor Ruang</p><p className="mt-1 font-mono text-4xl font-black tracking-tight text-white">{permit.nomorRuang}</p></div>
              <div className="h-16 w-16 rounded-2xl bg-[repeating-linear-gradient(45deg,#334155_0,#334155_4px,#0f172a_4px,#0f172a_8px)] opacity-60" aria-hidden="true" />
            </div>
            <dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nomor Kartu</dt><dd className="mt-1 font-mono text-sm text-slate-200">{permit.nomorKartu}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal Terbit</dt><dd className="mt-1 text-sm text-slate-200">{formatDate(permit.tanggalTerbit)}</dd></div><div className="sm:col-span-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Berlaku Sampai</dt><dd className={`mt-1 text-lg font-bold ${active ? 'text-emerald-300' : 'text-rose-300'}`}>{formatDate(permit.tanggalKedaluwarsa)}</dd></div></dl>
            {!active && <div className="mt-7 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-300">{warning ? `Peringatan ${warning}` : 'Perhatian'}</p><p className="mt-2 text-sm leading-6 text-rose-100">Izin tidak aktif. Segera hubungi kantor pengelola Pasar untuk pemeriksaan dan tindak lanjut.</p></div>}
          </div>
        </article>
      )}
    </section>
  );
}
