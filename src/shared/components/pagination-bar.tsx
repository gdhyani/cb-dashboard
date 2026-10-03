import type { Pagination } from "@/shared/api/envelope";
import { Button } from "@/shared/ui/button";

export function PaginationBar({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between font-mono text-xs text-subtle">
      <span>
        page {pagination.page} / {pagination.totalPages} · {pagination.total} total
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" disabled={!pagination.hasPrev} onClick={() => onPage(pagination.page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="ghost" disabled={!pagination.hasNext} onClick={() => onPage(pagination.page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
