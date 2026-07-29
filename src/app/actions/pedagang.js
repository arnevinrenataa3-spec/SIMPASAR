'use server';

/**
 * @description Server Actions for scoped Pedagang CRUD.
 * @author Muhamad Hazmi Alfarizqi
 */

import { and, eq, exists, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { pedagang, perizinan, ruangDagang } from '../../db/schema.js';
import { defineAction } from '../../lib/pipeline.js';

const fields = {
  nik: z.string().trim().regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit.'),
  namaLengkap: z.string().trim().min(2, 'Nama lengkap wajib diisi.'),
  alamat: z.string().trim().min(3, 'Alamat wajib diisi.'),
  nomorHp: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Nomor HP tidak valid.'),
};
const createSchema = z.object(fields);
const updateSchema = createSchema.extend({ id: z.string().uuid('ID Pedagang tidak valid.') });
const deleteSchema = z.object({ id: z.string().uuid('ID Pedagang tidak valid.') });

function scopedPedagang(id, pasarId) {
  if (!pasarId) return eq(pedagang.id, id);
  return and(
    eq(pedagang.id, id),
    exists(
      db.select({ id: perizinan.id })
        .from(perizinan)
        .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
        .where(and(eq(perizinan.pedagangId, pedagang.id), eq(ruangDagang.pasarId, pasarId))),
    ),
  );
}

export const createPedagangAction = defineAction({
  operasi: 'pedagang:crud',
  schema: createSchema,
  revalidate: ['/dashboard/pedagang'],
  execute: async (data) => {
    const duplicate = await db.select({ id: pedagang.id }).from(pedagang).where(eq(pedagang.nik, data.nik)).limit(1);
    if (duplicate.length) return { error: `NIK ${data.nik} sudah terdaftar.` };
    await db.insert(pedagang).values(data);
    return { message: `Pedagang ${data.namaLengkap} berhasil ditambahkan.` };
  },
});

export const updatePedagangAction = defineAction({
  operasi: 'pedagang:crud',
  scope: 'enforce',
  schema: updateSchema,
  revalidate: ['/dashboard/pedagang', 'layout:/dashboard/ruang-dagang'],
  execute: async (data, ctx) => {
    const allowed = await db.select({ id: pedagang.id }).from(pedagang).where(scopedPedagang(data.id, ctx.pasarId)).limit(1);
    if (!allowed.length) return { error: 'Pedagang tidak ditemukan dalam scope Pasar aktif.' };

    const duplicate = await db.select({ id: pedagang.id }).from(pedagang)
      .where(and(eq(pedagang.nik, data.nik), ne(pedagang.id, data.id))).limit(1);
    if (duplicate.length) return { error: `NIK ${data.nik} sudah digunakan Pedagang lain.` };

    await db.update(pedagang).set({
      nik: data.nik,
      namaLengkap: data.namaLengkap,
      alamat: data.alamat,
      nomorHp: data.nomorHp,
      updatedAt: new Date(),
    }).where(scopedPedagang(data.id, ctx.pasarId));
    return { message: `Data ${data.namaLengkap} berhasil diperbarui.` };
  },
});

export const deletePedagangAction = defineAction({
  operasi: 'pedagang:crud',
  scope: 'enforce',
  schema: deleteSchema,
  revalidate: ['/dashboard/pedagang'],
  execute: async (data, ctx) => {
    const allowed = await db.select({ id: pedagang.id }).from(pedagang).where(scopedPedagang(data.id, ctx.pasarId)).limit(1);
    if (!allowed.length) return { error: 'Pedagang tidak ditemukan dalam scope Pasar aktif.' };

    const linked = await db.select({ id: perizinan.id }).from(perizinan)
      .where(eq(perizinan.pedagangId, data.id)).limit(1);
    if (linked.length) return { error: 'Pedagang tidak dapat dihapus karena memiliki riwayat Perizinan.' };

    await db.delete(pedagang).where(eq(pedagang.id, data.id));
    return { message: 'Pedagang berhasil dihapus.' };
  },
});
