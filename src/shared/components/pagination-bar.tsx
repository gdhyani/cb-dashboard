import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/shared/api/envelope";
import { Button } from "@/shared/ui/button";

/** Studio table footer: "Showing 21–40 of 134" on the left, previous/next on the right. */
export function PaginationBar({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;
  const from = (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-foreground-lighter">
      <span className="tabular-nums">
        Showing {from}–{to} of {pagination.total}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="mr-1 hidden tabular-nums sm:inline">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label="Previous page"
          disabled={!pagination.hasPrev}
          onClick={() => onPage(pagination.page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label="Next page"
          disabled={!pagination.hasNext}
          onClick={() => onPage(pagination.page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
