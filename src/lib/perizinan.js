/**
 * @description Domain seam for permit issuance and public permit status.
 * @author Muhamad Hazmi Alfarizqi
 */

import { temukanAtauBuatPedagang } from './pedagang.js';

function asDateOnly(value) {
  if (value instanceof Date) return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function statusTeguran(tanggalKedaluwarsa, sekarang = new Date()) {
  const expiry = asDateOnly(tanggalKedaluwarsa);
  const now = asDateOnly(sekarang);
  if (!expiry || !now || now <= expiry) return null;

  const overdueDays = Math.floor((now - expiry) / 86400000);
  if (overdueDays >= 42) return 'sp3';
  if (overdueDays >= 35) return 'sp2';
  if (overdueDays >= 28) return 'sp1';
  return null;
}

export async function terbitkanIzin(input, dbAdapter) {
  if (!dbAdapter?.transaction) throw new Error('Adapter Perizinan tidak lengkap.');
  const start = asDateOnly(input.tanggalTerbit);
  const expiry = asDateOnly(input.tanggalKedaluwarsa);
  if (!start || !expiry || expiry <= start) return { ok: false, reason: 'tanggal_tidak_valid' };

  return dbAdapter.transaction(async (tx) => {
    const ruang = await tx.findRuangForUpdate(input.ruangDagangId, input.pasarId);
    if (!ruang || ruang.status !== 'kosong') return { ok: false, reason: 'ruang_tidak_tersedia' };

    const marked = await tx.markRuangTerisi(ruang.id, input.pasarId);
    if (!marked) return { ok: false, reason: 'ruang_tidak_tersedia' };

    const pedagang = await temukanAtauBuatPedagang(input.pedagang.nik, input.pedagang, tx);
    const perizinan = await tx.insertPerizinan({
      ruangDagangId: ruang.id,
      pedagangId: pedagang.id,
      nomorKartu: String(input.nomorKartu).trim(),
      jenisDagangan: String(input.jenisDagangan).trim(),
      tanggalTerbit: String(input.tanggalTerbit).slice(0, 10),
      tanggalKedaluwarsa: String(input.tanggalKedaluwarsa).slice(0, 10),
      statusIzin: 'aktif',
    });

    return { ok: true, perizinan };
  });
}

export async function statusPublik(nomorKartu, dbAdapter, sekarang = new Date()) {
  const normalized = String(nomorKartu ?? '').trim();
  if (!normalized || !dbAdapter?.findPerizinanByNomorKartu) return null;
  const record = await dbAdapter.findPerizinanByNomorKartu(normalized);
  if (!record) return null;

  const status = record.statusIzin === 'dicabut'
    ? 'dicabut'
    : record.statusIzin === 'diperpanjang'
      ? 'diperpanjang'
      : asDateOnly(record.tanggalKedaluwarsa) < asDateOnly(sekarang) ? 'kedaluwarsa' : 'aktif';
  const warning = status === 'kedaluwarsa' ? statusTeguran(record.tanggalKedaluwarsa, sekarang) : null;

  return {
    nomorKartu: record.nomorKartu,
    nomorRuang: record.nomorRuang ?? record.kodeRuang,
    namaPasar: record.namaPasar,
    tanggalTerbit: String(record.tanggalTerbit).slice(0, 10),
    tanggalKedaluwarsa: String(record.tanggalKedaluwarsa).slice(0, 10),
    status,
    ...(warning ? { peringatan: warning } : {}),
  };
}
