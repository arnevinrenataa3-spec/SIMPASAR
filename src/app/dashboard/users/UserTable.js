'use client';

/**
 * @description Komponen UI Client-side untuk Manajemen Pengguna (CRUD, Modal, Search & Filter).
 * @author Aditya Syahestiano
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { useState } from 'react';
import { useCrudModal } from '../../../lib/useCrudModal.js';
import Modal from '../../../components/Modal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal.js';
import DataTable from '../../../components/DataTable.js';
import Button from '../../../components/Button.js';
import Badge from '../../../components/Badge.js';
import { createUserAction, updateUserAction, deleteUserAction } from '../../actions/users.js';

export default function UserTable({ users, pasars = [], currentUserId, selectedScope = 'all' }) {
  const [addRole, setAddRole] = useState('petugas');
  const [editRole, setEditRole] = useState('petugas');
  const createModal = useCrudModal({ action: createUserAction });
  const editModal = useCrudModal({ action: updateUserAction });
  const deleteModal = useCrudModal({ action: deleteUserAction });

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

        <Button onClick={createModal.open}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah User Baru</span>
        </Button>
      </div>

      <DataTable
        columns={[
          {
            header: 'Pengguna',
            accessor: 'name',
            render: (u) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{u.name}</span>
                    {u.id === currentUserId && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">Saya</span>
                    )}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: 'Username',
            accessor: 'username',
            render: (u) => <span className="font-mono text-xs">@{u.username}</span>,
          },
          {
            header: 'Role',
            accessor: 'role',
            render: (u) =>
              u.role === 'admin' ? (
                <Badge color="cyan" dot>Admin</Badge>
              ) : (
                <Badge color="slate" dot>Petugas</Badge>
              ),
          },
          {
            header: 'Penempatan',
            accessor: 'namaPasar',
            render: (u) =>
              u.namaPasar ? (
                <span className="text-xs max-w-[160px] truncate block" title={u.namaPasar}>{u.namaPasar}</span>
              ) : (
                <span className="text-xs text-slate-400">&mdash;</span>
              ),
          },
          {
            header: 'Tanggal Dibuat',
            accessor: 'createdAt',
            render: (u) => {
              const fmt = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : '-';
              return <span className="text-xs text-slate-400">{fmt}</span>;
            },
          },
          {
            header: 'Aksi',
            thClassName: 'text-right',
            tdClassName: 'text-right',
            render: (u) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { editModal.open(u); setEditRole(u.role); }}
                >
                  Edit
                </Button>
                {u.id !== currentUserId && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteModal.open(u)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={users}
        searchPlaceholder="Cari nama, username, peran, atau penempatan..."
        filters={[
          {
            accessor: 'role',
            placeholder: 'Semua Role',
            options: [
              { label: 'Semua Role', value: '' },
              { label: 'Admin', value: 'admin' },
              { label: 'Petugas', value: 'petugas' },
            ],
          },
          {
            accessor: 'pasarId',
            placeholder: 'Semua Penempatan',
            options: [
              { label: 'Semua Penempatan', value: '' },
              ...pasars.map((p) => ({ label: p.namaPasar, value: p.id })),
            ],
          },
        ]}
        emptyMessage="Belum ada data pengguna."
        filterEmptyMessage="Tidak ada pengguna yang cocok dengan filter."
      />

      {/* Add User Modal */}
      <Modal
        key={createModal.key}
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Tambah User Baru"
        maxWidth="max-w-xl"
      >
        <form action={createModal.action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Nama Lengkap
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Ahmad Subagja"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <AlertBanner state={createModal.state} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={createModal.close}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              pending={createModal.pending}
            >
              {createModal.pending ? 'Menyimpan...' : 'Simpan User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        key={editModal.key}
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit User"
        maxWidth="max-w-xl"
      >
        {editModal.item && (
          <form action={editModal.action} className="space-y-4">
            <input type="hidden" name="id" value={editModal.item.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editModal.item.name}
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
                  defaultValue={editModal.item.username}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Password Baru <span className="text-slate-400 capitalize font-normal">(Kosongkan jika tidak ingin mengubah)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            </div>

            {editRole === 'petugas' && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Penempatan Pasar <span className="text-rose-400">*</span>
                </label>
                <select
                  name="pasarId"
                  required
                  defaultValue={editModal.item.pasarId}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Pasar --</option>
                  {pasars.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPasar}</option>
                  ))}
                </select>
              </div>
            )}

            <AlertBanner state={editModal.state} />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={editModal.close}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                pending={editModal.pending}
              >
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
        itemName={deleteModal.item && `@${deleteModal.item.username}`}
        onConfirm={deleteModal.action}
        isPending={deleteModal.pending}
        itemId={deleteModal.item?.id}
        state={deleteModal.state}
      />
    </div>
  );
}
