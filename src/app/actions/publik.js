'use server';

/**
 * @description Unauthenticated public permit lookup action.
 * @author Muhamad Hazmi Alfarizqi
 */

import { z } from 'zod';
import { perizinanDbAdapter } from '../../db/adapters/perizinan.js';
import { statusPublik } from '../../lib/perizinan.js';

const schema = z.string().trim().min(3).max(100);

export async function checkStatusPublik(prevState, formData) {
  const parsed = schema.safeParse(formData.get('nomorKartu'));
  if (!parsed.success) return { success: false, error: 'Masukkan nomor kartu yang valid.' };
  const data = await statusPublik(parsed.data, perizinanDbAdapter);
  if (!data) return { success: false, error: 'Nomor kartu tidak ditemukan.' };
  return { success: true, data };
}
