'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import DataTable from '../../../components/DataTable.js';
import {
  createPedagangAction,
  deletePedagangAction,
  updatePedagangAction,
} from '../../actions/pedagang.js';

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

function Fields({ item }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">NIK
          <input className={`${inputClass} mt-2 font-mono`} name="nik" inputMode="numeric" maxLength={16} required defaultValue={item?.nik} />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nama lengkap
          <input className={`${inputClass} mt-2`} name="namaLengkap" required defaultValue={item?.namaLengkap} />
        </label>
      </div>
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
  const createModal = useCrudModal({ action: createPedagangAction });
  const editModal = useCrudModal({ action: updatePedagangAction });
  const deleteModal = useCrudModal({ action: deletePedagangAction });

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

      <DataTable
        cellPadding="px-5 py-4"
        syncSearchParams
        searchPlaceholder="Cari NIK, nama, atau nomor HP..."
        columns={[
          {
            header: 'NIK',
            accessor: 'nik',
            tdClassName: 'font-mono text-emerald-300',
          },
          {
            header: 'Nama',
            accessor: 'namaLengkap',
            tdClassName: 'font-semibold text-slate-100',
          },
          {
            header: 'Kontak',
            accessor: 'nomorHp',
          },
          {
            header: 'Alamat',
            accessor: 'alamat',
            tdClassName: 'max-w-xs truncate text-slate-400',
          },
          {
            header: 'Aksi',
            thClassName: 'text-right',
            tdClassName: 'text-right',
            render: (item) => (
              <div className="flex items-center justify-end gap-2">
                <a
                  href={`/dashboard/ruang-dagang?q=${encodeURIComponent(item.namaLengkap)}`}
                  className="rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
                  title="Lihat Ruang Dagang yang dimiliki"
                >
                  Ruang
                </a>
                <button onClick={() => editModal.open(item)} className="rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300">Edit</button>
                <button onClick={() => deleteModal.open(item)} className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300">Hapus</button>
              </div>
            ),
          },
        ]}
        data={initialData}
        emptyMessage="Belum ada Pedagang."
        filterEmptyMessage="Tidak ada Pedagang yang cocok."
      />

      <Modal key={createModal.key} isOpen={createModal.isOpen} onClose={createModal.close} title="Tambah Pedagang" maxWidth="max-w-xl">
        <form action={createModal.action} className="space-y-4"><Fields /><AlertBanner state={createModal.state} /><button disabled={createModal.pending} className="w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{createModal.pending ? 'Menyimpan...' : 'Simpan Pedagang'}</button></form>
      </Modal>
      <Modal key={editModal.key} isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Pedagang" maxWidth="max-w-xl">
        {editModal.item && <form action={editModal.action} className="space-y-4"><input type="hidden" name="id" value={editModal.item.id} /><Fields item={editModal.item} /><AlertBanner state={editModal.state} /><button disabled={editModal.pending} className="w-full rounded-xl bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">{editModal.pending ? 'Menyimpan...' : 'Simpan Perubahan'}</button></form>}
      </Modal>
      <Modal key={deleteModal.key} isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Hapus Pedagang" submitOnEnter={false}>
        {deleteModal.item && <form action={deleteModal.action} className="space-y-5"><input type="hidden" name="id" value={deleteModal.item.id} /><p className="text-sm text-slate-300">Hapus <strong className="text-white">{deleteModal.item.namaLengkap}</strong>? Pedagang dengan riwayat Perizinan tidak dapat dihapus.</p><AlertBanner state={deleteModal.state} /><button disabled={deleteModal.pending} className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{deleteModal.pending ? 'Menghapus...' : 'Hapus Pedagang'}</button></form>}
      </Modal>
    </div>
  );
}
