'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { useActionState, useDeferredValue, useState } from 'react';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import {
  createPedagangAction,
  deletePedagangAction,
  updatePedagangAction,
} from '../../actions/pedagang.js';

const initialState = null;
const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

function Fields({ item }) {
  return (
    <>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">NIK
        <input className={`${inputClass} mt-2 font-mono`} name="nik" inputMode="numeric" maxLength={16} required defaultValue={item?.nik} />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nama lengkap
        <input className={`${inputClass} mt-2`} name="namaLengkap" required defaultValue={item?.namaLengkap} />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor HP
        <input className={`${inputClass} mt-2`} name="nomorHp" inputMode="tel" required defaultValue={item?.nomorHp} />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Alamat
        <textarea className={`${inputClass} mt-2 min-h-24 resize-y`} name="alamat" required defaultValue={item?.alamat} />
      </label>
    </>
  );
}

export default function PedagangTable({ initialData }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.toLowerCase().trim());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [createState, createAction, createPending] = useActionState(createPedagangAction, initialState);
  const [updateState, updateAction, updatePending] = useActionState(updatePedagangAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePedagangAction, initialState);

  const rows = initialData.filter((item) => (
    item.nik.includes(deferredQuery)
    || item.namaLengkap.toLowerCase().includes(deferredQuery)
    || item.nomorHp.includes(deferredQuery)
  ));

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Master Data</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Pedagang</h1>
          <p className="mt-1 text-sm text-slate-400">Identitas unik Pedagang berdasarkan NIK.</p>
        </div>
        <button onClick={() => setCreating(true)} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300">Tambah Pedagang</button>
      </section>

      <AlertBanner state={createState} />
      <AlertBanner state={updateState} />
      <AlertBanner state={deleteState} />

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <div className="border-b border-slate-800 p-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari NIK, nama, atau nomor HP..." className={inputClass} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">NIK</th><th className="px-5 py-4">Nama</th><th className="px-5 py-4">Kontak</th><th className="px-5 py-4">Alamat</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-emerald-300">{item.nik}</td>
                  <td className="px-5 py-4 font-semibold text-slate-100">{item.namaLengkap}</td>
                  <td className="px-5 py-4 text-slate-300">{item.nomorHp}</td>
                  <td className="max-w-xs truncate px-5 py-4 text-slate-400">{item.alamat}</td>
                  <td className="px-5 py-4 text-right"><button onClick={() => setEditing(item)} className="mr-2 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300">Edit</button><button onClick={() => setDeleting(item)} className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300">Hapus</button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">Tidak ada Pedagang yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Tambah Pedagang">
        <form action={createAction} className="space-y-4"><Fields /><button disabled={createPending} className="w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{createPending ? 'Menyimpan...' : 'Simpan Pedagang'}</button></form>
      </Modal>
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Pedagang">
        {editing && <form action={updateAction} className="space-y-4"><input type="hidden" name="id" value={editing.id} /><Fields item={editing} /><button disabled={updatePending} className="w-full rounded-xl bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{updatePending ? 'Menyimpan...' : 'Simpan Perubahan'}</button></form>}
      </Modal>
      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Hapus Pedagang" submitOnEnter={false}>
        {deleting && <form action={deleteAction} className="space-y-5"><input type="hidden" name="id" value={deleting.id} /><p className="text-sm text-slate-300">Hapus <strong className="text-white">{deleting.namaLengkap}</strong>? Pedagang dengan riwayat Perizinan tidak dapat dihapus.</p><button disabled={deletePending} className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{deletePending ? 'Menghapus...' : 'Hapus Pedagang'}</button></form>}
      </Modal>
    </div>
  );
}
