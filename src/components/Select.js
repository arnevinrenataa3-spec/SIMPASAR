'use client';
/**
 * @description Dropdown bertema gelap dengan pilihan yang dikendalikan komponen induk.
 * @author Arnevin Renata Ahmad Barkah
 */
import { useEffect, useRef, useState } from 'react';

export default function Select({ options, value, onChange, placeholder, disabled = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Tutup dropdown ketika klik terjadi di luar elemen yang ditandai ref.
  useEffect(() => {
    if (!open) return undefined;
    function handleMouseDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/50 hover:border-slate-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 relative text-left ${className}`}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 min-w-full w-max overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-xs transition hover:bg-slate-800 ${option.value === value ? 'text-emerald-400 font-semibold' : 'text-slate-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
