'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { useState } from 'react';
import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import Modal from '../../../components/Modal.js';
import DataTable from '../../../components/DataTable.js';
import { terbitkanIzinAction, perpanjangIzinAction, cabutIzinAction } from '../../actions/perizinan.js';

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function statusBadge(permit) {
  const expired = permit.statusIzin === 'aktif' && permit.tanggalKedaluwarsa < new Date().toISOString().slice(0, 10);
  const status = expired ? 'kedaluwarsa' : permit.statusIzin;
  const cls = status === 'aktif'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : status === 'diperpanjang'
      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${cls}`}>{status}</span>;
}

export default function PerizinanPanel({ permits, spaces, traders }) {
  const [selectedTrader, setSelectedTrader] = useState('new');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [perpanjangTarget, setPerpanjangTarget] = useState(null);
  const [perpanjangTanggalTerbit, setPerpanjangTanggalTerbit] = useState('');
  const [perpanjangTanggalKedaluwarsa, setPerpanjangTanggalKedaluwarsa] = useState('');

  const terbitkanModal = useCrudModal({ action: terbitkanIzinAction });
  const perpanjangModal = useCrudModal({
    action: perpanjangIzinAction,
    onSuccess: () => setPerpanjangTarget(null),
  });
  const cabutModal = useCrudModal({ action: cabutIzinAction });

  const trader = traders.find((item) => item.id === selectedTrader);
  const space = spaces.find((item) => item.id === selectedSpace);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Operasional</p><h1 className="mt-1 text-2xl font-bold">Perizinan Ruang Dagang</h1><p className="mt-1 text-sm text-slate-400">Terbitkan izin, perpanjang, cabut, dan pantau masa berlaku kartu pasar.</p></div>
        <button onClick={terbitkanModal.open} disabled={!spaces.length} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Terbitkan Izin</button>
      </section>
      {!spaces.length && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Tidak ada Ruang Dagang kosong dalam scope aktif.</div>}

      <AlertBanner state={perpanjangModal.state} />
      <AlertBanner state={cabutModal.state} />

      <DataTable
        cellPadding="px-5 py-4"
        syncSearchParams
        searchPlaceholder="Cari nomor kartu, nama pedagang, atau ruang..."
        filters={[
          {
            accessor: 'statusIzin',
            placeholder: 'Semua Status',
            options: [
              { label: 'Semua Status', value: '' },
              { label: 'Aktif', value: 'aktif' },
              { label: 'Kedaluwarsa', value: 'kedaluwarsa' },
              { label: 'Dicabut', value: 'dicabut' },
              { label: 'Diperpanjang', value: 'diperpanjang' },
            ],
          },
        ]}
        columns={[
          {
            header: 'Nomor Kartu',
            accessor: 'nomorKartu',
            tdClassName: 'font-mono text-emerald-300',
          },
          {
            header: 'Ruang / Pasar',
            accessor: 'kodeRuang',
            render: (permit) => (
              <div>
                <strong className="text-slate-100">{permit.kodeRuang}</strong>
                <span className="block text-xs text-slate-500">{permit.namaPasar}</span>
              </div>
            ),
          },
          {
            header: 'Pedagang',
            accessor: 'namaPedagang',
            tdClassName: 'text-slate-200',
          },
          {
            header: 'Dagangan',
            accessor: 'jenisDagangan',
            tdClassName: 'text-slate-400',
          },
          {
            header: 'Masa Berlaku',
            render: (permit) => (
              <span className="text-xs text-slate-400">{formatDate(permit.tanggalTerbit)} - {formatDate(permit.tanggalKedaluwarsa)}</span>
            ),
          },
          {
            header: 'Status',
            render: (permit) => statusBadge(permit),
          },
          {
            header: 'Aksi',
            thClassName: 'text-right',
            tdClassName: 'text-right',
            render: (permit) => {
              const canModify = permit.statusIzin === 'aktif';
              if (!canModify) return <span className="text-xs text-slate-500">—</span>;
              return (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setPerpanjangTarget(permit);
                      setPerpanjangTanggalTerbit(new Date().toISOString().slice(0, 10));
                      setPerpanjangTanggalKedaluwarsa('');
                      perpanjangModal.open();
                    }}
                    className="rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition"
                  >
                    Perpanjang
                  </button>
                  <form action={cabutModal.action} onSubmit={(e) => { if (!confirm('Cabut izin ini? Ruang akan dikosongkan.')) e.preventDefault(); }}>
                    <input type="hidden" name="perizinanId" value={permit.id} />
                    <button type="submit" className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition">Cabut</button>
                  </form>
                </div>
              );
            },
          },
        ]}
        data={permits}
        emptyMessage="Belum ada Perizinan dalam scope aktif."
      />

      <Modal key={terbitkanModal.key} isOpen={terbitkanModal.isOpen} onClose={terbitkanModal.close} title="Penerbitan Izin Baru" maxWidth="max-w-2xl">
        <form action={terbitkanModal.action} className="grid gap-4 sm:grid-cols-2">
          <AlertBanner state={terbitkanModal.state} />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Ruang Dagang
            <select name="ruangDagangId" required value={selectedSpace} onChange={(event) => setSelectedSpace(event.target.value)} className={`${inputClass} mt-2`}><option value="">Pilih ruang kosong</option>{spaces.map((item) => <option key={item.id} value={item.id}>{item.kodeRuang} - {item.namaPasar}</option>)}</select>
            {space && <input type="hidden" name="pasarId" value={space.pasarId} />}
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Pedagang
            <select value={selectedTrader} onChange={(event) => setSelectedTrader(event.target.value)} className={`${inputClass} mt-2`}><option value="new">Pedagang baru</option>{traders.map((item) => <option key={item.id} value={item.id}>{item.nik} - {item.namaLengkap}</option>)}</select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">NIK<input name="nik" required maxLength={16} className={`${inputClass} mt-2 font-mono`} readOnly={Boolean(trader)} key={`nik-${selectedTrader}`} defaultValue={trader?.nik ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nama lengkap<input name="namaLengkap" required className={`${inputClass} mt-2`} readOnly={Boolean(trader)} key={`nama-${selectedTrader}`} defaultValue={trader?.namaLengkap ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor HP<input name="nomorHp" required className={`${inputClass} mt-2`} readOnly={Boolean(trader)} key={`hp-${selectedTrader}`} defaultValue={trader?.nomorHp ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jenis dagangan<input name="jenisDagangan" required className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Alamat<textarea name="alamat" required className={`${inputClass} mt-2 min-h-20`} readOnly={Boolean(trader)} key={`alamat-${selectedTrader}`} defaultValue={trader?.alamat ?? ''} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">Nomor kartu<input name="nomorKartu" required className={`${inputClass} mt-2 font-mono`} placeholder="SPTB-2026-001" /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal terbit<input type="date" name="tanggalTerbit" required className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal kedaluwarsa<input type="date" name="tanggalKedaluwarsa" required className={`${inputClass} mt-2`} /></label>
          <button disabled={terbitkanModal.pending} className="rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-950 disabled:opacity-50 sm:col-span-2">{terbitkanModal.pending ? 'Menerbitkan...' : 'Terbitkan Izin'}</button>
        </form>
      </Modal>

      <Modal key={perpanjangModal.key} isOpen={perpanjangModal.isOpen} onClose={perpanjangModal.close} title="Perpanjangan Izin" maxWidth="max-w-md">
        <form action={perpanjangModal.action} className="grid gap-4">
          <AlertBanner state={perpanjangModal.state} />
          {perpanjangTarget && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p className="font-mono text-emerald-400">{perpanjangTarget.nomorKartu}</p>
              <p className="text-slate-400">{perpanjangTarget.namaPedagang} — {perpanjangTarget.kodeRuang}</p>
            </div>
          )}
          <input type="hidden" name="perizinanId" value={perpanjangTarget?.id ?? ''} />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal terbit baru
            <input type="date" name="tanggalTerbit" required className={`${inputClass} mt-2`} value={perpanjangTanggalTerbit} onChange={(e) => setPerpanjangTanggalTerbit(e.target.value)} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal kedaluwarsa baru
            <input type="date" name="tanggalKedaluwarsa" required className={`${inputClass} mt-2`} value={perpanjangTanggalKedaluwarsa} onChange={(e) => setPerpanjangTanggalKedaluwarsa(e.target.value)} />
          </label>
          <button disabled={perpanjangModal.pending} className="rounded-xl bg-blue-500 py-3 text-sm font-bold text-white disabled:opacity-50">{perpanjangModal.pending ? 'Memperpanjang...' : 'Perpanjang Izin'}</button>
        </form>
      </Modal>
    </div>
  );
}
