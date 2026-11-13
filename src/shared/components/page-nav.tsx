"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

export interface PageNavItem {
  href: string;
  label: string;
  /** Active only on an exact path match (the section's index page). */
  exact?: boolean;
}

/** Supabase PageNav: route-backed underline tabs; the active link is foreground text on a foreground rule. */
export function PageNav({ items, label }: { items: PageNavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-inset -mb-px inline-flex h-10 items-center border-b-2 whitespace-nowrap text-sm transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground-lighter hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
