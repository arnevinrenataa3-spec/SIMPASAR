/**
 * @description Drizzle adapter for the Perizinan domain seam.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { and, eq } from 'drizzle-orm';
import { db } from '../index.js';
import { pasar, pedagang, perizinan, ruangDagang, teguran } from '../schema.js';

function adapterFor(executor) {
  return {
    findPedagangByNik: async (nik) => {
      const rows = await executor.select().from(pedagang).where(eq(pedagang.nik, nik)).limit(1);
      return rows[0] ?? null;
    },
    insertPedagang: async (values) => {
      const rows = await executor.insert(pedagang).values(values).onConflictDoNothing({ target: pedagang.nik }).returning();
      if (rows[0]) return rows[0];
      const existing = await executor.select().from(pedagang).where(eq(pedagang.nik, values.nik)).limit(1);
      return existing[0];
    },
    findRuangForUpdate: async (id, pasarId) => {
      const where = pasarId
        ? and(eq(ruangDagang.id, id), eq(ruangDagang.pasarId, pasarId))
        : eq(ruangDagang.id, id);
      const rows = await executor
        .select({
          id: ruangDagang.id,
          pasarId: ruangDagang.pasarId,
          kodeRuang: ruangDagang.kodeRuang,
          jenis: ruangDagang.jenis,
          panjang: ruangDagang.panjang,
          lebar: ruangDagang.lebar,
          status: ruangDagang.status,
          createdAt: ruangDagang.createdAt,
          updatedAt: ruangDagang.updatedAt,
          nomorPasar: pasar.nomorPasar,
        })
        .from(ruangDagang)
        .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
        .where(where)
        .limit(1);
      return rows[0] ?? null;
    },
    findRuangById: async (id) => {
      const rows = await executor
        .select({ kodeRuang: ruangDagang.kodeRuang, nomorPasar: pasar.nomorPasar })
        .from(ruangDagang)
        .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
        .where(eq(ruangDagang.id, id))
        .limit(1);
      return rows[0] ?? null;
    },
    markRuangTerisi: async (id, pasarId) => {
      const predicates = [eq(ruangDagang.id, id), eq(ruangDagang.status, 'kosong')];
      if (pasarId) predicates.push(eq(ruangDagang.pasarId, pasarId));
      const rows = await executor
        .update(ruangDagang)
        .set({ status: 'terisi', updatedAt: new Date() })
        .where(and(...predicates))
        .returning({ id: ruangDagang.id });
      return rows.length === 1;
    },
    insertPerizinan: async (values) => {
      const rows = await executor.insert(perizinan).values(values).returning();
      return rows[0];
    },
    findPerizinanById: async (id) => {
      const rows = await executor.select().from(perizinan).where(eq(perizinan.id, id)).limit(1);
      return rows[0] ?? null;
    },
    insertTeguran: async (values) => {
      const rows = await executor.insert(teguran).values(values).returning();
      return rows[0];
    },
    updatePerizinanTeguran: async (id, statusTeguran, tanggalTeguran) => {
      const rows = await executor
        .update(perizinan)
        .set({ statusTeguran, tanggalTeguran, updatedAt: new Date() })
        .where(eq(perizinan.id, id))
        .returning({ id: perizinan.id });
      return rows.length === 1;
    },
    updatePerizinanStatus: async (id, statusIzin) => {
      const rows = await executor
        .update(perizinan)
        .set({ statusIzin, updatedAt: new Date() })
        .where(eq(perizinan.id, id))
        .returning({ id: perizinan.id });
      return rows.length === 1;
    },
    updateNomorKartu: async (id, nomorKartu) => {
      const rows = await executor
        .update(perizinan)
        .set({ nomorKartu, updatedAt: new Date() })
        .where(eq(perizinan.id, id))
        .returning({ id: perizinan.id });
      return rows.length === 1;
    },
    markRuangKosong: async (id) => {
      const rows = await executor
        .update(ruangDagang)
        .set({ status: 'kosong', updatedAt: new Date() })
        .where(and(eq(ruangDagang.id, id), eq(ruangDagang.status, 'terisi')))
        .returning({ id: ruangDagang.id });
      return rows.length === 1;
    },
  };
}

export const perizinanDbAdapter = {
  transaction: (work) => db.transaction((tx) => work(adapterFor(tx))),
  findPerizinanByNomorKartu: async (nomorKartu) => {
    const rows = await db
      .select({
        nomorKartu: perizinan.nomorKartu,
        kodeRuang: ruangDagang.kodeRuang,
        namaPasar: pasar.namaPasar,
        tanggalTerbit: perizinan.tanggalTerbit,
        tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
        statusIzin: perizinan.statusIzin,
      })
      .from(perizinan)
      .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
      .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
      .where(eq(perizinan.nomorKartu, nomorKartu))
      .limit(1);
    return rows[0] ?? null;
  },
};
