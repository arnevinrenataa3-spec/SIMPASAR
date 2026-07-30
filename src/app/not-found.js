/**
 * @description Halaman 404 global ketika rute yang diminta tidak ditemukan.
 * @author Muhamad Hazmi Alfarizqi
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full text-center space-y-6 z-10 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-3xl font-extrabold font-mono">
          404
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Maaf, halaman atau URL yang Anda tuju tidak ditemukan atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition duration-150 shadow-lg shadow-emerald-500/20"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
