'use client';
/**
 * @description Form modal bersama untuk mengubah data dan ukuran ruang dagang.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Aditya Syahestiano
 */
import { useState } from 'react';
import { hitungLuas, formatLuas } from '../lib/luas.js';
import Modal from './Modal.js';
import AlertBanner from './AlertBanner.js';
import Button from './Button.js';

function EditRuangDagangForm({ item, pasars, isAdmin, action, pending, state, onCancel }) {
  // Input ukuran dibuat controlled agar luas dapat dihitung ulang saat pengguna mengetik.
  const [editPanjang, setEditPanjang] = useState(item.panjang != null ? String(item.panjang) : '');
  const [editLebar, setEditLebar] = useState(item.lebar != null ? String(item.lebar) : '');
  const luasPreviewEdit = hitungLuas(editPanjang, editLebar);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="pasarId" value={item.pasarId} />

      {/* Pemilihan pasar hanya relevan bagi admin yang memiliki lebih dari satu pilihan. */}
      {isAdmin && pasars.length > 1 && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Pasar <span className="text-rose-400">*</span>
          </label>
          <select
            name="pasarId"
            required
            defaultValue={item.pasarId}
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
            defaultValue={item.kodeRuang}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/50 uppercase font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Jenis Ruang Dagang
          </label>
          <select
            name="jenis"
            required
            defaultValue={item.jenis}
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
          defaultValue={item.status}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/50"
        >
          <option value="kosong">Kosong</option>
          <option value="non-fisik">Non-fisik</option>
        </select>
        <p className="text-[10px] text-slate-400 mt-1">Status &quot;Terisi&quot; dikelola otomatis melalui perizinan.</p>
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
                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
              />
              <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">m</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Panjang (meter)</span>
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
                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
              />
              <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">m</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Lebar (meter)</span>
          </div>
        </div>

        {luasPreviewEdit != null && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
            <span>Estimasi Luas Total:</span>
            <span className="font-bold">{formatLuas(editPanjang, editLebar, luasPreviewEdit)}</span>
          </div>
        )}
      </div>

      <AlertBanner state={state} />
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" size="sm" pending={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}

export default function EditRuangDagangModal({ modal, pasars = [], isAdmin }) {
  return (
    // key baru mereset state form setiap kali hook CRUD membuka sesi modal baru.
    <Modal key={modal.key} isOpen={modal.isOpen} onClose={modal.close} title="Edit Data Ruang Dagang" maxWidth="max-w-xl">
      {modal.item && (
        <EditRuangDagangForm
          item={modal.item}
          pasars={pasars}
          isAdmin={isAdmin}
          action={modal.action}
          pending={modal.pending}
          state={modal.state}
          onCancel={modal.close}
        />
      )}
    </Modal>
  );
}
