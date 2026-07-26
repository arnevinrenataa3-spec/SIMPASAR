'use server';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { ruangDagang, perizinan } from '../../db/schema.js';
import { getSession } from '../../lib/auth.js';

/**
 * Ensures user is authenticated before executing action.
 */
async function checkAuth() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}

/**
 * Server Action: Create new Ruang Dagang
 */
export async function createRuangDagangAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Anda harus login untuk melakukan tindakan ini.' };
  }

  const pasarId = formData.get('pasarId')?.toString();
  const kodeRuangRaw = formData.get('kodeRuang')?.toString().trim();
  const jenis = formData.get('jenis')?.toString().trim().toLowerCase();
  const status = formData.get('status')?.toString().trim().toLowerCase() || 'kosong';

  const panjangRaw = formData.get('panjang')?.toString().trim();
  const lebarRaw = formData.get('lebar')?.toString().trim();

  let luas = null;
  if (panjangRaw && lebarRaw) {
    const p = parseFloat(panjangRaw);
    const l = parseFloat(lebarRaw);
    if (!isNaN(p) && !isNaN(l) && p > 0 && l > 0) {
      const totalArea = Math.round(p * l * 100) / 100;
      luas = `${p} x ${l} m (${totalArea} m²)`;
    }
  }

  if (!pasarId) {
    return { error: 'Pasar wajib dipilih.' };
  }

  if (!kodeRuangRaw) {
    return { error: 'Kode ruang dagang wajib diisi.' };
  }

  const kodeRuang = kodeRuangRaw.toUpperCase();

  if (!['kios', 'los', 'lapak', 'toko'].includes(jenis)) {
    return { error: 'Jenis ruang dagang tidak valid. Pilih antara Kios, Meja, Lapak, atau Toko.' };
  }

  if (!['kosong', 'terisi'].includes(status)) {
    return { error: 'Status ruang dagang tidak valid. Pilih antara Kosong atau Terisi.' };
  }

  try {
    // Check if kodeRuang already exists (case-insensitive check using LOWER SQL function)
    const existing = await db
      .select()
      .from(ruangDagang)
      .where(sql`LOWER(${ruangDagang.kodeRuang}) = LOWER(${kodeRuang})`);

    if (existing.length > 0) {
      return { error: `Kode ruang "${kodeRuang}" sudah terdaftar di sistem. Gunakan kode lain.` };
    }

    await db.insert(ruangDagang).values({
      pasarId,
      kodeRuang,
      jenis,
      luas,
      status,
    });

    revalidatePath('/dashboard/ruang-dagang');
    revalidatePath('/dashboard');

    return { success: true, message: `Ruang dagang "${kodeRuang}" berhasil ditambahkan.` };
  } catch (err) {
    console.error('Error creating ruang dagang:', err);
    return { error: 'Gagal menambahkan ruang dagang baru pada server.' };
  }
}

/**
 * Server Action: Update existing Ruang Dagang
 */
export async function updateRuangDagangAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Anda harus login untuk melakukan tindakan ini.' };
  }

  const id = formData.get('id')?.toString();
  const pasarId = formData.get('pasarId')?.toString();
  const kodeRuangRaw = formData.get('kodeRuang')?.toString().trim();
  const jenis = formData.get('jenis')?.toString().trim().toLowerCase();
  const status = formData.get('status')?.toString().trim().toLowerCase() || 'kosong';

  const panjangRaw = formData.get('panjang')?.toString().trim();
  const lebarRaw = formData.get('lebar')?.toString().trim();

  if (!id) {
    return { error: 'ID ruang dagang tidak valid.' };
  }

  if (!pasarId) {
    return { error: 'Pasar wajib dipilih.' };
  }

  if (!kodeRuangRaw) {
    return { error: 'Kode ruang dagang wajib diisi.' };
  }

  const kodeRuang = kodeRuangRaw.toUpperCase();

  if (!['kios', 'los', 'lapak', 'toko'].includes(jenis)) {
    return { error: 'Jenis ruang dagang tidak valid. Pilih antara Kios, Meja, Lapak, atau Toko.' };
  }

  if (!['kosong', 'terisi'].includes(status)) {
    return { error: 'Status ruang dagang tidak valid. Pilih antara Kosong atau Terisi.' };
  }

  let luas = null;
  if (panjangRaw && lebarRaw) {
    const p = parseFloat(panjangRaw);
    const l = parseFloat(lebarRaw);
    if (!isNaN(p) && !isNaN(l) && p > 0 && l > 0) {
      const totalArea = Math.round(p * l * 100) / 100;
      luas = `${p} x ${l} m (${totalArea} m²)`;
    }
  }

  try {
    // Check if kodeRuang belongs to another record
    const existing = await db
      .select()
      .from(ruangDagang)
      .where(sql`LOWER(${ruangDagang.kodeRuang}) = LOWER(${kodeRuang}) AND ${ruangDagang.id} != ${id}`);

    if (existing.length > 0) {
      return { error: `Kode ruang "${kodeRuang}" sudah digunakan oleh ruang dagang lain.` };
    }

    await db
      .update(ruangDagang)
      .set({
        pasarId,
        kodeRuang,
        jenis,
        luas,
        status,
        updatedAt: new Date(),
      })
      .where(eq(ruangDagang.id, id));

    revalidatePath('/dashboard/ruang-dagang');
    revalidatePath('/dashboard');

    return { success: true, message: `Ruang dagang "${kodeRuang}" berhasil diperbarui.` };
  } catch (err) {
    console.error('Error updating ruang dagang:', err);
    return { error: 'Gagal memperbarui data ruang dagang pada server.' };
  }
}

/**
 * Server Action: Delete existing Ruang Dagang
 */
export async function deleteRuangDagangAction(prevState, formData) {
  const session = await checkAuth();
  if (!session) {
    return { error: 'Akses ditolak. Anda harus login untuk melakukan tindakan ini.' };
  }

  const id = formData.get('id')?.toString();

  if (!id) {
    return { error: 'ID ruang dagang tidak valid.' };
  }

  try {
    // Check if ruang dagang is referenced in perizinan table
    const linkedPerizinan = await db
      .select({ id: perizinan.id })
      .from(perizinan)
      .where(eq(perizinan.ruangDagangId, id))
      .limit(1);

    if (linkedPerizinan.length > 0) {
      return {
        error: 'Ruang dagang tidak dapat dihapus karena sedang atau pernah memiliki data/riwayat perizinan.',
      };
    }

    await db.delete(ruangDagang).where(eq(ruangDagang.id, id));

    revalidatePath('/dashboard/ruang-dagang');
    revalidatePath('/dashboard');

    return { success: true, message: 'Ruang dagang berhasil dihapus.' };
  } catch (err) {
    console.error('Error deleting ruang dagang:', err);
    return { error: 'Gagal menghapus ruang dagang dari database.' };
  }
}
