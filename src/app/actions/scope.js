'use server';

/**
 * @description Server Action untuk pembaruan scope pasar aktif pada session cookie.
 * @author Muhamad Hazmi Alfarizqi
 */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getSession } from '../../lib/auth.js';
import { boleh } from '../../lib/policy.js';

export async function setPasarScopeAction(pasarId) {
  const user = await getSession();

  if (!boleh(user, 'scope:set')) {
    return { error: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Admin.' };
  }

  const cookieStore = await cookies();
  if (!pasarId || pasarId === 'all') {
    cookieStore.set('simpasar_scope_pasar', 'all', { path: '/' });
  } else {
    cookieStore.set('simpasar_scope_pasar', pasarId, { path: '/' });
  }
  revalidatePath('/dashboard', 'layout');
}
