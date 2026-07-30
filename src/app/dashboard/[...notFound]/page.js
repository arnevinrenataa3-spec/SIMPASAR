/**
 * @description Rute penampung untuk URL dashboard yang tidak memiliki halaman.
 * @author Muhamad Hazmi Alfarizqi
 */

import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="max-w-lg mx-auto my-16 text-center space-y-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
        404
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-100">Halaman Dashboard Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Fitur atau halaman di dalam dashboard ini tidak tersedia atau URL yang Anda masukkan salah.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition duration-150 shadow-lg shadow-emerald-500/20"
        >
          ← Kembali ke Dashboard Utama
        </Link>
      </div>
    </div>
  );
}
