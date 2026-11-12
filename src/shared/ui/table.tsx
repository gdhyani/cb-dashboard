import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-border bg-surface-100 shadow-xs">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-surface-200 [&_tr]:border-b [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-surface-200 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "heading-meta h-10 px-4 text-left align-middle whitespace-nowrap text-foreground-lighter",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-4 py-3 align-middle text-sm", className)} {...props} />;
}

/** Supabase TableHeadSort: the head label is a button; the icon shows the current direction. */
function TableHeadSort({
  children,
  active,
  dir,
  onSort,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  dir?: "asc" | "desc";
  onSort: () => void;
  className?: string;
}) {
  const Icon = !active ? ChevronsUpDown : dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <TableHead className={className} aria-sort={active ? (dir === "desc" ? "descending" : "ascending") : "none"}>
      <button
        type="button"
        onClick={onSort}
        className="heading-meta -mx-1 inline-flex items-center gap-1 rounded px-1 text-foreground-lighter hover:text-foreground"
      >
        {children}
        <Icon className={cn("size-3", active && "text-foreground")} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableHeadSort, TableRow };
