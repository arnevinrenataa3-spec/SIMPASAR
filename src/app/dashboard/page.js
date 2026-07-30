/**
 * @description Halaman Overview Dashboard SIMPASAR (Statistik Pasar, Ruang Dagang, & Quick Actions).
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { getSession } from '../../lib/auth.js';
import { resolveScope, buildScopeFilter } from '../../lib/scope.js';
import { db } from '../../db/index.js';
import { pasar, perizinan, ruangDagang } from '../../db/schema.js';
import { and, eq, lt, sql } from 'drizzle-orm';

export default async function DashboardPage() {
  const user = await getSession();
  const scope = await resolveScope(user);
  const whereClause = buildScopeFilter(scope, ruangDagang.pasarId);

  const allRuang = await db
    .select({
      id: ruangDagang.id,
      status: ruangDagang.status,
      jenis: ruangDagang.jenis,
      pasarId: ruangDagang.pasarId,
    })
    .from(ruangDagang)
    .where(whereClause);

  const fisik = allRuang.filter((r) => r.status !== 'non-fisik');
  const stats = {
    total: fisik.length,
    kios: fisik.filter((r) => r.jenis === 'kios').length,
    los: fisik.filter((r) => r.jenis === 'los').length,
    lapak: fisik.filter((r) => r.jenis === 'lapak').length,
    toko: fisik.filter((r) => r.jenis === 'toko').length,
    kosong: fisik.filter((r) => r.status === 'kosong').length,
    terisi: fisik.filter((r) => r.status === 'terisi').length,
    nonFisik: allRuang.filter((r) => r.status === 'non-fisik').length,
  };

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const expiredBase = and(
    sql`${perizinan.statusIzin} IN ('aktif', 'kedaluwarsa')`,
    lt(perizinan.tanggalKedaluwarsa, today),
  );
  const expiredWhere = whereClause ? and(whereClause, expiredBase) : expiredBase;

  const [expiredResult] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .where(expiredWhere);

  const kedaluwarsaCount = expiredResult?.count ?? 0;

  const expiringSoonBase = and(
    eq(perizinan.statusIzin, 'aktif'),
    sql`${perizinan.tanggalKedaluwarsa} >= ${today} AND ${perizinan.tanggalKedaluwarsa} <= ${sevenDaysLater}`,
  );
  const expiringSoonWhere = whereClause ? and(whereClause, expiringSoonBase) : expiringSoonBase;

  const [expiringSoonResult] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .where(expiringSoonWhere);

  const expiringSoonCount = expiringSoonResult?.count ?? 0;

  const teguranWhere = whereClause
    ? and(whereClause, sql`${perizinan.statusTeguran} != 'none'`)
    : sql`${perizinan.statusTeguran} != 'none'`;

  const [teguranResult] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(perizinan)
    .innerJoin(ruangDagang, eq(perizinan.ruangDagangId, ruangDagang.id))
    .where(teguranWhere);

  const teguranCount = teguranResult?.count ?? 0;

  let activeScopeLabel = 'Semua Pasar';
  if (scope && scope !== 'all') {
    const scopePasar = await db
      .select({ namaPasar: pasar.namaPasar })
      .from(pasar)
      .where(eq(pasar.id, scope))
      .limit(1);
    if (scopePasar.length > 0) {
      activeScopeLabel = scopePasar[0].namaPasar;
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
            🏢 Active Scope: {activeScopeLabel}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Selamat Datang, {user?.name || 'Petugas'}! 👋
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mt-2">
            Portal Sistem Informasi Manajemen Pasar (SIMPASAR). Mengelola denah ruang dagang, data pedagang, perizinan, dan peneguran Surat Peringatan (SP) untuk scope <strong>{activeScopeLabel}</strong>.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Ringkasan Ruang</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-100' },
              { label: 'Kios', value: stats.kios, color: 'text-indigo-400' },
              { label: 'Meja', value: stats.los, color: 'text-cyan-400' },
              { label: 'Lapak', value: stats.lapak, color: 'text-emerald-400' },
              { label: 'Toko', value: stats.toko, color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Status Ruang</span>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Kosong', value: stats.kosong, color: 'text-emerald-400' },
              { label: 'Terisi', value: stats.terisi, color: 'text-rose-400' },
              { label: 'Non-fisik', value: stats.nonFisik, color: 'text-slate-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Kedaluwarsaan &amp; Peneguran</span>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Mendekati Kadaluwarsa', value: expiringSoonCount, color: 'text-amber-400' },
              { label: 'Kadaluwarsa', value: kedaluwarsaCount, color: 'text-rose-400' },
              { label: 'Teguran (SP)', value: teguranCount, color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
