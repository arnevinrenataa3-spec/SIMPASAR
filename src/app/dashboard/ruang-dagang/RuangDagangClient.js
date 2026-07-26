'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { useState, useActionState, useMemo } from 'react';
import { createRuangDagangAction, deleteRuangDagangAction } from '../../actions/ruang-dagang.js';

export default function RuangDagangClient({ initialData = [], user }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [panjang, setPanjang] = useState('');
  const [lebar, setLebar] = useState('');

  const [createState, createAction, isCreatePending] = useActionState(createRuangDagangAction, null);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteRuangDagangAction, null);

  // Compute KPI Stats
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

  // Filtered List
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const matchSearch = item.kodeRuang.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchJenis = filterJenis === 'all' || item.jenis === filterJenis;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchJenis && matchStatus;
    });
  }, [initialData, searchTerm, filterJenis, filterStatus]);

  // Helper for Badge Colors
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
            Los
          </span>
        );
      case 'lapak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            Lapak
          </span>
        );
      case 'toko':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
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
    if (status === 'terisi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Terisi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Kosong
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Master Data Ruang Dagang
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola data fisik petak pasar (Kios, Los, Lapak, dan Toko) serta pantau ketersediaannya.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition duration-150 shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Ruang Dagang</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Petak</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">Tipe Kios</span>
          <div className="text-2xl font-bold text-indigo-300 mt-1">{stats.kios}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">Tipe Los</span>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{stats.los}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-purple-400 uppercase tracking-wider">Tipe Lapak</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">{stats.lapak}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">Tipe Toko</span>
          <div className="text-2xl font-bold text-blue-300 mt-1">{stats.toko}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Kosong</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.kosong}</div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Terisi</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{stats.terisi}</div>
        </div>
      </div>

      {/* Global Action Messages / Alerts */}
      {createState?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{createState.message}</span>
          </div>
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

      {/* Filter & Table Container */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4 sm:p-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari kode ruang (misal: A-01)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 transition duration-150"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Jenis */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Jenis:</label>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Semua Jenis</option>
                <option value="kios">Kios</option>
                <option value="los">Los</option>
                <option value="lapak">Lapak</option>
                <option value="toko">Toko</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Semua Status</option>
                <option value="kosong">Kosong</option>
                <option value="terisi">Terisi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Kode Ruang</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Luas Ruang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    {searchTerm || filterJenis !== 'all' || filterStatus !== 'all'
                      ? 'Tidak ada ruang dagang yang sesuai dengan kriteria pencarian.'
                      : 'Belum ada data ruang dagang. Klik tombol "Tambah Ruang Dagang" untuk membuat baru.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-slate-100">
                        {item.kodeRuang}
                      </td>
                      <td className="px-6 py-4">{getJenisBadge(item.jenis)}</td>
                      <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                        {item.luas || '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{formattedDate}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition duration-150 cursor-pointer"
                          title="Hapus Ruang Dagang"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
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

      {/* Modal Form Tambah Ruang Dagang */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">Tambah Ruang Dagang Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              action={async (formData) => {
                await createAction(formData);
                setIsAddModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Kode Ruang Dagang <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="kodeRuang"
                  placeholder="Contoh: A-01, K-12, T-05"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 uppercase font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">Kode petak bersifat unik di sistem.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Jenis Ruang Dagang <span className="text-rose-400">*</span>
                </label>
                <select
                  name="jenis"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="kios">Kios (Bangunan Permanen)</option>
                  <option value="los">Los (Meja / Petak Terbuka)</option>
                  <option value="lapak">Lapak (Petak Harian / Pelataran)</option>
                  <option value="toko">Toko (Bangunan Toko / Ruko)</option>
                </select>
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

                {panjang && lebar && !isNaN(parseFloat(panjang)) && !isNaN(parseFloat(lebar)) && parseFloat(panjang) > 0 && parseFloat(lebar) > 0 && (
                  <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
                    <span>Estimasi Luas Total:</span>
                    <span className="font-bold">
                      {panjang} x {lebar} m = {(parseFloat(panjang) * parseFloat(lebar)).toFixed(2).replace(/\.00$/, '')} m²
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatePending}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isCreatePending ? 'Menyimpan...' : 'Simpan Ruang Dagang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Konfirmasi Hapus</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus ruang dagang dengan kode{' '}
              <strong className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {deletingItem.kodeRuang}
              </strong>
              ?
            </p>

            <form
              action={async (formData) => {
                await deleteAction(formData);
                setDeletingItem(null);
              }}
              className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800"
            >
              <input type="hidden" name="id" value={deletingItem.id} />

              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isDeletePending}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                {isDeletePending ? 'Menghapus...' : 'Ya, Hapus Ruang Dagang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
