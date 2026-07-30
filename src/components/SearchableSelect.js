'use client';
/**
 * @description 
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Aditya Syahestiano
 */


/**
 * @description Combobox input ringan: ketik untuk memfilter opsi, tanpa dependensi eksternal.
 */

import { useEffect, useRef, useState } from 'react';

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500/60';

export default function SearchableSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleMouseDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const displayValue = open ? query : (selected?.label ?? '');
  const filteredOptions = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        placeholder={placeholder}
        className={`${inputClass} mt-2`}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setQuery('');
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800 transition"
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-2.5 text-sm text-slate-400">Tidak ada hasil.</div>
          )}
        </div>
      )}
    </div>
  );
}
