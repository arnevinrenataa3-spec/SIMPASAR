'use client';

/**
 * @file src/app/dashboard/pasar/PasarClient.js
 * @description Komponen UI Client-side untuk kelola Master Data Pasar (CRUD, Search & Filter).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { useState, useTransition } from 'react';
import Modal from '../../../components/Modal.js';
import { createPasarAction, updatePasarAction, deletePasarAction } from '../../actions/pasar.js';

export default function PasarClient({ pasars }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPasar, setEditingPasar] = useState(null);
  const [deletingPasar, setDeletingPasar] = useState(null);

  const [createState, setCreateState] = useState(null);
  const [isCreatePending, startCreateTransition] = useTransition();

  const [updateState, setUpdateState] = useState(null);
  const [isUpdatePending, startUpdateTransition] = useTransition();

  const [deleteState, setDeleteState] = useState(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleCreate = (formData) => {
    startCreateTransition(async () => {
      const res = await createPasarAction(createState, formData);
      setCreateState(res);
      if (res?.success) {
        setIsAddModalOpen(false);
      }
    });
  };

  const handleUpdate = (formData) => {
    startUpdateTransition(async () => {
      const res = await updatePasarAction(updateState, formData);
      setUpdateState(res);
      if (res?.success) {
        setEditingPasar(null);
      }
    });
  };

  const handleDelete = (formData) => {
    startDeleteTransition(async () => {
      const res = await deletePasarAction(deleteState, formData);
      setDeleteState(res);
      if (res?.success) {
        setDeletingPasar(null);
      }
    });
  };

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
            setCreateState(null);
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

      {/* Global Alerts */}
      {createState?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{createState.message}</span>
        </div>
      )}
      {createState?.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{createState.error}</span>
        </div>
      )}

      {updateState?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{updateState.message}</span>
        </div>
      )}
      {updateState?.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{updateState.error}</span>
        </div>
      )}

      {deleteState?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{deleteState.message}</span>
        </div>
      )}
      {deleteState?.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{deleteState.error}</span>
        </div>
      )}

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
                            setUpdateState(null);
                            setEditingPasar(p);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-150"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setDeleteState(null);
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
        <form action={handleCreate} className="space-y-4">
          {createState?.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {createState.error}
            </div>
          )}

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
              disabled={isCreatePending}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              {isCreatePending ? 'Menyimpan...' : 'Simpan Pasar'}
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
          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="id" value={editingPasar.id} />

            {updateState?.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {updateState.error}
              </div>
            )}

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
                disabled={isUpdatePending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {isUpdatePending ? 'Memperbarui...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingPasar)}
        onClose={() => setDeletingPasar(null)}
      >
        {deletingPasar && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Hapus Pasar {deletingPasar.namaPasar}?</h3>
              <p className="text-xs text-slate-400 mt-2">
                Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada ruang dagang atau petugas yang terhubung dengan pasar ini sebelum menghapus.
              </p>
            </div>

            <form action={handleDelete} className="space-y-4">
              <input type="hidden" name="id" value={deletingPasar.id} />

              {deleteState?.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
                  {deleteState.error}
                </div>
              )}

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPasar(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDeletePending}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500 text-slate-950 hover:bg-rose-400 disabled:opacity-50"
                >
                  {isDeletePending ? 'Menghapus...' : 'Ya, Hapus Pasar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
