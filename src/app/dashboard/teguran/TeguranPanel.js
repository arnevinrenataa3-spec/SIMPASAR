'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DataTable from '../../../components/DataTable.js';
import { terbitkanTeguranAction } from '../../actions/perizinan.js';

const spLabel = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' };
const spBadgeClass = {
  sp1: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  sp2: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  sp3: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function TeguranPanel({ teguranList }) {
  const modal = useCrudModal({ action: terbitkanTeguranAction });

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Peneguran</p>
          <h1 className="mt-1 text-2xl font-bold">Surat Peringatan (SP)</h1>
          <p className="mt-1 text-sm text-slate-400">Pantau izin kedaluwarsa dan terbitkan surat peringatan berjenjang.</p>
        </div>
      </section>

      {!teguranList.length && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Tidak ada izin yang memerlukan Surat Peringatan dalam scope aktif.
        </div>
      )}

      {teguranList.length > 0 && (
        <DataTable
          cellPadding="px-5 py-4"
          columns={[
            {
              header: 'Nomor Kartu',
              accessor: 'nomorKartu',
              tdClassName: 'font-mono text-emerald-300',
            },
            {
              header: 'Ruang / Pasar',
              accessor: 'kodeRuang',
              render: (item) => (
                <div>
                  <strong className="text-slate-100">{item.kodeRuang}</strong>
                  <span className="block text-xs text-slate-500">{item.namaPasar}</span>
                </div>
              ),
            },
            {
              header: 'Pedagang',
              accessor: 'namaPedagang',
              tdClassName: 'text-slate-200',
            },
            {
              header: 'Kedaluwarsa',
              accessor: 'tanggalKedaluwarsa',
              render: (item) => <span className="text-xs text-rose-300">{formatDate(item.tanggalKedaluwarsa)}</span>,
            },
            {
              header: 'Status SP',
              accessor: 'statusTeguran',
              render: (item) => (
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${item.statusTeguran !== 'none' && spBadgeClass[item.statusTeguran] ? spBadgeClass[item.statusTeguran] : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
                  {item.statusTeguran !== 'none' ? spLabel[item.statusTeguran] : 'Belum SP'}
                </span>
              ),
            },
            {
              header: 'Aksi',
              thClassName: 'text-right',
              tdClassName: 'text-right',
              render: (item) => {
                const needsSP = item.computedSP && item.statusTeguran !== item.computedSP;
                return (
                  <form action={modal.action}>
                    <input type="hidden" name="perizinanId" value={item.id} />
                    <button
                      type="submit"
                      disabled={!needsSP}
                      className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {needsSP ? `Terbitkan ${spLabel[item.computedSP]}` : 'Sudah Diterbitkan'}
                    </button>
                  </form>
                );
              },
            },
          ]}
          data={teguranList}
          emptyMessage="Tidak ada izin yang memerlukan Surat Peringatan."
        />
      )}

      <AlertBanner state={modal.state} />
    </div>
  );
}
