/**
 * @description 
 * @author Aditya Syahestiano
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
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
