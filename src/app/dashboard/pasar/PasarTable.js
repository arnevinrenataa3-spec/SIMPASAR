'use client';

/**
 * @description Komponen UI Client-side untuk kelola Master Data Pasar (CRUD, Search & Filter).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { useCrudModal } from '../../../lib/useCrudModal.js';
import Modal from '../../../components/Modal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal.js';
import DataTable from '../../../components/DataTable.js';
import Button from '../../../components/Button.js';
import { createPasarAction, updatePasarAction, deletePasarAction } from '../../actions/pasar.js';

export default function PasarTable({ pasars }) {
  const createModal = useCrudModal({ action: createPasarAction });
  const editModal = useCrudModal({ action: updatePasarAction });
  const deleteModal = useCrudModal({ action: deletePasarAction });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Kelola Pasar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar pasar yang dikelola dalam sistem SIMPASAR.
          </p>
        </div>

        <Button variant="primary" onClick={createModal.open}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Pasar Baru</span>
        </Button>
      </div>

      <DataTable
        columns={[
          {
            header: 'Nama Pasar',
            accessor: 'namaPasar',
            render: (p) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0 uppercase">
                  {p.namaPasar.charAt(0)}
                </div>
                <span className="font-medium text-slate-100">{p.namaPasar}</span>
              </div>
            ),
          },
          {
            header: 'Nomor Pasar',
            accessor: 'nomorPasar',
            tdClassName: 'font-mono text-xs',
          },
          {
            header: 'Alamat',
            accessor: 'alamat',
            tdClassName: 'text-xs max-w-xs truncate',
          },
          {
            header: 'Tanggal Dibuat',
            accessor: 'createdAt',
            render: (p) => (
              <span className="text-xs text-slate-400">
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '-'}
              </span>
            ),
          },
          {
            header: 'Aksi',
            thClassName: 'text-right',
            tdClassName: 'text-right',
            render: (p) => (
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => editModal.open(p)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteModal.open(p)}>
                  Hapus
                </Button>
              </div>
            ),
          },
        ]}
        data={pasars}
        searchPlaceholder="Cari nama, nomor, atau alamat pasar..."
        emptyMessage="Belum ada data pasar. Silakan tambahkan pasar baru."
        filterEmptyMessage="Tidak ada pasar yang cocok dengan pencarian."
      />

      {/* Add Pasar Modal */}
      <Modal
        key={createModal.key}
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Tambah Pasar Baru"
      >
        <form action={createModal.action} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Nama Pasar
            </label>
            <input
              name="namaPasar"
              type="text"
              required
              placeholder="Contoh: Pasar Induk Cikopo"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Nomor Pasar
            </label>
            <input
              name="nomorPasar"
              type="text"
              required
              placeholder="Contoh: 001"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              required
              rows={3}
              placeholder="Contoh: Jl. Dipatiukur No. 1, Bandung"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <AlertBanner state={createModal.state} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={createModal.close}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" pending={createModal.pending}>
              {createModal.pending ? 'Menyimpan...' : 'Simpan Pasar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Pasar Modal */}
      <Modal
        key={editModal.key}
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Pasar"
      >
        {editModal.item && (
          <form action={editModal.action} className="space-y-4">
            <input type="hidden" name="id" value={editModal.item.id} />

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Nama Pasar
              </label>
              <input
                name="namaPasar"
                type="text"
                required
                defaultValue={editModal.item.namaPasar}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Nomor Pasar
              </label>
              <input
                name="nomorPasar"
                type="text"
                required
                defaultValue={editModal.item.nomorPasar}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                required
                rows={3}
                defaultValue={editModal.item.alamat}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <AlertBanner state={editModal.state} />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="secondary" size="sm" onClick={editModal.close}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" pending={editModal.pending}>
                {editModal.pending ? 'Memperbarui...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        itemName={deleteModal.item?.namaPasar}
        onConfirm={deleteModal.action}
        isPending={deleteModal.pending}
        itemId={deleteModal.item?.id}
        state={deleteModal.state}
      />
    </div>
  );
}
