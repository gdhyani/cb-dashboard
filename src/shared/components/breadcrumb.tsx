import Link from "next/link";
import { Fragment } from "react";

/** Inherits the header's mono/uppercase styling; earlier crumbs link back up the hierarchy. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className="truncate transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="truncate" aria-current="page">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
