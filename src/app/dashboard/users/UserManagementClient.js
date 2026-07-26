'use client';

/**
 * @description Komponen UI Client-side untuk Manajemen Pengguna (CRUD, Modal, Search & Filter).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { useState } from 'react';
import { useCrudActions } from '../../../lib/useCrudActions.js';
import Modal from '../../../components/Modal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal.js';
import { createUserAction, updateUserAction, deleteUserAction } from '../../actions/users.js';

export default function UserManagementClient({ users, pasars = [], currentUserId, selectedScope = 'all' }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [addRole, setAddRole] = useState('petugas');
  const [editRole, setEditRole] = useState('petugas');

  const actions = useCrudActions({
    create: createUserAction,
    update: updateUserAction,
    remove: deleteUserAction,
    onCreateSuccess: () => setIsAddModalOpen(false),
    onUpdateSuccess: () => setEditingUser(null),
    onDeleteSuccess: () => setDeletingUser(null),
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Kelola User & Petugas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar akun pengelola pasar yang memiliki akses ke sistem SIMPASAR.
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
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Alerts */}
      <AlertBanner state={actions.create.state} />
      <AlertBanner state={actions.update.state} />
      <AlertBanner state={actions.delete.state} />

      {/* User Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role & Penempatan</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const formattedDate = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition duration-150">
                    <td className="px-6 py-4 font-medium text-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                              Saya
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                      @{u.username}
                    </td>

                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Admin
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Petugas
                          </span>
                          <span className="text-[10px] text-slate-400 max-w-[120px] truncate" title={u.namaPasar}>
                            {u.namaPasar || 'Belum ditugaskan'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formattedDate}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          actions.update.reset();
                          setEditingUser(u);
                          setEditRole(u.role);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-150"
                      >
                        Edit
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => {
                            actions.delete.reset();
                            setDeletingUser(u);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition duration-150"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah User Baru"
      >
        <form action={actions.create.action} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Nama Lengkap
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Contoh: Ahmad Subagja"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              placeholder="ahmad_petugas"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Role Akses
            </label>
            <select
              name="role"
              value={addRole}
              onChange={(e) => setAddRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="petugas">Petugas (Operasional)</option>
              <option value="admin">Admin (Akses Penuh)</option>
            </select>
          </div>

          {addRole === 'petugas' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Penempatan Pasar <span className="text-rose-400">*</span>
              </label>
              <select
                name="pasarId"
                required
                defaultValue={selectedScope !== 'all' ? selectedScope : ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Pasar --</option>
                {pasars.map((p) => (
                  <option key={p.id} value={p.id}>{p.namaPasar}</option>
                ))}
              </select>
            </div>
          )}

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
              {actions.create.pending ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        {editingUser && (
          <form action={actions.update.action} className="space-y-4">
            <input type="hidden" name="id" value={editingUser.id} />

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Nama Lengkap
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={editingUser.name}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                defaultValue={editingUser.username}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Password Baru <span className="text-slate-500 capitalize font-normal">(Kosongkan jika tidak ingin mengubah)</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Role Akses
              </label>
              <select
                name="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="petugas">Petugas (Operasional)</option>
                <option value="admin">Admin (Akses Penuh)</option>
              </select>
            </div>

            {editRole === 'petugas' && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Penempatan Pasar <span className="text-rose-400">*</span>
                </label>
                <select
                  name="pasarId"
                  required
                  defaultValue={editingUser.pasarId}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Pasar --</option>
                  {pasars.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPasar}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        itemName={deletingUser && `@${deletingUser.username}`}
        onConfirm={actions.delete.action}
        isPending={actions.delete.pending}
      />
    </div>
  );
}
