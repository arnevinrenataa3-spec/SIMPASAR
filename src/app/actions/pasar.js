'use server';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { pasar, ruangDagang, users } from '../../db/schema.js';
import { getSession } from '../../lib/auth.js';

async function checkAuth() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null; // Only admin should manage Pasar
  }
  return session;
}

export async function createPasarAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Hanya administrator yang dapat melakukan tindakan ini.' };
  }

  const namaPasar = formData.get('namaPasar')?.toString().trim();
  const alamat = formData.get('alamat')?.toString().trim();
  const nomorPasar = formData.get('nomorPasar')?.toString().trim();

  if (!namaPasar || !alamat || !nomorPasar) {
    return { error: 'Semua field (Nama Pasar, Alamat, Nomor Pasar) wajib diisi.' };
  }

  try {
    const existing = await db
      .select()
      .from(pasar)
      .where(sql`LOWER(${pasar.namaPasar}) = LOWER(${namaPasar})`);

    if (existing.length > 0) {
      return { error: `Pasar dengan nama "${namaPasar}" sudah terdaftar.` };
    }

    await db.insert(pasar).values({
      namaPasar,
      alamat,
      nomorPasar,
    });

    revalidatePath('/dashboard/pasar');
    revalidatePath('/dashboard');

    return { success: true, message: `Pasar "${namaPasar}" berhasil ditambahkan.` };
  } catch (err) {
    console.error('Error creating pasar:', err);
    return { error: 'Gagal menambahkan pasar baru pada server.' };
  }
}

export async function updatePasarAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Hanya administrator yang dapat melakukan tindakan ini.' };
  }

  const id = formData.get('id')?.toString();
  const namaPasar = formData.get('namaPasar')?.toString().trim();
  const alamat = formData.get('alamat')?.toString().trim();
  const nomorPasar = formData.get('nomorPasar')?.toString().trim();

  if (!id) {
    return { error: 'ID pasar tidak valid.' };
  }

  if (!namaPasar || !alamat || !nomorPasar) {
    return { error: 'Semua field (Nama Pasar, Alamat, Nomor Pasar) wajib diisi.' };
  }

  try {
    const existing = await db
      .select()
      .from(pasar)
      .where(sql`LOWER(${pasar.namaPasar}) = LOWER(${namaPasar}) AND ${pasar.id} != ${id}`);

    if (existing.length > 0) {
      return { error: `Pasar dengan nama "${namaPasar}" sudah digunakan oleh pasar lain.` };
    }

    await db
      .update(pasar)
      .set({
        namaPasar,
        alamat,
        nomorPasar,
        updatedAt: new Date(),
      })
      .where(eq(pasar.id, id));

    revalidatePath('/dashboard/pasar');
    revalidatePath('/dashboard');

    return { success: true, message: `Pasar "${namaPasar}" berhasil diperbarui.` };
  } catch (err) {
    console.error('Error updating pasar:', err);
    return { error: 'Gagal memperbarui data pasar pada server.' };
  }
}

export async function deletePasarAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Hanya administrator yang dapat melakukan tindakan ini.' };
  }

  const id = formData.get('id')?.toString();

  if (!id) {
    return { error: 'ID pasar tidak valid.' };
  }

  try {
    // Check for references in ruang_dagang
    const linkedRuangDagang = await db
      .select({ id: ruangDagang.id })
      .from(ruangDagang)
      .where(eq(ruangDagang.pasarId, id))
      .limit(1);

    if (linkedRuangDagang.length > 0) {
      return { error: 'Pasar tidak dapat dihapus karena masih memiliki ruang dagang terkait.' };
    }

    // Check for references in users
    const linkedUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.pasarId, id))
      .limit(1);
      
    if (linkedUsers.length > 0) {
      return { error: 'Pasar tidak dapat dihapus karena masih memiliki petugas terkait.' };
    }

    await db.delete(pasar).where(eq(pasar.id, id));

    revalidatePath('/dashboard/pasar');
    revalidatePath('/dashboard');

    return { success: true, message: 'Pasar berhasil dihapus.' };
  } catch (err) {
    console.error('Error deleting pasar:', err);
    return { error: 'Gagal menghapus pasar dari database.' };
  }
}
