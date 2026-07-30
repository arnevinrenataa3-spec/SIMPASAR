'use server';

/**
 * @description Server Action publik untuk memeriksa status izin tanpa autentikasi.
 * @author Muhamad Hazmi Alfarizqi
 */

import { z } from 'zod';
import { perizinanDbAdapter } from '../../db/adapters/perizinan.js';
import { statusPublik } from '../../lib/perizinan.js';

const schema = z.string().trim().min(3).max(100);

export async function checkStatusPublik(prevState, formData) {
  // Input dibatasi panjangnya sebelum query untuk menolak nilai kosong atau tidak wajar sejak awal.
  const parsed = schema.safeParse(formData.get('nomorKartu'));
  if (!parsed.success) return { success: false, error: 'Masukkan nomor kartu yang valid.' };
  // Fungsi domain hanya mengembalikan kolom yang aman ditampilkan kepada publik.
  const data = await statusPublik(parsed.data, perizinanDbAdapter);
  if (!data) return { success: false, error: 'Nomor kartu tidak ditemukan.' };
  return { success: true, data };
}
