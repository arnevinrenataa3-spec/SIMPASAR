'use server';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { revalidatePath } from 'next/cache';
import { eq, ne, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { getSession } from '../../lib/auth.js';
import { hashPassword } from '../../lib/password.js';

async function checkAdminAuth() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null;
  }
  return session;
}

export async function createUserAction(prevState, formData) {
  const adminSession = await checkAdminAuth();
  if (!adminSession) {
    return { error: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Admin.' };
  }

  const name = formData.get('name')?.toString().trim();
  const username = formData.get('username')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString() || 'petugas';
  const pasarIdRaw = formData.get('pasarId')?.toString();
  const pasarId = role === 'admin' ? null : pasarIdRaw;

  if (!name || !username || !password) {
    return { error: 'Nama lengkap, username, dan password wajib diisi.' };
  }

  if (!['admin', 'petugas'].includes(role)) {
    return { error: 'Role tidak valid.' };
  }

  if (role === 'petugas' && !pasarId) {
    return { error: 'Petugas wajib ditugaskan ke sebuah Pasar.' };
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existing.length > 0) {
      return { error: 'Username sudah terdaftar. Silakan gunakan username lain.' };
    }

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      name,
      username,
      password: passwordHash,
      role,
      pasarId,
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: `User "${username}" berhasil dibuat.` };
  } catch (err) {
    console.error('Error creating user:', err);
    return { error: 'Gagal membuat user baru pada server.' };
  }
}

export async function updateUserAction(prevState, formData) {
  const adminSession = await checkAdminAuth();
  if (!adminSession) {
    return { error: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Admin.' };
  }

  const id = formData.get('id')?.toString();
  const name = formData.get('name')?.toString().trim();
  const username = formData.get('username')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString() || 'petugas';
  const pasarIdRaw = formData.get('pasarId')?.toString();
  const pasarId = role === 'admin' ? null : pasarIdRaw;

  if (!id || !name || !username) {
    return { error: 'Data user tidak lengkap.' };
  }

  if (!['admin', 'petugas'].includes(role)) {
    return { error: 'Role tidak valid.' };
  }

  if (role === 'petugas' && !pasarId) {
    return { error: 'Petugas wajib ditugaskan ke sebuah Pasar.' };
  }

  try {
    // Check if username taken by another user
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, id)));

    if (existing.length > 0) {
      return { error: 'Username sudah digunakan oleh akun lain.' };
    }

    const updateData = {
      name,
      username,
      role,
      pasarId,
      updatedAt: new Date(),
    };

    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    revalidatePath('/dashboard/users');
    return { success: true, message: `User "${username}" berhasil diperbarui.` };
  } catch (err) {
    console.error('Error updating user:', err);
    return { error: 'Gagal memperbarui data user.' };
  }
}

export async function deleteUserAction(prevState, formData) {
  const adminSession = await checkAdminAuth();
  if (!adminSession) {
    return { error: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Admin.' };
  }

  const id = formData.get('id')?.toString();

  if (!id) {
    return { error: 'ID user tidak valid.' };
  }

  if (id === adminSession.id) {
    return { error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' };
  }

  try {
    await db.delete(users).where(eq(users.id, id));

    revalidatePath('/dashboard/users');
    return { success: true, message: 'User berhasil dihapus.' };
  } catch (err) {
    console.error('Error deleting user:', err);
    return { error: 'Gagal menghapus user.' };
  }
}
