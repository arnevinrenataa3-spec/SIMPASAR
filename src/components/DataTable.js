'use client';
/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */


import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder,
  filters = [],
  emptyMessage = 'Belum ada data.',
  filterEmptyMessage = 'Tidak ada data yang cocok dengan filter.',
  cellPadding = 'px-6 py-4',
  keyAccessor = 'id',
  syncSearchParams = false,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const syncTimeout = useRef(null);

  const searchParamsKey = syncSearchParams ? searchParams?.toString() : null;
  // Depend on accessor names (a stable primitive), not the `filters` array reference itself —
  // callers routinely pass `filters={[...]}` as a fresh inline literal on every render, which
  // would otherwise make this key (and everything downstream of it) churn every render.
  const filterAccessorsKey = filters.map((f) => f.accessor).join('|');

  const urlQ = syncSearchParams ? (searchParams.get('q') || '') : '';
  const urlFilters = useMemo(() => {
    if (!syncSearchParams) return {};
    const fv = {};
    for (const f of filters) {
      fv[f.accessor] = searchParams.get(f.accessor) || '';
    }
    return fv;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterAccessorsKey stands in for `filters`/`searchParams` identity on purpose, see comment above
  }, [syncSearchParams, searchParamsKey, filterAccessorsKey]);

  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [filterValues, setFilterValues] = useState(urlFilters);

  useEffect(() => {
    if (!syncSearchParams) return;
    /* eslint-disable react-hooks/set-state-in-effect -- Syncing URL params to local state is the standard Next.js pattern for debounced search/filter */
    // Bail out on value-equal updates so an upstream reference change (e.g. a caller passing a
    // fresh `filters`/`urlFilters` literal) can never re-trigger this effect's own state updates.
    setSearchQuery((prev) => (prev === urlQ ? prev : urlQ));
    setFilterValues((prev) => {
      const keys = Object.keys(urlFilters);
      const same = keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === urlFilters[k]);
      return same ? prev : urlFilters;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParamsKey, urlQ, urlFilters]);

  const syncToUrl = useCallback((q, fv) => {
    if (!syncSearchParams || !router) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q); else params.delete('q');
      for (const filter of filters) {
        const val = fv[filter.accessor];
        if (val) params.set(filter.accessor, val);
        else params.delete(filter.accessor);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300);
  }, [syncSearchParams, router, searchParams, filters]);

  function handleSearchChange(value) {
    setSearchQuery(value);
    syncToUrl(value, filterValues);
  }

  function handleFilterChange(accessor, value) {
    const next = { ...filterValues, [accessor]: value };
    setFilterValues(next);
    syncToUrl(searchQuery, next);
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = columns.some((col) => {
          if (!col.accessor) return false;
          const val = item[col.accessor];
          if (val == null) return false;
          return String(val).toLowerCase().includes(q);
        });
        if (!matchesSearch) return false;
      }

      for (const filter of filters) {
        const val = filterValues[filter.accessor];
        if (!val) continue;
        if (item[filter.accessor] !== val) return false;
      }

      return true;
    });
  }, [data, searchQuery, filterValues, columns, filters]);

  const showSearchBar = searchPlaceholder || filters.length > 0;
  const colSpan = columns.length;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {showSearchBar && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-6 py-4 border-b border-slate-800/80">
          {searchPlaceholder && (
            <div className="relative flex-1 w-full">
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <div key={filter.accessor} className="relative">
                  <select
                    value={filterValues[filter.accessor] || ''}
                    onChange={(e) => handleFilterChange(filter.accessor, e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/50 hover:border-slate-700 transition cursor-pointer"
                  >
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={`${cellPadding} ${col.thClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr key={row[keyAccessor] ?? idx} className="hover:bg-slate-800/40 transition duration-150">
                  {columns.map((col) => (
                    <td key={col.header} className={`${cellPadding} ${col.tdClassName || ''}`}>
                      {col.render ? col.render(row, idx) : (col.accessor ? row[col.accessor] : null)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-500">
                  {data.length === 0 ? emptyMessage : filterEmptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
