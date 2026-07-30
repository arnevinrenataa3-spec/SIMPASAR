'use client';
/**
 * @description Tabel client-side dengan pencarian, filter, pengurutan, dan sinkronisasi URL opsional.
 * @author Arnevin Renata Ahmad Barkah
 * @contributor Muhamad Hazmi Alfarizqi, Aditya Syahestiano
 */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select from './Select.js';

function compareValues(a, b) {
  // Nilai kosong ditempatkan terakhir; angka dibandingkan sebagai angka, sisanya sebagai teks Indonesia.
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a !== '' && b !== '' && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b))) {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), 'id-ID', { sensitivity: 'base' });
}

function SortIcon({ direction }) {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {direction === 'asc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />}
      {direction === 'desc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />}
      {!direction && (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4" opacity="0.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15l4 4 4-4" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

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
  // Gunakan nama accessor yang stabil, bukan referensi array filters yang sering dibuat ulang
  // oleh komponen induk pada setiap render.
  const filterAccessorsKey = filters.map((f) => f.accessor).join('|');

  const urlQ = syncSearchParams ? (searchParams.get('q') || '') : '';
  const urlFilters = useMemo(() => {
    if (!syncSearchParams) return {};
    const fv = {};
    for (const f of filters) {
      fv[f.accessor] = searchParams.get(f.accessor) || '';
    }
    return fv;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterAccessorsKey sengaja mewakili identitas filters/searchParams, lihat komentar di atas
  }, [syncSearchParams, searchParamsKey, filterAccessorsKey]);

  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [filterValues, setFilterValues] = useState(urlFilters);

  useEffect(() => {
    if (!syncSearchParams) return;
    /* eslint-disable react-hooks/set-state-in-effect -- State lokal perlu mengikuti parameter URL untuk pencarian/filter dengan debounce */
    // Pertahankan state lama bila nilainya sama agar perubahan referensi dari induk tidak
    // memicu rangkaian render baru.
    setSearchQuery((prev) => (prev === urlQ ? prev : urlQ));
    setFilterValues((prev) => {
      const keys = Object.keys(urlFilters);
      const same = keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === urlFilters[k]);
      return same ? prev : urlFilters;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParamsKey, urlQ, urlFilters, syncSearchParams]);

  const syncToUrl = useCallback((q, fv) => {
    if (!syncSearchParams || !router) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    // Debounce menunda perubahan URL sampai pengguna berhenti mengetik selama 300 ms.
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
    // Pencarian memeriksa semua kolom yang memiliki accessor, kemudian menerapkan setiap filter.
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

  const [sortConfig, setSortConfig] = useState({ accessor: null, direction: null });

  function handleSort(accessor) {
    // Klik berulang menjalankan siklus: naik, turun, lalu tanpa pengurutan.
    setSortConfig((prev) => {
      if (prev.accessor !== accessor) return { accessor, direction: 'asc' };
      if (prev.direction === 'asc') return { accessor, direction: 'desc' };
      return { accessor: null, direction: null };
    });
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.accessor) return filteredData;
    // Salin array agar data dari props tidak ikut berubah saat sort dijalankan.
    const sorted = [...filteredData].sort((a, b) => compareValues(a[sortConfig.accessor], b[sortConfig.accessor]));
    return sortConfig.direction === 'desc' ? sorted.reverse() : sorted;
  }, [filteredData, sortConfig]);

  const showSearchBar = searchPlaceholder || filters.length > 0;
  const colSpan = columns.length;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {showSearchBar && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-6 py-4 border-b border-slate-800/80">
          {searchPlaceholder && (
            <div className="relative flex-1 w-full">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50 placeholder-slate-400"
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.accessor}
                  options={filter.options}
                  value={filterValues[filter.accessor] || ''}
                  onChange={(value) => handleFilterChange(filter.accessor, value)}
                  placeholder={filter.placeholder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {data.length > 0 && (
        <div className="px-6 py-2 text-[11px] text-slate-400 border-b border-slate-800/80">
          Menampilkan <span className="text-slate-300 font-semibold">{sortedData.length}</span>
          {sortedData.length !== data.length && (
            <> dari <span className="text-slate-300 font-semibold">{data.length}</span></>
          )} data
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            <tr>
              {columns.map((col) => {
                const isSortable = Boolean(col.accessor) && col.sortable !== false;
                const isActive = sortConfig.accessor === col.accessor;
                return (
                  <th key={col.header} className={`${cellPadding} ${col.thClassName || ''}`}>
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.accessor)}
                        className={`inline-flex items-center gap-1 transition cursor-pointer ${isActive ? 'text-emerald-400' : 'hover:text-slate-200'}`}
                      >
                        {col.header}
                        <SortIcon direction={isActive ? sortConfig.direction : null} />
                      </button>
                    ) : col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedData.length > 0 ? (
              sortedData.map((row, idx) => (
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
                <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-400">
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
