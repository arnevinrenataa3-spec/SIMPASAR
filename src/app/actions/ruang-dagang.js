'use server';

/**
 * @description Server Action untuk manajemen Master Data Ruang Dagang (CRUD & Validasi).
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { ruangDagang, perizinan } from '../../db/schema.js';
import { defineAction } from '../../lib/pipeline.js';

const createSchema = z.object({
  kodeRuang: z.string().min(1, 'Kode ruang dagang wajib diisi.'),
  jenis: z.enum(['kios', 'los', 'lapak', 'toko'], {
    message: 'Jenis ruang dagang tidak valid. Pilih antara Kios, Meja, Lapak, atau Toko.',
  }),
  status: z.enum(['kosong', 'non-fisik']).optional().default('kosong'),
  panjang: z.string().optional().default(''),
  lebar: z.string().optional().default(''),
  pasarId: z.string().optional().default(''),
});

const updateSchema = createSchema.extend({
  id: z.string().min(1, 'ID ruang dagang tidak valid.'),
});

const deleteSchema = z.object({
  id: z.string().min(1, 'ID ruang dagang tidak valid.'),
});

function parseNumber(val) {
  if (!val || val.trim() === '') return null;
  const n = parseFloat(val);
  return isNaN(n) || n <= 0 ? null : n;
}

export const createRuangDagangAction = defineAction({
  operasi: 'ruang-dagang:crud',
  scope: 'enforce',
  schema: createSchema,
  revalidate: ['/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    const kodeRuang = data.kodeRuang.toUpperCase();

    const existing = await db
      .select()
      .from(ruangDagang)
      .where(sql`LOWER(${ruangDagang.kodeRuang}) = LOWER(${kodeRuang}) AND ${ruangDagang.pasarId} = ${ctx.pasarId}`);

    if (existing.length > 0) {
      return { error: `Kode ruang "${kodeRuang}" sudah terdaftar di sistem. Gunakan kode lain.` };
    }

    await db.insert(ruangDagang).values({
      pasarId: ctx.pasarId,
      kodeRuang,
      jenis: data.jenis,
      status: data.status,
      panjang: parseNumber(data.panjang),
      lebar: parseNumber(data.lebar),
    });

    return { message: `Ruang dagang "${kodeRuang}" berhasil ditambahkan.` };
  },
});

export const updateRuangDagangAction = defineAction({
  operasi: 'ruang-dagang:crud',
  scope: 'enforce',
  schema: updateSchema,
  revalidate: ['/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    const kodeRuang = data.kodeRuang.toUpperCase();

    const existing = await db
      .select()
      .from(ruangDagang)
      .where(sql`LOWER(${ruangDagang.kodeRuang}) = LOWER(${kodeRuang}) AND ${ruangDagang.pasarId} = ${ctx.pasarId} AND ${ruangDagang.id} != ${data.id}`);

    if (existing.length > 0) {
      return { error: `Kode ruang "${kodeRuang}" sudah digunakan oleh ruang dagang lain.` };
    }

    const [currentRuang] = await db
      .select({ status: ruangDagang.status })
      .from(ruangDagang)
      .where(eq(ruangDagang.id, data.id))
      .limit(1);

    if (!currentRuang) {
      return { error: 'Ruang dagang tidak ditemukan.' };
    }

    if (data.status !== currentRuang.status) {
      const [activePerizinan] = await db
        .select({ id: perizinan.id })
        .from(perizinan)
        .where(and(
          eq(perizinan.ruangDagangId, data.id),
          eq(perizinan.statusIzin, 'aktif')
        ))
        .limit(1);

      if (activePerizinan) {
        return { error: 'Status tidak dapat diubah karena ruang dagang ini masih memiliki perizinan aktif. Cabut perizinan terlebih dahulu.' };
      }
    }

    await db
      .update(ruangDagang)
      .set({
        pasarId: ctx.pasarId,
        kodeRuang,
        jenis: data.jenis,
        status: data.status,
        panjang: parseNumber(data.panjang),
        lebar: parseNumber(data.lebar),
        updatedAt: new Date(),
      })
      .where(eq(ruangDagang.id, data.id));

    return { message: `Ruang dagang "${kodeRuang}" berhasil diperbarui.` };
  },
});

export const deleteRuangDagangAction = defineAction({
  operasi: 'ruang-dagang:crud',
  scope: 'enforce',
  schema: deleteSchema,
  revalidate: ['/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data) => {
    const linkedPerizinan = await db
      .select({ id: perizinan.id })
      .from(perizinan)
      .where(eq(perizinan.ruangDagangId, data.id))
      .limit(1);

    if (linkedPerizinan.length > 0) {
      return {
        error: 'Ruang dagang tidak dapat dihapus karena sedang atau pernah memiliki data/riwayat perizinan.',
      };
    }

    await db.delete(ruangDagang).where(eq(ruangDagang.id, data.id));

    return { message: 'Ruang dagang berhasil dihapus.' };
  },
});
