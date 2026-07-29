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
import DataTable from '../../../components/DataTable.js';
import { createRuangDagangAction, updateRuangDagangAction, deleteRuangDagangAction } from '../../actions/ruang-dagang.js';

export default function RuangDagangTable({ initialData = [], pasars = [], user, selectedScope = 'all' }) {
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
    const fisik = initialData.filter((item) => item.status !== 'non-fisik');
    const total = fisik.length;
    const kios = fisik.filter((item) => item.jenis === 'kios').length;
    const los = fisik.filter((item) => item.jenis === 'los').length;
    const lapak = fisik.filter((item) => item.jenis === 'lapak').length;
    const toko = fisik.filter((item) => item.jenis === 'toko').length;
    const kosong = fisik.filter((item) => item.status === 'kosong').length;
    const terisi = fisik.filter((item) => item.status === 'terisi').length;
    const nonFisik = initialData.filter((item) => item.status === 'non-fisik').length;
    return { total, kios, los, lapak, toko, kosong, terisi, nonFisik };
  }, [initialData]);

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
      case 'non-fisik':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Non-fisik
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
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-100' },
          { label: 'Kios', value: stats.kios, color: 'text-indigo-400' },
          { label: 'Meja', value: stats.los, color: 'text-cyan-400' },
          { label: 'Lapak', value: stats.lapak, color: 'text-emerald-400' },
          { label: 'Toko', value: stats.toko, color: 'text-amber-400' },
          { label: 'Kosong', value: stats.kosong, color: 'text-emerald-400' },
          { label: 'Terisi', value: stats.terisi, color: 'text-rose-400' },
          { label: 'Non-fisik', value: stats.nonFisik, color: 'text-slate-400' },
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

      <DataTable
        cellPadding="px-4 py-3.5"
        syncSearchParams
        searchPlaceholder="Cari kode ruang atau nama pedagang..."
        columns={[
          {
            header: 'Pasar',
            accessor: 'namaPasar',
            render: (item) => <span className="font-medium text-slate-100">{item.namaPasar || '-'}</span>,
          },
          {
            header: 'Kode Ruang',
            accessor: 'kodeRuang',
            tdClassName: 'font-bold font-mono text-emerald-400',
          },
          {
            header: 'Jenis',
            accessor: 'jenis',
            render: (item) => getJenisBadge(item.jenis),
          },
          {
            header: 'Luas (P x L)',
            accessor: 'luas',
            render: (item) =>
              item.luas ? (
                <span className="font-mono text-xs text-slate-300">{item.luas}</span>
              ) : (
                <span className="text-slate-500 font-mono text-xs">-</span>
              ),
          },
          {
            header: 'Status',
            accessor: 'status',
            render: (item) => getStatusBadge(item.status),
          },
          {
            header: 'Pedagang',
            accessor: 'namaPedagang',
            render: (item) =>
              item.namaPedagang ? (
                <span className="text-xs text-slate-300 max-w-[160px] truncate block" title={item.namaPedagang}>{item.namaPedagang}</span>
              ) : (
                <span className="text-xs text-slate-500">&mdash;</span>
              ),
          },
          {
            header: 'Aksi',
            thClassName: 'text-right',
            tdClassName: 'text-right',
            render: (item) => (
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
            ),
          },
        ]}
        filters={[
          {
            accessor: 'jenis',
            placeholder: 'Semua Jenis',
            options: [
              { label: 'Semua Jenis', value: '' },
              { label: 'Kios', value: 'kios' },
              { label: 'Meja', value: 'los' },
              { label: 'Lapak', value: 'lapak' },
              { label: 'Toko', value: 'toko' },
            ],
          },
          {
            accessor: 'status',
            placeholder: 'Semua Status',
            options: [
              { label: 'Semua Status', value: '' },
              { label: 'Kosong', value: 'kosong' },
              { label: 'Terisi', value: 'terisi' },
              { label: 'Non-fisik', value: 'non-fisik' },
            ],
          },
        ]}
        data={initialData}
        emptyMessage="Belum ada data ruang dagang."
        filterEmptyMessage="Tidak ada ruang dagang yang cocok dengan filter."
      />

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
                Status Ruang
              </label>
              <select
                name="status"
                required
                defaultValue={editModal.item.status}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="kosong">Kosong</option>
                <option value="non-fisik">Non-fisik</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Status &quot;Terisi&quot; dikelola otomatis melalui perizinan.</p>
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
