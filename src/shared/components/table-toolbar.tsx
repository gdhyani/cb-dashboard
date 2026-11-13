"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { fieldClasses } from "@/shared/ui/input";

/**
 * Studio grid toolbar: search on the left, filters next to it, a result count and actions on the right.
 * Filtering itself lives with the data (see `useTableQuery`); this is only the bar.
 */
export function TableToolbar({
  search,
  onSearch,
  placeholder = "Search…",
  filters,
  count,
  total,
  noun = "result",
  onClear,
  actions,
}: {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  /** Rows shown after filtering. */
  count?: number;
  /** Rows before filtering; when it differs from `count`, the bar shows "x of y" and a Clear button. */
  total?: number;
  noun?: string;
  onClear?: () => void;
  actions?: ReactNode;
}) {
  const filtered = total !== undefined && count !== undefined && count !== total;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-lighter"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder.replace(/…$/, "")}
          className={cn(fieldClasses, "h-[28px] pr-7 pl-8 text-xs [&::-webkit-search-cancel-button]:hidden")}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-foreground-lighter hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {filters}
      {count !== undefined && (
        <span className="text-xs text-foreground-lighter" aria-live="polite">
          {filtered ? `${count} of ${total}` : count} {(filtered ? total : count) === 1 ? noun : `${noun}s`}
        </span>
      )}
      {filtered && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-foreground-light underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear filters
        </button>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
