/**
 * @description Aturan inti untuk normalisasi dan pembuatan data induk Pedagang.
 * @author Muhamad Hazmi Alfarizqi
 */

function normalizeNik(nik) {
  return String(nik ?? '').replace(/\s+/g, '');
}

function normalizeData(data = {}) {
  return {
    nik: normalizeNik(data.nik),
    namaLengkap: String(data.namaLengkap ?? '').trim(),
    alamat: String(data.alamat ?? '').trim(),
    nomorHp: String(data.nomorHp ?? '').trim(),
  };
}

export async function temukanAtauBuatPedagang(nik, data, dbAdapter) {
  // Pola find-or-create mencegah data Pedagang ganda saat NIK yang sama dipakai untuk izin baru.
  if (!dbAdapter?.findPedagangByNik || !dbAdapter?.insertPedagang) {
    throw new Error('Adapter Pedagang tidak lengkap.');
  }

  const normalizedNik = normalizeNik(nik);
  const existing = await dbAdapter.findPedagangByNik(normalizedNik);
  if (existing) return existing;

  const values = normalizeData({ ...data, nik: normalizedNik });
  try {
    return await dbAdapter.insertPedagang(values);
  } catch (error) {
    // Permintaan lain mungkin lebih dahulu menyimpan NIK unik yang sama; ambil hasilnya kembali.
    if (error?.code === '23505') {
      const concurrent = await dbAdapter.findPedagangByNik(normalizedNik);
      if (concurrent) return concurrent;
    }
    throw error;
  }
}
