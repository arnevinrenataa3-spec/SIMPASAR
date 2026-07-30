'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCrudModal } from '../../../../lib/useCrudModal.js';
import { formatLuas, hitungLuas } from '../../../../lib/luas.js';
import AlertBanner from '../../../../components/AlertBanner.js';
import Modal from '../../../../components/Modal.js';
import DataTable from '../../../../components/DataTable.js';
import SearchableSelect from '../../../../components/SearchableSelect.js';
import Badge from '../../../../components/Badge.js';
import Button from '../../../../components/Button.js';
import EditRuangDagangModal from '../../../../components/EditRuangDagangModal.js';
import { terbitkanIzinAction, perpanjangIzinAction, cabutIzinAction } from '../../../actions/perizinan.js';
import { updateRuangDagangAction } from '../../../actions/ruang-dagang.js';

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));
}

const spLabel = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' };
const spColor = { sp1: 'amber', sp2: 'orange', sp3: 'rose' };

function getJenisBadge(jenis) {
  const map = { kios: 'indigo', los: 'cyan', lapak: 'emerald', toko: 'amber' };
  return <Badge color={map[jenis] || 'slate'}>{jenis}</Badge>;
}

function getStatusBadge(status) {
  switch (status) {
    case 'terisi':
      return <Badge color="rose" dot>Terisi</Badge>;
    case 'kosong':
      return <Badge color="emerald" dot>Kosong</Badge>;
    case 'non-fisik':
      return <Badge color="slate" dot>Non-fisik</Badge>;
    default:
      return <Badge color="slate">{status}</Badge>;
  }
}

function statusIzinBadge(izin) {
  const expired = izin.statusIzin === 'aktif' && izin.tanggalKedaluwarsa < new Date().toISOString().slice(0, 10);
  const status = expired ? 'kedaluwarsa' : izin.statusIzin;
  const color = status === 'aktif' ? 'emerald' : status === 'diperpanjang' ? 'blue' : 'rose';
  return <Badge color={color}>{status}</Badge>;
}

function statusTeguranBadge(izin) {
  if (!izin.statusTeguran || izin.statusTeguran === 'none') {
    return <Badge color="slate">Tidak Ada</Badge>;
  }
  return <Badge color={spColor[izin.statusTeguran] || 'slate'}>{spLabel[izin.statusTeguran]}</Badge>;
}

export default function RuangDagangDetail({ ruang, izins, pedagangAktif, traders, teguranList, user }) {
  const router = useRouter();
  const [selectedTrader, setSelectedTrader] = useState('new');
  const [perpanjangTarget, setPerpanjangTarget] = useState(null);
  const [perpanjangTanggalTerbit, setPerpanjangTanggalTerbit] = useState('');
  const [perpanjangTanggalKedaluwarsa, setPerpanjangTanggalKedaluwarsa] = useState('');

  const terbitkanModal = useCrudModal({
    action: terbitkanIzinAction,
    onSuccess: () => router.refresh(),
  });
  const perpanjangModal = useCrudModal({
    action: perpanjangIzinAction,
    onSuccess: () => { setPerpanjangTarget(null); router.refresh(); },
  });
  const cabutModal = useCrudModal({
    action: cabutIzinAction,
    onSuccess: () => router.refresh(),
  });
  const editModal = useCrudModal({
    action: updateRuangDagangAction,
    onSuccess: () => router.refresh(),
  });

  const trader = traders.find((item) => item.id === selectedTrader);
  const traderOptions = useMemo(() => [
    { value: 'new', label: 'Pedagang baru' },
    ...traders.map((item) => ({ value: item.id, label: `${item.nik} - ${item.namaLengkap}` })),
  ], [traders]);
  const ruangKosong = ruang.status === 'kosong';
  const izinAktif = izins.find((i) => i.statusIzin === 'aktif');
  const adaNonAktif = izins.some((i) => i.statusIzin !== 'aktif');

  const today = new Date().toISOString().slice(0, 10);
  let isExpiringSoon = false;
  let isExpired = false;
  let daysLeft = null;
  if (izinAktif && izinAktif.tanggalKedaluwarsa) {
    const kadaluwarsa = String(izinAktif.tanggalKedaluwarsa).slice(0, 10);
    daysLeft = Math.ceil((new Date(kadaluwarsa) - new Date(today)) / 86400000);
    isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
    isExpired = daysLeft < 0;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/ruang-dagang')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Ruang Dagang
      </Button>

      {/* Warning Banner */}
      {(isExpiringSoon || isExpired) && (
        <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${isExpired ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            {isExpired
              ? `Izin sudah kadaluwarsa sejak ${Math.abs(daysLeft)} hari yang lalu. Segera perpanjang atau cabut izin.`
              : daysLeft === 0
                ? 'Izin akan kadaluwarsa hari ini! Segera perpanjang.'
                : `Izin akan kadaluwarsa dalam ${daysLeft} hari lagi.`}
          </span>
        </div>
      )}

      {/* Detail Ruang Dagang Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Detail Ruang Dagang</h1>
            <p className="text-xs text-slate-400 mt-1">Informasi lengkap dan kelola perizinan untuk ruang ini.</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(ruang.status)}
            <Button variant="info" size="sm" onClick={() => editModal.open(ruang)}>
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pasar</span>
            <p className="text-sm font-semibold text-slate-100 mt-1">{ruang.namaPasar || '-'}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kode Ruang</span>
            <p className="text-sm font-bold font-mono text-emerald-400 mt-1">{ruang.kodeRuang}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jenis</span>
            <div className="mt-1">{getJenisBadge(ruang.jenis)}</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Panjang</span>
            <p className="text-sm font-mono text-slate-100 mt-1">{ruang.panjang != null ? `${ruang.panjang} m` : '-'}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lebar</span>
            <p className="text-sm font-mono text-slate-100 mt-1">{ruang.lebar != null ? `${ruang.lebar} m` : '-'}</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Luas</span>
            <p className="text-sm font-mono text-slate-100 mt-1">{ruang.luas || '-'}</p>
          </div>
          {pedagangAktif && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 sm:col-span-2 lg:col-span-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pedagang Aktif</span>
              <p className="text-sm font-semibold text-slate-100 mt-1">{pedagangAktif.namaPedagang}</p>
              <p className="text-xs text-slate-400 mt-0.5">{pedagangAktif.jenisDagangan} &bull; Kartu: {pedagangAktif.nomorKartu}</p>
              <p className="text-xs text-slate-400 mt-0.5">NIK: {pedagangAktif.nik}</p>
            </div>
          )}
        </div>
      </div>

      {/* Perizinan Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Perizinan</h2>
            <p className="text-xs text-slate-400 mt-1">
              {izinAktif ? 'Izin aktif untuk ruang dagang ini.' : 'Ruang ini belum memiliki izin aktif.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ruangKosong && (
              <Button
                variant="primary"
                onClick={terbitkanModal.open}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Terbitkan Izin
              </Button>
            )}
            {izinAktif && (
              <>
                <Button
                  variant="info"
                  onClick={() => {
                    setPerpanjangTarget(izinAktif);
                    setPerpanjangTanggalTerbit(new Date().toISOString().slice(0, 10));
                    setPerpanjangTanggalKedaluwarsa('');
                    perpanjangModal.open();
                  }}
                >
                  Perpanjang Izin
                </Button>
                <form action={cabutModal.action} onSubmit={(e) => { if (!confirm('Cabut izin ini? Ruang akan dikosongkan.')) e.preventDefault(); }}>
                  <input type="hidden" name="perizinanId" value={izinAktif.id} />
                  <Button type="submit" variant="danger">
                    Cabut Izin
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Current Active Permit Info */}
        {izinAktif && (
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nomor Kartu</span>
              <p className="text-sm font-mono text-emerald-300 mt-1">{izinAktif.nomorKartu}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pedagang</span>
              <p className="text-sm font-semibold text-slate-100 mt-1">{izinAktif.namaPedagang}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">NIK</span>
              <p className="text-sm font-mono text-slate-100 mt-1">{izinAktif.nik}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jenis Dagangan</span>
              <p className="text-sm text-slate-300 mt-1">{izinAktif.jenisDagangan}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Masa Berlaku</span>
              <p className="text-sm text-slate-300 mt-1">{formatDate(izinAktif.tanggalTerbit)} - {formatDate(izinAktif.tanggalKedaluwarsa)}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status Izin</span>
              <div className="mt-1">{statusIzinBadge(izinAktif)}</div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status Teguran</span>
              <div className="mt-1">{statusTeguranBadge(izinAktif)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Perizinan */}
      {izins.length > 0 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80">
              <h2 className="text-lg font-bold text-slate-100">Riwayat Perizinan</h2>
              <p className="text-xs text-slate-400 mt-0.5">Semua izin yang pernah diterbitkan untuk ruang dagang ini.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="px-4 py-3.5">Nomor Kartu</th>
                    <th className="px-4 py-3.5">Pedagang</th>
                    <th className="px-4 py-3.5">NIK</th>
                    <th className="px-4 py-3.5">Dagangan</th>
                    <th className="px-4 py-3.5">Masa Berlaku</th>
                    <th className="px-4 py-3.5">Status Izin</th>
                    <th className="px-4 py-3.5">Status Teguran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {izins.map((izin) => (
                    <tr key={izin.id} className="hover:bg-slate-800/40 transition duration-150">
                      <td className="px-4 py-3.5 font-mono text-emerald-300">{izin.nomorKartu}</td>
                      <td className="px-4 py-3.5 text-slate-200">{izin.namaPedagang || '-'}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">{izin.nik || '-'}</td>
                      <td className="px-4 py-3.5 text-slate-400">{izin.jenisDagangan}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{formatDate(izin.tanggalTerbit)} - {formatDate(izin.tanggalKedaluwarsa)}</td>
                      <td className="px-4 py-3.5">{statusIzinBadge(izin)}</td>
                      <td className="px-4 py-3.5">{statusTeguranBadge(izin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Teguran */}
      {teguranList.length > 0 && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80">
              <h2 className="text-lg font-bold text-slate-100">Riwayat Surat Peringatan</h2>
              <p className="text-xs text-slate-400 mt-0.5">Surat peringatan yang pernah diterbitkan untuk izin di ruang ini.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="px-4 py-3.5">Nomor Kartu</th>
                    <th className="px-4 py-3.5">Level SP</th>
                    <th className="px-4 py-3.5">Tanggal Terbit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teguranList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition duration-150">
                      <td className="px-4 py-3.5 font-mono text-emerald-300">{t.nomorKartu || '-'}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={spColor[t.status] || 'slate'}>
                          {spLabel[t.status] || t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{formatDate(t.tanggalTerbit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {izins.length === 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6">
          <div className="text-center text-slate-400 py-4">
            <p>Belum ada riwayat perizinan untuk ruang dagang ini.</p>
          </div>
        </div>
      )}

      {/* Terbitkan Izin Modal */}
      <Modal
        key={terbitkanModal.key}
        isOpen={terbitkanModal.isOpen}
        onClose={terbitkanModal.close}
        title="Terbitkan Izin Baru"
        maxWidth="max-w-2xl"
      >
        <form action={terbitkanModal.action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="ruangDagangId" value={ruang.id} />
          <input type="hidden" name="pasarId" value={ruang.pasarId} />
          <AlertBanner state={terbitkanModal.state} />
          <div className="sm:col-span-2 bg-slate-950/50 rounded-xl border border-slate-800 p-3 text-sm">
            <span className="text-xs text-slate-400">Ruang:</span>{' '}
            <span className="font-mono font-bold text-emerald-400">{ruang.kodeRuang}</span>{' '}
            <span className="text-slate-400">— {ruang.namaPasar}</span>
          </div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">
            Pedagang
            <SearchableSelect
              options={traderOptions}
              value={selectedTrader}
              onChange={setSelectedTrader}
              placeholder="Cari pedagang..."
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            NIK
            <input
              name="nik"
              required
              maxLength={16}
              className={`${inputClass} mt-2 font-mono`}
              readOnly={Boolean(trader)}
              key={`nik-${selectedTrader}`}
              defaultValue={trader?.nik ?? ''}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Nama lengkap
            <input
              name="namaLengkap"
              required
              className={`${inputClass} mt-2`}
              readOnly={Boolean(trader)}
              key={`nama-${selectedTrader}`}
              defaultValue={trader?.namaLengkap ?? ''}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Nomor HP
            <input
              name="nomorHp"
              required
              className={`${inputClass} mt-2`}
              readOnly={Boolean(trader)}
              key={`hp-${selectedTrader}`}
              defaultValue={trader?.nomorHp ?? ''}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Jenis dagangan
            <input name="jenisDagangan" required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">
            Alamat
            <textarea
              name="alamat"
              required
              className={`${inputClass} mt-2 min-h-20`}
              readOnly={Boolean(trader)}
              key={`alamat-${selectedTrader}`}
              defaultValue={trader?.alamat ?? ''}
            />
          </label>
          <div className="sm:col-span-2 bg-slate-950/50 rounded-xl border border-slate-800 p-3 text-sm text-slate-400">
            Nomor kartu akan dibuat otomatis oleh sistem sesuai format resmi setelah izin diterbitkan.
          </div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tanggal terbit
            <input type="date" name="tanggalTerbit" required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tanggal kedaluwarsa
            <input type="date" name="tanggalKedaluwarsa" required className={`${inputClass} mt-2`} />
          </label>
          <Button
            type="submit"
            variant="primary"
            pending={terbitkanModal.pending}
            className="sm:col-span-2"
          >
            {terbitkanModal.pending ? 'Menerbitkan...' : 'Terbitkan Izin'}
          </Button>
        </form>
      </Modal>

      {/* Perpanjang Izin Modal */}
      <Modal
        key={perpanjangModal.key}
        isOpen={perpanjangModal.isOpen}
        onClose={perpanjangModal.close}
        title="Perpanjang Izin"
        maxWidth="max-w-md"
      >
        <form action={perpanjangModal.action} className="grid gap-4">
          <AlertBanner state={perpanjangModal.state} />
          {perpanjangTarget && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p className="font-mono text-emerald-400">{perpanjangTarget.nomorKartu}</p>
              <p className="text-slate-400">{perpanjangTarget.namaPedagang} — {ruang.kodeRuang}</p>
            </div>
          )}
          <input type="hidden" name="perizinanId" value={perpanjangTarget?.id ?? ''} />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tanggal terbit baru
            <input
              type="date"
              name="tanggalTerbit"
              required
              className={`${inputClass} mt-2`}
              value={perpanjangTanggalTerbit}
              onChange={(e) => setPerpanjangTanggalTerbit(e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tanggal kedaluwarsa baru
            <input
              type="date"
              name="tanggalKedaluwarsa"
              required
              className={`${inputClass} mt-2`}
              value={perpanjangTanggalKedaluwarsa}
              onChange={(e) => setPerpanjangTanggalKedaluwarsa(e.target.value)}
            />
          </label>
          <Button
            type="submit"
            variant="info"
            pending={perpanjangModal.pending}
          >
            {perpanjangModal.pending ? 'Memperpanjang...' : 'Perpanjang Izin'}
          </Button>
        </form>
      </Modal>

      <AlertBanner state={cabutModal.state} />

      <EditRuangDagangModal
        modal={editModal}
        pasars={[{ id: ruang.pasarId, namaPasar: ruang.namaPasar }]}
        isAdmin={user?.role === 'admin'}
      />
    </div>
  );
}
