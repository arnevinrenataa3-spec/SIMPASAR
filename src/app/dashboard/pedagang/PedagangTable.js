'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah, Aditya Syahestiano
 */


import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import DataTable from '../../../components/DataTable.js';
import Button from '../../../components/Button.js';
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
  const searchParams = useSearchParams();
  const pedagangIdFilter = searchParams.get('pedagangId');

  const scopedData = pedagangIdFilter
    ? initialData.filter((item) => item.id === pedagangIdFilter)
    : initialData;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Master Data</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Pedagang</h1>
          <p className="mt-1 text-sm text-slate-400">Identitas unik Pedagang berdasarkan NIK.</p>
        </div>
        <Button variant="primary" onClick={createModal.open}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Pedagang</span>
        </Button>
      </section>

      {pedagangIdFilter && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center justify-between gap-3">
          <span>
            Menampilkan: <strong>{scopedData[0]?.namaLengkap || 'pedagang ini'}</strong>
          </span>
          <Link href="/dashboard/pedagang" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 underline shrink-0">
            Tampilkan Semua
          </Link>
        </div>
      )}

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
                <Button
                  href={`/dashboard/ruang-dagang?pedagangId=${item.id}`}
                  variant="success"
                  size="sm"
                  title="Lihat Ruang Dagang yang dimiliki"
                >
                  Ruang
                </Button>
                <Button variant="info" size="sm" onClick={() => editModal.open(item)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => deleteModal.open(item)}>Hapus</Button>
              </div>
            ),
          },
        ]}
        data={scopedData}
        emptyMessage="Belum ada Pedagang."
        filterEmptyMessage="Tidak ada Pedagang yang cocok."
      />

      <Modal key={createModal.key} isOpen={createModal.isOpen} onClose={createModal.close} title="Tambah Pedagang" maxWidth="max-w-xl">
        <form action={createModal.action} className="space-y-4"><Fields /><AlertBanner state={createModal.state} /><Button type="submit" variant="primary" pending={createModal.pending} className="w-full">{createModal.pending ? 'Menyimpan...' : 'Simpan Pedagang'}</Button></form>
      </Modal>
      <Modal key={editModal.key} isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Pedagang" maxWidth="max-w-xl">
        {editModal.item && <form action={editModal.action} className="space-y-4"><input type="hidden" name="id" value={editModal.item.id} /><Fields item={editModal.item} /><AlertBanner state={editModal.state} /><Button type="submit" variant="info" pending={editModal.pending} className="w-full">{editModal.pending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></form>}
      </Modal>
      <Modal key={deleteModal.key} isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Hapus Pedagang" submitOnEnter={false}>
        {deleteModal.item && <form action={deleteModal.action} className="space-y-5"><input type="hidden" name="id" value={deleteModal.item.id} /><p className="text-sm text-slate-300">Hapus <strong className="text-white">{deleteModal.item.namaLengkap}</strong>? Pedagang dengan riwayat Perizinan tidak dapat dihapus.</p><AlertBanner state={deleteModal.state} /><Button type="submit" variant="danger" pending={deleteModal.pending} className="w-full">{deleteModal.pending ? 'Menghapus...' : 'Hapus Pedagang'}</Button></form>}
      </Modal>
    </div>
  );
}
