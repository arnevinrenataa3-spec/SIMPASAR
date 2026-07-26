/**
 * @description Pipeline server action: plumbing guard → validasi → scope → execute → revalidate.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { revalidatePath } from 'next/cache';
import { getSession } from './auth.js';
import { boleh } from './policy.js';
import { assertWriteScope } from './scope.js';

/**
 * Definisikan server action yang menyerap plumbing: auth, scope, validasi, revalidasi.
 *
 * @param {{ operasi: string, scope?: 'enforce', schema?: import('zod').ZodType, revalidate?: string[], execute: Function }} config
 * @returns {(prevState: any, formData: FormData) => Promise<{success: boolean, message?: string, error?: string, fieldErrors?: Record<string,string[]>}>}
 */
export function defineAction({ operasi, scope, schema, revalidate = [], execute }) {
  return async function action(prevState, formData) {
    const user = await getSession();

    if (!boleh(user, operasi)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    let derivedPasarId = null;
    if (scope === 'enforce') {
      const requested = formData.get('pasarId')?.toString() || null;
      try {
        derivedPasarId = assertWriteScope(user, requested);
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    let data;
    if (schema) {
      const raw = {};
      for (const [k, v] of formData.entries()) {
        raw[k] = v;
      }
      const result = schema.safeParse(raw);
      if (!result.success) {
        return {
          success: false,
          error: 'Data tidak valid.',
          fieldErrors: result.error.flatten().fieldErrors,
        };
      }
      data = result.data;
    } else {
      data = formData;
    }

    try {
      const ctx = { user, pasarId: derivedPasarId };
      const result = await execute(data, ctx);

      if (result && result.error) {
        return { success: false, error: result.error };
      }

      for (const path of revalidate) {
        revalidatePath(path);
      }

      return { success: true, message: result?.message };
    } catch (err) {
      console.error('Action error:', err);
      return { success: false, error: err.message || 'Gagal memproses operasi.' };
    }
  };
}
