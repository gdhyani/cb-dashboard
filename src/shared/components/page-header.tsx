import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One-line mono breadcrumb (optional back link), then the display title with its actions on the
 * same row — vertically centred on the title — and the description below.
 */
export function PageHeader({
  breadcrumb,
  backHref,
  title,
  description,
  actions,
}: {
  breadcrumb?: ReactNode;
  backHref?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pb-2">
      {(breadcrumb || backHref) && (
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">{breadcrumb}</div>
        </div>
      )}
      <div className="flex min-w-0 items-center justify-between gap-4">
        <h1 className="min-w-0 truncate text-display font-semibold">{title}</h1>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && <div className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</div>}
    </header>
  );
}
