'use client';

/**
 * @description Komponen UI Client-side untuk kelola Master Data Pasar (CRUD, Search & Filter).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { useState } from 'react';
import { useCrudActions } from '../../../lib/useCrudActions.js';
import Modal from '../../../components/Modal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal.js';
import { createPasarAction, updatePasarAction, deletePasarAction } from '../../actions/pasar.js';

export default function PasarClient({ pasars }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPasar, setEditingPasar] = useState(null);
  const [deletingPasar, setDeletingPasar] = useState(null);

  const actions = useCrudActions({
    create: createPasarAction,
    update: updatePasarAction,
    remove: deletePasarAction,
    onCreateSuccess: () => setIsAddModalOpen(false),
    onUpdateSuccess: () => setEditingPasar(null),
    onDeleteSuccess: () => setDeletingPasar(null),
  });

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

        <button
          onClick={() => {
            actions.create.reset();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition duration-150 shadow-lg shadow-emerald-500/20 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Pasar Baru</span>
        </button>
      </div>

      {/* Alerts */}
      <AlertBanner state={actions.create.state} />
      <AlertBanner state={actions.update.state} />
      <AlertBanner state={actions.delete.state} />

      {/* Pasar Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Nama Pasar</th>
                <th className="px-6 py-4">Nomor Pasar</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pasars.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Belum ada data pasar. Silakan tambahkan pasar baru.
                  </td>
                </tr>
              ) : (
                pasars.map((p) => {
                  const formattedDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition duration-150">
                      <td className="px-6 py-4 font-medium text-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0 uppercase">
                          {p.namaPasar.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{p.namaPasar}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {p.nomorPasar}
                      </td>

                      <td className="px-6 py-4 text-slate-300 text-xs max-w-xs truncate">
                        {p.alamat}
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formattedDate}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            actions.update.reset();
                            setEditingPasar(p);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-150"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            actions.delete.reset();
                            setDeletingPasar(p);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition duration-150"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pasar Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pasar Baru"
      >
        <form action={actions.create.action} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Nama Pasar
            </label>
            <input
              name="namaPasar"
              type="text"
              required
              placeholder="Contoh: Pasar Induk Cikopo"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actions.create.pending}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              {actions.create.pending ? 'Menyimpan...' : 'Simpan Pasar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Pasar Modal */}
      <Modal
        isOpen={Boolean(editingPasar)}
        onClose={() => setEditingPasar(null)}
        title="Edit Pasar"
      >
        {editingPasar && (
          <form action={actions.update.action} className="space-y-4">
            <input type="hidden" name="id" value={editingPasar.id} />

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Nama Pasar
              </label>
              <input
                name="namaPasar"
                type="text"
                required
                defaultValue={editingPasar.namaPasar}
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
                defaultValue={editingPasar.nomorPasar}
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
                defaultValue={editingPasar.alamat}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPasar(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actions.update.pending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {actions.update.pending ? 'Memperbarui...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingPasar)}
        onClose={() => setDeletingPasar(null)}
        itemName={deletingPasar?.namaPasar}
        onConfirm={actions.delete.action}
        isPending={actions.delete.pending}
      />
    </div>
  );
}
