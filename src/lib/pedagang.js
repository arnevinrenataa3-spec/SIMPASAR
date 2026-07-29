/**
 * @description Domain seam for the Pedagang master record.
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
    // A concurrent request may have won the unique-NIK race.
    if (error?.code === '23505') {
      const concurrent = await dbAdapter.findPedagangByNik(normalizedNik);
      if (concurrent) return concurrent;
    }
    throw error;
  }
}
