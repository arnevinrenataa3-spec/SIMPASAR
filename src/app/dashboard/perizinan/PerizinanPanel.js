'use client';

/**
 * @description Permit issuance form and current permit table.
 * @author Muhamad Hazmi Alfarizqi
 */

import { useActionState, useState } from 'react';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import { terbitkanIzinAction } from '../../actions/perizinan.js';

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function PerizinanPanel({ permits, spaces, traders }) {
  const [open, setOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState('new');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [state, action, pending] = useActionState(terbitkanIzinAction, null);
  const trader = traders.find((item) => item.id === selectedTrader);
  const space = spaces.find((item) => item.id === selectedSpace);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Operasional</p><h1 className="mt-1 text-2xl font-bold">Perizinan Ruang Dagang</h1><p className="mt-1 text-sm text-slate-400">Terbitkan izin dan pantau masa berlaku kartu pasar.</p></div>
        <button onClick={() => setOpen(true)} disabled={!spaces.length} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Terbitkan Izin</button>
      </section>
      <AlertBanner state={state} />
      {!spaces.length && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Tidak ada Ruang Dagang kosong dalam scope aktif.</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Nomor Kartu</th><th className="px-5 py-4">Ruang / Pasar</th><th className="px-5 py-4">Pedagang</th><th className="px-5 py-4">Dagangan</th><th className="px-5 py-4">Masa Berlaku</th><th className="px-5 py-4">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-800/70">{permits.map((permit) => { const expired = permit.statusIzin === 'aktif' && permit.tanggalKedaluwarsa < new Date().toISOString().slice(0, 10); const status = expired ? 'kedaluwarsa' : permit.statusIzin; return <tr key={permit.id}><td className="px-5 py-4 font-mono text-emerald-300">{permit.nomorKartu}</td><td className="px-5 py-4"><strong className="text-slate-100">{permit.kodeRuang}</strong><span className="block text-xs text-slate-500">{permit.namaPasar}</span></td><td className="px-5 py-4 text-slate-200">{permit.namaPedagang}</td><td className="px-5 py-4 text-slate-400">{permit.jenisDagangan}</td><td className="px-5 py-4 text-xs text-slate-400">{formatDate(permit.tanggalTerbit)} - {formatDate(permit.tanggalKedaluwarsa)}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${status === 'aktif' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>{status}</span></td></tr>; })}
          {!permits.length && <tr><td colSpan={6} className="py-14 text-center text-slate-500">Belum ada Perizinan dalam scope aktif.</td></tr>}</tbody></table></div>
      </section>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Penerbitan Izin Baru" maxWidth="max-w-2xl">
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Ruang Dagang
            <select name="ruangDagangId" required value={selectedSpace} onChange={(event) => setSelectedSpace(event.target.value)} className={`${inputClass} mt-2`}><option value="">Pilih ruang kosong</option>{spaces.map((item) => <option key={item.id} value={item.id}>{item.kodeRuang} - {item.namaPasar}</option>)}</select>
            {space && <input type="hidden" name="pasarId" value={space.pasarId} />}
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Pedagang
            <select value={selectedTrader} onChange={(event) => setSelectedTrader(event.target.value)} className={`${inputClass} mt-2`}><option value="new">Pedagang baru</option>{traders.map((item) => <option key={item.id} value={item.id}>{item.nik} - {item.namaLengkap}</option>)}</select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">NIK<input name="nik" required maxLength={16} className={`${inputClass} mt-2 font-mono`} readOnly={Boolean(trader)} key={`nik-${selectedTrader}`} defaultValue={trader?.nik ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nama lengkap<input name="namaLengkap" required className={`${inputClass} mt-2`} readOnly={Boolean(trader)} key={`nama-${selectedTrader}`} defaultValue={trader?.namaLengkap ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor HP<input name="nomorHp" required className={`${inputClass} mt-2`} readOnly={Boolean(trader)} key={`hp-${selectedTrader}`} defaultValue={trader?.nomorHp ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jenis dagangan<input name="jenisDagangan" required className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Alamat<textarea name="alamat" required className={`${inputClass} mt-2 min-h-20`} readOnly={Boolean(trader)} key={`alamat-${selectedTrader}`} defaultValue={trader?.alamat ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Nomor kartu<input name="nomorKartu" required className={`${inputClass} mt-2 font-mono`} placeholder="SPTB-2026-001" /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal terbit<input type="date" name="tanggalTerbit" required className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal kedaluwarsa<input type="date" name="tanggalKedaluwarsa" required className={`${inputClass} mt-2`} /></label>
          <button disabled={pending} className="rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:col-span-2">{pending ? 'Menerbitkan...' : 'Terbitkan Izin'}</button>
        </form>
      </Modal>
    </div>
  );
}
