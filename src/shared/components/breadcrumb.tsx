import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Inherits the header's mono/uppercase styling and always stays on one line. Earlier crumbs link up the
 * hierarchy; on phones only the last two show, and long names truncate.
 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap"
    >
      {items.map((item, i) => {
        const early = i < items.length - 2;
        return (
          <Fragment key={item.href ?? item.label}>
            {i > 0 && (
              <span aria-hidden="true" className={cn("shrink-0", i === items.length - 2 && "hidden sm:inline")}>
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn("min-w-0 truncate transition-colors hover:text-foreground", early && "hidden sm:inline")}
              >
                {item.label}
              </Link>
            ) : (
              <span className="min-w-0 truncate" aria-current="page">
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
