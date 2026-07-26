'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 */


export default function Navbar({ user }) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const displayBadgeText = user?.role === 'admin'
    ? 'Admin'
    : (user?.pasarNama || 'Petugas');

  return (
    <header className="h-16 px-8 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Portal Pengelola Pasar</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-normal">Dashboard Utama</span>
        </h2>
      </div>

      {/* Quick Info Bar */}
      <div className="flex items-center gap-4 text-xs">
        {/* Date Display */}
        <div className="hidden sm:block text-slate-400 text-xs bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
          {currentDate}
        </div>

        {/* Market / Role Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full" title={displayBadgeText}>
          <span className="font-semibold text-xs truncate max-w-[200px]">{displayBadgeText}</span>
        </div>
      </div>
    </header>
  );
}
