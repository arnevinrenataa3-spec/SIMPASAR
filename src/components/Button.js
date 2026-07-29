'use client';
/**
 * @description 
 * @author Aditya Syahestiano
 */


/**
 * @description Tombol primitif bersama — satu sumber kebenaran untuk semua varian
 * tombol (primary/secondary/danger/info/ghost) di seluruh dashboard.
 */

const BASE_CLASS = 'inline-flex items-center justify-center gap-2 rounded-xl transition duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

const VARIANT_CLASSES = {
  primary: 'font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 disabled:shadow-none',
  secondary: 'font-semibold text-slate-400 hover:bg-slate-800',
  danger: 'font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20',
  info: 'font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20',
  ghost: 'text-slate-400 hover:text-slate-200',
};

function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  pending = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || pending || loading;
  const classes = cn(
    BASE_CLASS,
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
    className,
  );

  return (
    <button type={type} disabled={isDisabled} className={classes} {...rest}>
      {children}
    </button>
  );
}
