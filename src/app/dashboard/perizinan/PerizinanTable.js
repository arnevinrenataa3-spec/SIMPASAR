'use client';
/**
 * @description Daftar & histori seluruh izin (read-only) dengan shortcut ke Ruang
 * Dagang dan Pedagang terkait — pandangan "murni perizinan" tanpa perlu membuka
 * Ruang Dagang satu per satu.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import DataTable from '../../../components/DataTable.js';
import Badge from '../../../components/Badge.js';

const spLabel = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' };
const spColor = { sp1: 'amber', sp2: 'orange', sp3: 'rose' };

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));
}

function statusIzinBadge(permit) {
  const status = permit.isExpired ? 'kedaluwarsa' : permit.statusIzin;
  const color = status === 'aktif' ? 'emerald' : status === 'diperpanjang' ? 'blue' : 'rose';
  return <Badge color={color}>{status}</Badge>;
}

function statusTeguranBadge(permit) {
  if (!permit.statusTeguran || permit.statusTeguran === 'none') {
    return <Badge color="slate">Tidak Ada</Badge>;
  }
  return <Badge color={spColor[permit.statusTeguran] || 'slate'}>{spLabel[permit.statusTeguran]}</Badge>;
}

export default function PerizinanTable({ permits }) {
  const stats = useMemo(() => ({
    expiringSoon: permits.filter((p) => p.isExpiringSoon).length,
    expired: permits.filter((p) => p.isExpired).length,
  }), [permits]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Operasional</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Perizinan</h1>
          <p className="mt-1 text-sm text-slate-400">Daftar dan histori seluruh izin dalam scope aktif. Klik Ruang atau Pedagang untuk berpindah langsung ke datanya.</p>
        </div>
      </section>

      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            {stats.expiringSoon > 0 && <><strong>{stats.expiringSoon} izin</strong> akan kadaluwarsa dalam ≤ 7 hari.</>}
            {stats.expired > 0 && <> <strong>{stats.expired} izin</strong> sudah kadaluwarsa.</>}
          </span>
        </div>
      )}

      <DataTable
        cellPadding="px-5 py-4"
        syncSearchParams
        searchPlaceholder="Cari nomor kartu, kode ruang, pasar, atau nama pedagang..."
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
            header: 'Ruang Dagang',
            accessor: 'kodeRuang',
            render: (permit) => (
              <Link
                href={`/dashboard/ruang-dagang/${permit.ruangDagangId}`}
                className="block hover:text-emerald-400 transition"
                title={`Lihat detail ruang dagang: ${permit.kodeRuang}`}
              >
                <strong className="text-slate-100 hover:text-emerald-400 transition">{permit.kodeRuang}</strong>
                <span className="block text-xs text-slate-500">{permit.namaPasar}</span>
              </Link>
            ),
          },
          {
            header: 'Pedagang',
            accessor: 'namaPedagang',
            render: (permit) => (
              <Link
                href={`/dashboard/pedagang?pedagangId=${permit.pedagangId}`}
                className="text-slate-200 hover:text-emerald-400 hover:underline transition"
                title={`Lihat data pedagang: ${permit.namaPedagang}`}
              >
                {permit.namaPedagang}
              </Link>
            ),
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
            header: 'Status Izin',
            accessor: 'statusIzin',
            render: (permit) => statusIzinBadge(permit),
          },
          {
            header: 'Status Teguran',
            accessor: 'statusTeguran',
            render: (permit) => statusTeguranBadge(permit),
          },
        ]}
        data={permits}
        emptyMessage="Belum ada Perizinan dalam scope aktif."
        filterEmptyMessage="Tidak ada Perizinan yang cocok dengan filter."
      />
    </div>
  );
}
