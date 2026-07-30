/**
 * @description Badge status bersama yang aman dipakai di Server maupun Client Component.
 * @author Aditya Syahestiano
 */

const COLOR_CLASSES = {
  emerald: { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
  rose: { pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-500' },
  amber: { pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  indigo: { pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-500' },
  cyan: { pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-500' },
  slate: { pill: 'bg-slate-500/15 text-slate-300 border-slate-500/30', dot: 'bg-slate-500' },
  blue: { pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30', dot: 'bg-blue-500' },
  orange: { pill: 'bg-orange-500/15 text-orange-300 border-orange-500/30', dot: 'bg-orange-500' },
};

export default function Badge({ color, dot = false, children }) {
  // Warna yang tidak dikenal memakai slate agar komponen tetap memiliki tampilan aman.
  const colorClasses = COLOR_CLASSES[color] ?? COLOR_CLASSES.slate;
  const paddingClasses = dot ? 'gap-1.5 px-2.5 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border text-xs font-bold uppercase tracking-wider ${paddingClasses} ${colorClasses.pill}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${colorClasses.dot}`} />}
      {children}
    </span>
  );
}
