"use client";

import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

/**
 * Client-side search, filters and sort for a table's rows. `fields` picks the text a row is searched by;
 * `filters` are named predicates keyed by the current filter value ("all" means off).
 */
export function useTableQuery<T, F extends string = string, S extends string = string>({
  rows,
  fields,
  filters,
  sorters,
  initialSort,
}: {
  rows: T[] | undefined;
  fields: (row: T) => (string | undefined | null)[];
  filters?: Record<F, (row: T, value: string) => boolean>;
  sorters?: Record<S, (a: T, b: T) => number>;
  initialSort?: { key: S; dir: SortDir };
}) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Partial<Record<F, string>>>({});
  const [sort, setSort] = useState<{ key: S; dir: SortDir } | undefined>(initialSort);

  const result = useMemo(() => {
    const all = rows ?? [];
    const q = search.trim().toLowerCase();
    let out = all.filter((row) => {
      if (q && !fields(row).some((f) => f?.toLowerCase().includes(q))) return false;
      for (const [key, value] of Object.entries(filterValues) as [F, string | undefined][]) {
        if (!value || value === "all") continue;
        const predicate = filters?.[key];
        if (predicate && !predicate(row, value)) return false;
      }
      return true;
    });
    if (sort && sorters?.[sort.key]) {
      const cmp = sorters[sort.key];
      out = [...out].sort((a, b) => (sort.dir === "asc" ? cmp(a, b) : cmp(b, a)));
    }
    return out;
  }, [rows, search, filterValues, sort, fields, filters, sorters]);

  const toggleSort = (key: S) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return {
    rows: result,
    total: rows?.length ?? 0,
    search,
    setSearch,
    filter: (key: F) => filterValues[key] ?? "all",
    setFilter: (key: F, value: string) => setFilterValues((v) => ({ ...v, [key]: value })),
    sort,
    toggleSort,
    clear: () => {
      setSearch("");
      setFilterValues({});
    },
  };
}
