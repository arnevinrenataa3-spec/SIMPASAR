/**
 * @description Domain seam for permit issuance and public permit status.
 * @author Muhamad Hazmi Alfarizqi
 */

import crypto from 'crypto';
import { temukanAtauBuatPedagang } from './pedagang.js';

function asDateOnly(value) {
  if (value instanceof Date) return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function buildNomorKartu({ nomorUrut, nomorPasar, kodeRuang, jenis, tanggal }) {
  const date = asDateOnly(tanggal);
  const seq = String(nomorUrut).padStart(5, '0');
  const romanBulan = ROMAN_MONTHS[date.getUTCMonth()];
  const tahun = date.getUTCFullYear();
  return `503/${seq}/${nomorPasar}/${kodeRuang}/${jenis}/${romanBulan}/${tahun}`;
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
      nomorKartu: crypto.randomUUID(),
      jenisDagangan: String(input.jenisDagangan).trim(),
      tanggalTerbit: String(input.tanggalTerbit).slice(0, 10),
      tanggalKedaluwarsa: String(input.tanggalKedaluwarsa).slice(0, 10),
      statusIzin: 'aktif',
    });

    const nomorKartu = buildNomorKartu({
      nomorUrut: perizinan.nomorUrut,
      nomorPasar: ruang.nomorPasar,
      kodeRuang: ruang.kodeRuang,
      jenis: 'IB',
      tanggal: input.tanggalTerbit,
    });
    await tx.updateNomorKartu(perizinan.id, nomorKartu);

    return { ok: true, perizinan: { ...perizinan, nomorKartu } };
  });
}

export async function terbitkanTeguran(perizinanId, userId, dbAdapter, sekarang = new Date()) {
  if (!dbAdapter?.transaction) throw new Error('Adapter Perizinan tidak lengkap.');

  const now = asDateOnly(sekarang);
  if (!now) return { ok: false, reason: 'tanggal_tidak_valid' };

  return dbAdapter.transaction(async (tx) => {
    const izin = await tx.findPerizinanById(perizinanId);
    if (!izin || izin.statusIzin === 'dicabut' || izin.statusIzin === 'diperpanjang') {
      return { ok: false, reason: 'izin_tidak_aktif' };
    }

    const level = statusTeguran(izin.tanggalKedaluwarsa, now);
    if (!level) return { ok: false, reason: 'belum_waktunya' };

    if (izin.statusTeguran === level) return { ok: false, reason: 'sudah_diterbitkan' };

    await tx.insertTeguran({
      perizinanId,
      status: level,
      tanggalTerbit: now.toISOString().slice(0, 10),
      userId,
    });

    await tx.updatePerizinanTeguran(perizinanId, level, now.toISOString().slice(0, 10));

    return { ok: true, level };
  });
}

export async function perpanjangIzin(perizinanId, { tanggalTerbit, tanggalKedaluwarsa }, dbAdapter) {
  if (!dbAdapter?.transaction) throw new Error('Adapter Perizinan tidak lengkap.');
  const start = asDateOnly(tanggalTerbit);
  const expiry = asDateOnly(tanggalKedaluwarsa);
  if (!start || !expiry || expiry <= start) return { ok: false, reason: 'tanggal_tidak_valid' };

  return dbAdapter.transaction(async (tx) => {
    const izin = await tx.findPerizinanById(perizinanId);
    if (!izin || izin.statusIzin === 'dicabut' || izin.statusIzin === 'diperpanjang') {
      return { ok: false, reason: 'izin_tidak_aktif' };
    }

    const ruang = await tx.findRuangById(izin.ruangDagangId);
    if (!ruang) return { ok: false, reason: 'ruang_tidak_tersedia' };

    await tx.updatePerizinanStatus(perizinanId, 'diperpanjang');

    const perizinan = await tx.insertPerizinan({
      ruangDagangId: izin.ruangDagangId,
      pedagangId: izin.pedagangId,
      nomorKartu: crypto.randomUUID(),
      jenisDagangan: izin.jenisDagangan,
      tanggalTerbit: String(tanggalTerbit).slice(0, 10),
      tanggalKedaluwarsa: String(tanggalKedaluwarsa).slice(0, 10),
      statusIzin: 'aktif',
    });

    const nomorKartu = buildNomorKartu({
      nomorUrut: perizinan.nomorUrut,
      nomorPasar: ruang.nomorPasar,
      kodeRuang: ruang.kodeRuang,
      jenis: 'PKB',
      tanggal: tanggalTerbit,
    });
    await tx.updateNomorKartu(perizinan.id, nomorKartu);

    return { ok: true, perizinan: { ...perizinan, nomorKartu } };
  });
}

export async function cabutIzin(perizinanId, dbAdapter) {
  if (!dbAdapter?.transaction) throw new Error('Adapter Perizinan tidak lengkap.');

  return dbAdapter.transaction(async (tx) => {
    const izin = await tx.findPerizinanById(perizinanId);
    if (!izin || izin.statusIzin === 'dicabut' || izin.statusIzin === 'diperpanjang') {
      return { ok: false, reason: 'izin_tidak_aktif' };
    }

    await tx.updatePerizinanStatus(perizinanId, 'dicabut');
    await tx.markRuangKosong(izin.ruangDagangId);

    return { ok: true };
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
