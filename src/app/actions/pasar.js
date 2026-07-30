'use server';

/**
 * @description Server Action untuk manajemen Master Data Pasar (CRUD).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { pasar, ruangDagang, users } from '../../db/schema.js';
import { defineAction } from '../../lib/pipeline.js';

const createSchema = z.object({
  namaPasar: z.string().min(1, 'Nama Pasar wajib diisi.'),
  alamat: z.string().min(1, 'Alamat wajib diisi.'),
  nomorPasar: z.string().min(1, 'Nomor Pasar wajib diisi.'),
});

const updateSchema = createSchema.extend({
  id: z.string().min(1, 'ID pasar tidak valid.'),
});

const deleteSchema = z.object({
  id: z.string().min(1, 'ID pasar tidak valid.'),
});

export const createPasarAction = defineAction({
  operasi: 'pasar:crud',
  schema: createSchema,
  revalidate: ['/dashboard/pasar', '/dashboard'],
  execute: async (data) => {
    const existing = await db
      .select()
      .from(pasar)
      .where(sql`LOWER(${pasar.namaPasar}) = LOWER(${data.namaPasar})`);

    if (existing.length > 0) {
      return { error: `Pasar dengan nama "${data.namaPasar}" sudah terdaftar.` };
    }

    await db.insert(pasar).values({
      namaPasar: data.namaPasar,
      alamat: data.alamat,
      nomorPasar: data.nomorPasar,
    });

    return { message: `Pasar "${data.namaPasar}" berhasil ditambahkan.` };
  },
});

export const updatePasarAction = defineAction({
  operasi: 'pasar:crud',
  schema: updateSchema,
  revalidate: ['/dashboard/pasar', '/dashboard'],
  execute: async (data) => {
    const existing = await db
      .select()
      .from(pasar)
      .where(sql`LOWER(${pasar.namaPasar}) = LOWER(${data.namaPasar}) AND ${pasar.id} != ${data.id}`);

    if (existing.length > 0) {
      return { error: `Pasar dengan nama "${data.namaPasar}" sudah digunakan oleh pasar lain.` };
    }

    await db
      .update(pasar)
      .set({
        namaPasar: data.namaPasar,
        alamat: data.alamat,
        nomorPasar: data.nomorPasar,
        updatedAt: new Date(),
      })
      .where(eq(pasar.id, data.id));

    return { message: `Pasar "${data.namaPasar}" berhasil diperbarui.` };
  },
});

export const deletePasarAction = defineAction({
  operasi: 'pasar:crud',
  schema: deleteSchema,
  revalidate: ['/dashboard/pasar', '/dashboard'],
  execute: async (data) => {
    const linkedRuangDagang = await db
      .select({ id: ruangDagang.id })
      .from(ruangDagang)
      .where(eq(ruangDagang.pasarId, data.id))
      .limit(1);

    if (linkedRuangDagang.length > 0) {
      return { error: 'Pasar tidak dapat dihapus karena masih memiliki ruang dagang terkait.' };
    }

    const linkedUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.pasarId, data.id))
      .limit(1);

    if (linkedUsers.length > 0) {
      return { error: 'Pasar tidak dapat dihapus karena masih memiliki petugas terkait.' };
    }

    await db.delete(pasar).where(eq(pasar.id, data.id));

    return { message: 'Pasar berhasil dihapus.' };
  },
});
