/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

import { and, asc, desc, eq, exists } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '../../../db/index.js';
import { pasar, pedagang, perizinan, ruangDagang } from '../../../db/schema.js';
import { getSession } from '../../../lib/auth.js';
import { buildScopeFilter, resolveScope } from '../../../lib/scope.js';
import PerizinanPanel from './PerizinanPanel.js';

export default async function PerizinanPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  const scope = await resolveScope(user);
  const scopeFilter = buildScopeFilter(scope, ruangDagang.pasarId);
  const availableFilter = scopeFilter
    ? and(scopeFilter, eq(ruangDagang.status, 'kosong'))
    : eq(ruangDagang.status, 'kosong');

  const spaces = await db.select({
    id: ruangDagang.id,
    pasarId: ruangDagang.pasarId,
    kodeRuang: ruangDagang.kodeRuang,
    namaPasar: pasar.namaPasar,
  }).from(ruangDagang)
    .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .where(availableFilter)
    .orderBy(asc(pasar.namaPasar), asc(ruangDagang.kodeRuang));

  const permits = await db.select({
    id: perizinan.id,
    nomorKartu: perizinan.nomorKartu,
    kodeRuang: ruangDagang.kodeRuang,
    namaPasar: pasar.namaPasar,
    namaPedagang: pedagang.namaLengkap,
    jenisDagangan: perizinan.jenisDagangan,
    tanggalTerbit: perizinan.tanggalTerbit,
    tanggalKedaluwarsa: perizinan.tanggalKedaluwarsa,
    statusIzin: perizinan.statusIzin,
  }).from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .innerJoin(pasar, eq(ruangDagang.pasarId, pasar.id))
    .innerJoin(pedagang, eq(perizinan.pedagangId, pedagang.id))
    .where(scopeFilter)
    .orderBy(desc(perizinan.createdAt));

  const traders = scope === 'all'
    ? await db.select().from(pedagang).orderBy(asc(pedagang.namaLengkap))
    : await db.select({
      id: pedagang.id,
      nik: pedagang.nik,
      namaLengkap: pedagang.namaLengkap,
      alamat: pedagang.alamat,
      nomorHp: pedagang.nomorHp,
    }).from(pedagang)
      .where(exists(
        db.select({ id: perizinan.id }).from(perizinan)
          .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
          .where(and(eq(perizinan.pedagangId, pedagang.id), eq(ruangDagang.pasarId, scope))),
      ))
      .orderBy(asc(pedagang.namaLengkap));

  return (
    <PerizinanPanel
      permits={permits}
      spaces={spaces}
      traders={traders}
    />
  );
}
