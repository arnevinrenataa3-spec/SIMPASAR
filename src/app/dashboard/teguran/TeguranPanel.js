'use client';
/**
 * @description Panel interaktif untuk memfilter dan menerbitkan Surat Peringatan.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Aditya Syahestiano
 */
import { useCrudModal } from '../../../lib/useCrudModal.js';
import AlertBanner from '../../../components/AlertBanner.js';
import DataTable from '../../../components/DataTable.js';
import Badge from '../../../components/Badge.js';
import Button from '../../../components/Button.js';
import { terbitkanTeguranAction } from '../../actions/perizinan.js';

const spLabel = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' };
const spColor = { sp1: 'amber', sp2: 'orange', sp3: 'rose' };

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function TeguranPanel({ teguranList }) {
  // Hook CRUD menyimpan hasil Server Action agar pesan sukses atau error dapat ditampilkan.
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
          searchPlaceholder="Cari nomor kartu..."
          filters={[
            {
              accessor: 'statusTeguran',
              placeholder: 'Semua Status',
              options: [
                { label: 'Semua Status', value: '' },
                { label: 'Belum SP', value: 'none' },
                { label: spLabel.sp1, value: 'sp1' },
                { label: spLabel.sp2, value: 'sp2' },
                { label: spLabel.sp3, value: 'sp3' },
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
              render: (item) => (
                <div>
                  <strong className="text-slate-100">{item.kodeRuang}</strong>
                  <span className="block text-xs text-slate-400">{item.namaPasar}</span>
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
                <Badge color={item.statusTeguran !== 'none' ? spColor[item.statusTeguran] : 'slate'}>
                  {item.statusTeguran !== 'none' ? spLabel[item.statusTeguran] : 'Belum SP'}
                </Badge>
              ),
            },
            {
              header: 'Aksi',
              thClassName: 'text-right',
              tdClassName: 'text-right',
              render: (item) => {
                // Tombol aktif hanya jika jenjang yang seharusnya berbeda dari SP terakhir.
                const needsSP = item.computedSP && item.statusTeguran !== item.computedSP;
                return (
                  <form action={modal.action}>
                    <input type="hidden" name="perizinanId" value={item.id} />
                    <Button type="submit" variant="warning" size="sm" disabled={!needsSP}>
                      {needsSP ? `Terbitkan ${spLabel[item.computedSP]}` : item.computedSP ? 'Sudah Diterbitkan' : 'Belum SP'}
                    </Button>
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
