'use server';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setPasarScopeAction(pasarId) {
  const cookieStore = await cookies();
  if (!pasarId || pasarId === 'all') {
    cookieStore.set('simpasar_scope_pasar', 'all', { path: '/' });
  } else {
    cookieStore.set('simpasar_scope_pasar', pasarId, { path: '/' });
  }
  revalidatePath('/dashboard', 'layout');
}
