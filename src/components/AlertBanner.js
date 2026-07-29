/**
 * @description Banner alert sukses/error untuk hasil server action.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi
 */

export default function AlertBanner({ state }) {
  if (!state) return null;

  const fieldErrorEntries = state?.fieldErrors
    ? Object.entries(state.fieldErrors).filter(([, msgs]) => msgs?.length > 0)
    : [];

  return (
    <>
      {state?.error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-rose-200">{state.error}</p>
            {fieldErrorEntries.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {fieldErrorEntries.map(([field, msgs]) =>
                  msgs.map((msg, i) => (
                    <li key={`${field}-${i}`} className="text-xs text-rose-300">• {msg}</li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      {state?.success && state?.message && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-emerald-200">{state.message}</p>
        </div>
      )}
    </>
  );
}
