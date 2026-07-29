'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
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
        <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nomor Kartu</th>
                  <th className="px-5 py-4">Ruang / Pasar</th>
                  <th className="px-5 py-4">Pedagang</th>
                  <th className="px-5 py-4">Kedaluwarsa</th>
                  <th className="px-5 py-4">Status SP</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {teguranList.map((item) => {
                  const needsSP = item.computedSP && item.statusTeguran !== item.computedSP;
                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-4 font-mono text-emerald-300">{item.nomorKartu}</td>
                      <td className="px-5 py-4">
                        <strong className="text-slate-100">{item.kodeRuang}</strong>
                        <span className="block text-xs text-slate-500">{item.namaPasar}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-200">{item.namaPedagang}</td>
                      <td className="px-5 py-4 text-xs text-rose-300">{formatDate(item.tanggalKedaluwarsa)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${item.statusTeguran !== 'none' && spBadgeClass[item.statusTeguran] ? spBadgeClass[item.statusTeguran] : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
                          {item.statusTeguran !== 'none' ? spLabel[item.statusTeguran] : 'Belum SP'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AlertBanner state={modal.state} />
    </div>
  );
}
