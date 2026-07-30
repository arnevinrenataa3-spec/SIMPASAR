'use client';
/**
 * @description Checkbox bertema aplikasi yang tetap memakai input native untuk aksesibilitas.
 * @author Aditya Syahestiano
 */
import { useId } from 'react';

export default function Checkbox({ checked = false, onChange, id, label, disabled = false }) {
  const generatedId = useId();
  // useId memberi pasangan id/htmlFor yang stabil bila pemanggil tidak menyediakan id.
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {/* Input tetap ada untuk fokus keyboard; span berikutnya hanya menggambar tampilannya. */}
        <input
          type="checkbox"
          id={inputId}
          checked={!!checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center rounded border border-slate-700 bg-slate-950/70 text-transparent transition duration-150 peer-checked:border-emerald-400 peer-checked:bg-emerald-400 peer-checked:text-slate-950 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </span>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  );
}
