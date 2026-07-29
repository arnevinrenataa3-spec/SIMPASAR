'use client';

/**
 * @description Komponen UI Client-side untuk Master Data Ruang Dagang (CRUD, Validasi, Modal, Search & Filter).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { useState, useMemo } from 'react';
import { useCrudModal } from '../../../lib/useCrudModal.js';
import { hitungLuas, formatLuas } from '../../../lib/luas.js';
import Modal from '../../../components/Modal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal.js';
import { createRuangDagangAction, updateRuangDagangAction, deleteRuangDagangAction } from '../../actions/ruang-dagang.js';

export default function RuangDagangTable({ initialData = [], pasars = [], user, selectedScope = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [panjang, setPanjang] = useState('');
  const [lebar, setLebar] = useState('');
  const [editPanjang, setEditPanjang] = useState('');
  const [editLebar, setEditLebar] = useState('');

  const createModal = useCrudModal({
    action: createRuangDagangAction,
    onSuccess: () => { setPanjang(''); setLebar(''); },
  });
  const editModal = useCrudModal({
    action: updateRuangDagangAction,
    onSuccess: () => { setEditPanjang(''); setEditLebar(''); },
  });
  const deleteModal = useCrudModal({ action: deleteRuangDagangAction });

  const stats = useMemo(() => {
    const total = initialData.length;
    const kios = initialData.filter((item) => item.jenis === 'kios').length;
    const los = initialData.filter((item) => item.jenis === 'los').length;
    const lapak = initialData.filter((item) => item.jenis === 'lapak').length;
    const toko = initialData.filter((item) => item.jenis === 'toko').length;
    const kosong = initialData.filter((item) => item.status === 'kosong').length;
    const terisi = initialData.filter((item) => item.status === 'terisi').length;
    return { total, kios, los, lapak, toko, kosong, terisi };
  }, [initialData]);

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const matchSearch = item.kodeRuang.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchJenis = filterJenis === 'all' || item.jenis === filterJenis;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchJenis && matchStatus;
    });
  }, [initialData, searchTerm, filterJenis, filterStatus]);

  const getJenisBadge = (jenis) => {
    switch (jenis) {
      case 'kios':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            Kios
          </span>
        );
      case 'los':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
            Meja
          </span>
        );
      case 'lapak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            Lapak
          </span>
        );
      case 'toko':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Toko
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30 uppercase tracking-wider">
            {jenis}
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'terisi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Terisi
          </span>
        );
      case 'kosong':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Kosong
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const luasPreviewCreat = hitungLuas(panjang, lebar);
  const luasPreviewEdit = hitungLuas(editPanjang, editLebar);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Kelola Ruang Dagang</h1>
          <p className="text-xs text-slate-400 mt-1">Daftar ruang dagang yang tersedia di scope pasar aktif.</p>
        </div>
        <button
          onClick={() => {
            createModal.open();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition duration-150 shadow-lg shadow-emerald-500/20 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Ruang Dagang</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-100' },
          { label: 'Kios', value: stats.kios, color: 'text-indigo-400' },
          { label: 'Meja', value: stats.los, color: 'text-cyan-400' },
          { label: 'Lapak', value: stats.lapak, color: 'text-emerald-400' },
          { label: 'Toko', value: stats.toko, color: 'text-amber-400' },
          { label: 'Kosong', value: stats.kosong, color: 'text-emerald-400' },
          { label: 'Terisi', value: stats.terisi, color: 'text-rose-400' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4 text-center"
          >
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari kode ruang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/50 hover:border-slate-700 transition cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-200">Semua Jenis</option>
                <option value="kios" className="bg-slate-900 text-slate-200">Kios</option>
                <option value="los" className="bg-slate-900 text-slate-200">Meja</option>
                <option value="lapak" className="bg-slate-900 text-slate-200">Lapak</option>
                <option value="toko" className="bg-slate-900 text-slate-200">Toko</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/50 hover:border-slate-700 transition cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-200">Semua Status</option>
                <option value="kosong" className="bg-slate-900 text-slate-200">Kosong</option>
                <option value="terisi" className="bg-slate-900 text-slate-200">Terisi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-4 py-3.5">Pasar</th>
                <th className="px-4 py-3.5">Kode Ruang</th>
                <th className="px-4 py-3.5">Jenis</th>
                <th className="px-4 py-3.5">Luas (P x L)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada data ruang dagang yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition duration-150">
                    <td className="px-4 py-3.5 font-medium text-slate-100">
                      {item.namaPasar || '-'}
                    </td>
                    <td className="px-4 py-3.5 font-bold font-mono text-emerald-400">
                      {item.kodeRuang}
                    </td>
                    <td className="px-4 py-3.5">
                      {getJenisBadge(item.jenis)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                      {item.luas ? (
                        <span>{item.luas}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            editModal.open(item);
                            if (item.panjang != null) setEditPanjang(String(item.panjang));
                            else setEditPanjang('');
                            if (item.lebar != null) setEditLebar(String(item.lebar));
                            else setEditLebar('');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteModal.open(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        key={createModal.key}
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Tambah Ruang Dagang Baru"
        maxWidth="max-w-xl"
      >
        <form action={createModal.action} className="space-y-4">
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Pasar <span className="text-rose-400">*</span>
              </label>
              <select
                name="pasarId"
                required
                defaultValue={selectedScope !== 'all' ? selectedScope : ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">-- Pilih Pasar --</option>
                {pasars.map((p) => (
                  <option key={p.id} value={p.id}>{p.namaPasar}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Kode Ruang Dagang <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="kodeRuang"
                required
                placeholder="Contoh: KI-A-01"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Jenis Ruang Dagang
              </label>
              <select
                name="jenis"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="kios">Kios</option>
                <option value="los">Meja</option>
                <option value="lapak">Lapak</option>
                <option value="toko">Toko</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ukuran Ruang Dagang (Panjang x Lebar)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="panjang"
                    placeholder="3"
                    value={panjang}
                    onChange={(e) => setPanjang(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-medium">m</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Panjang (meter)</span>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="lebar"
                    placeholder="4"
                    value={lebar}
                    onChange={(e) => setLebar(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-medium">m</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Lebar (meter)</span>
              </div>
            </div>

            {luasPreviewCreat != null && (
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
                <span>Estimasi Luas Total:</span>
                <span className="font-bold">
                  {formatLuas(panjang, lebar, luasPreviewCreat)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Status Awal
            </label>
            <select
              name="status"
              defaultValue="kosong"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
            >
              <option value="kosong">Kosong (Tersedia untuk disewa)</option>
              <option value="terisi">Terisi</option>
            </select>
          </div>

          <AlertBanner state={createModal.state} />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={createModal.close}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createModal.pending}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {createModal.pending ? 'Menyimpan...' : 'Simpan Ruang Dagang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        key={editModal.key}
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Data Ruang Dagang"
        maxWidth="max-w-xl"
      >
        {editModal.item && (
          <form action={editModal.action} className="space-y-4">
            <input type="hidden" name="id" value={editModal.item.id} />
            <input type="hidden" name="pasarId" value={editModal.item.pasarId} />

            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pasar <span className="text-rose-400">*</span>
                </label>
                <select
                  name="pasarId"
                  required
                  defaultValue={editModal.item.pasarId}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">-- Pilih Pasar --</option>
                  {pasars.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPasar}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Kode Ruang Dagang <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="kodeRuang"
                  required
                  defaultValue={editModal.item.kodeRuang}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Jenis Ruang Dagang
                </label>
                <select
                  name="jenis"
                  required
                  defaultValue={editModal.item.jenis}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="kios">Kios</option>
                  <option value="los">Meja</option>
                  <option value="lapak">Lapak</option>
                  <option value="toko">Toko</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Ukuran Ruang Dagang (Panjang x Lebar)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      name="panjang"
                      placeholder="3"
                      value={editPanjang}
                      onChange={(e) => setEditPanjang(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-500 font-medium">m</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Panjang (meter)</span>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      name="lebar"
                      placeholder="4"
                      value={editLebar}
                      onChange={(e) => setEditLebar(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-500 font-medium">m</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Lebar (meter)</span>
                </div>
              </div>

              {luasPreviewEdit != null && (
                <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
                  <span>Estimasi Luas Total:</span>
                  <span className="font-bold">
                    {formatLuas(editPanjang, editLebar, luasPreviewEdit)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editModal.item.status}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="kosong">Kosong (Tersedia untuk disewa)</option>
                <option value="terisi">Terisi</option>
              </select>
            </div>

            <AlertBanner state={editModal.state} />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={editModal.close}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={editModal.pending}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {editModal.pending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        itemName={deleteModal.item?.kodeRuang}
        onConfirm={deleteModal.action}
        isPending={deleteModal.pending}
        itemId={deleteModal.item?.id}
        state={deleteModal.state}
      />
    </div>
  );
}
