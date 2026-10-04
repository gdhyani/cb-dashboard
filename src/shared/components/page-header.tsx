import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Small mono label (breadcrumb / section name) with an optional back link,
 * then a large, tight display title with generous space below.
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
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-2">
      <div className="flex min-w-0 flex-col gap-3">
        {(breadcrumb || backHref) && (
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            {backHref && (
              <Link
                href={backHref}
                aria-label="Back"
                className="-ml-1 inline-flex size-6 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
              </Link>
            )}
            {breadcrumb}
          </div>
        )}
        <h1 className="truncate text-display font-semibold">{title}</h1>
        {description && (
          <div className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 pb-1">{actions}</div>}
    </header>
  );
}
