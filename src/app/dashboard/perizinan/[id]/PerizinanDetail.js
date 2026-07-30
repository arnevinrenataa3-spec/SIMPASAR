'use client';
/**
 * @description Tampilan Detail Izin (read-only) — info lengkap satu izin,
 * shortcut ke Ruang Dagang & Pedagang, serta riwayat perpanjangan sebelumnya.
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '../../../../components/DataTable.js';
import Badge from '../../../../components/Badge.js';
import Button from '../../../../components/Button.js';

const spLabel = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' };
const spColor = { sp1: 'amber', sp2: 'orange', sp3: 'rose' };
const jenisIzinLabel = { baru: 'Izin Baru', perpanjangan: 'Perpanjangan' };

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function statusIzinBadge(status, isExpired) {
  const resolved = isExpired ? 'kedaluwarsa' : status;
  const color = resolved === 'aktif' ? 'emerald' : resolved === 'dicabut' ? 'rose' : 'amber';
  return <Badge color={color}>{resolved}</Badge>;
}

function statusTeguranBadge(statusTeguran) {
  if (!statusTeguran || statusTeguran === 'none') {
    return <Badge color="slate">Tidak Ada</Badge>;
  }
  return <Badge color={spColor[statusTeguran] || 'slate'}>{spLabel[statusTeguran]}</Badge>;
}

export default function PerizinanDetail({ permit, history, teguranList }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/perizinan')}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Perizinan
      </Button>

      {(permit.isExpiringSoon || permit.isExpired) && (
        <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${permit.isExpired ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            {permit.isExpired
              ? `Izin sudah kadaluwarsa sejak ${Math.abs(permit.daysLeft)} hari yang lalu.`
              : permit.daysLeft === 0
                ? 'Izin akan kadaluwarsa hari ini!'
                : `Izin akan kadaluwarsa dalam ${permit.daysLeft} hari lagi.`}
          </span>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Detail Izin</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">{permit.nomorKartu}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={permit.jenisIzin === 'perpanjangan' ? 'blue' : 'indigo'}>{jenisIzinLabel[permit.jenisIzin]}</Badge>
            {statusIzinBadge(permit.statusIzin, permit.isExpired)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ruang Dagang</span>
            <Link
              href={`/dashboard/ruang-dagang/${permit.ruangDagangId}`}
              className="block text-sm font-bold font-mono text-emerald-400 mt-1 hover:underline"
            >
              {permit.kodeRuang}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">{permit.namaPasar}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pedagang</span>
            <Link
              href={`/dashboard/pedagang?pedagangId=${permit.pedagangId}`}
              className="block text-sm font-semibold text-slate-100 mt-1 hover:text-emerald-400 hover:underline"
            >
              {permit.namaPedagang}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">NIK: {permit.nik}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jenis Dagangan</span>
            <p className="text-sm text-slate-100 mt-1">{permit.jenisDagangan}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Masa Berlaku</span>
            <p className="text-sm text-slate-100 mt-1">{formatDate(permit.tanggalTerbit)} - {formatDate(permit.tanggalKedaluwarsa)}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status Teguran</span>
            <div className="mt-1">{statusTeguranBadge(permit.statusTeguran)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Riwayat Perpanjangan Sebelumnya</h2>
          <p className="text-xs text-slate-400 mt-0.5">Izin-izin sebelumnya dalam rantai perpanjangan yang berujung pada izin ini.</p>
        </div>
        <DataTable
          cellPadding="px-4 py-3.5"
          keyAccessor="id"
          columns={[
            { header: 'Nomor Kartu', accessor: 'nomorKartu', tdClassName: 'font-mono text-emerald-300' },
            {
              header: 'Masa Berlaku',
              render: (item) => <span className="text-xs text-slate-400">{formatDate(item.tanggalTerbit)} - {formatDate(item.tanggalKedaluwarsa)}</span>,
            },
            {
              header: 'Tanggal Diperpanjang',
              accessor: 'updatedAt',
              render: (item) => <span className="text-xs text-slate-400">{formatDateTime(item.updatedAt)}</span>,
            },
          ]}
          data={history}
          emptyMessage={permit.jenisIzin === 'perpanjangan'
            ? 'Riwayat perpanjangan sebelumnya tidak ditemukan.'
            : 'Izin ini adalah penerbitan pertama, belum pernah diperpanjang.'}
        />
      </div>

      {teguranList.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Riwayat Surat Peringatan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Surat peringatan yang pernah diterbitkan untuk izin ini.</p>
          </div>
          <DataTable
            cellPadding="px-4 py-3.5"
            keyAccessor="id"
            columns={[
              { header: 'Level SP', accessor: 'status', render: (t) => <Badge color={spColor[t.status] || 'slate'}>{spLabel[t.status] || t.status}</Badge> },
              {
                header: 'Tanggal Terbit',
                accessor: 'tanggalTerbit',
                render: (t) => <span className="text-xs text-slate-400">{formatDate(t.tanggalTerbit)}</span>,
              },
            ]}
            data={teguranList}
            emptyMessage="Belum ada surat peringatan."
          />
        </div>
      )}
    </div>
  );
}
