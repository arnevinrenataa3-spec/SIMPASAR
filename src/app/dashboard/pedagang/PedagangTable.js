'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { useDeferredValue, useState } from 'react';
import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import {
  createPedagangAction,
  deletePedagangAction,
  updatePedagangAction,
} from '../../actions/pedagang.js';

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
  const createModal = useCrudModal({ action: createPedagangAction });
  const editModal = useCrudModal({ action: updatePedagangAction });
  const deleteModal = useCrudModal({ action: deletePedagangAction });

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
        <button onClick={createModal.open} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300">Tambah Pedagang</button>
      </section>

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
                  <td className="px-5 py-4 text-right"><button onClick={() => editModal.open(item)} className="mr-2 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300">Edit</button><button onClick={() => deleteModal.open(item)} className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300">Hapus</button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">Tidak ada Pedagang yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal key={createModal.key} isOpen={createModal.isOpen} onClose={createModal.close} title="Tambah Pedagang">
        <form action={createModal.action} className="space-y-4"><Fields /><AlertBanner state={createModal.state} /><button disabled={createModal.pending} className="w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{createModal.pending ? 'Menyimpan...' : 'Simpan Pedagang'}</button></form>
      </Modal>
      <Modal key={editModal.key} isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Pedagang">
        {editModal.item && <form action={editModal.action} className="space-y-4"><input type="hidden" name="id" value={editModal.item.id} /><Fields item={editModal.item} /><AlertBanner state={editModal.state} /><button disabled={editModal.pending} className="w-full rounded-xl bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{editModal.pending ? 'Menyimpan...' : 'Simpan Perubahan'}</button></form>}
      </Modal>
      <Modal key={deleteModal.key} isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Hapus Pedagang" submitOnEnter={false}>
        {deleteModal.item && <form action={deleteModal.action} className="space-y-5"><input type="hidden" name="id" value={deleteModal.item.id} /><p className="text-sm text-slate-300">Hapus <strong className="text-white">{deleteModal.item.namaLengkap}</strong>? Pedagang dengan riwayat Perizinan tidak dapat dihapus.</p><AlertBanner state={deleteModal.state} /><button disabled={deleteModal.pending} className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{deleteModal.pending ? 'Menghapus...' : 'Hapus Pedagang'}</button></form>}
      </Modal>
    </div>
  );
}
