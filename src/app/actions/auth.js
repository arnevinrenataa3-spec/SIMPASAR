'use server';

/**
 * @description Server Action untuk alur autentikasi (login dan logout session).
 * @author Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { verifyPassword, createSession, destroySession } from '../../lib/auth.js';

export async function loginAction(prevState, formData) {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  try {
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (foundUsers.length === 0) {
      return { error: 'Username atau password salah.' };
    }

    const user = foundUsers[0];
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return { error: 'Username atau password salah.' };
    }

    await createSession(user.id);
  } catch (err) {
    console.error('Login action error:', err);
    return { error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}
