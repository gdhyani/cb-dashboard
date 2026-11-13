"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface SideMenuItem {
  href: string;
  label: string;
  /** Active only on an exact match (index pages). */
  exact?: boolean;
  /** Trailing content: a status dot or badge. */
  trailing?: ReactNode;
}

export interface SideMenuGroup {
  title?: string;
  items: SideMenuItem[];
  /** Under the group's items (e.g. a "New environment" button). */
  footer?: ReactNode;
}

/**
 * Studio's product menu: the second column next to the icon rail. A 48px header with the context's name, then
 * groups with mono uppercase titles and pill items (grey wash + foreground when active), split by hairlines.
 */
export function SideMenu({ title, groups, label }: { title: ReactNode; groups: SideMenuGroup[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="flex h-full flex-col overflow-y-auto">
      <div className="flex min-h-12 items-center border-b border-border px-6">
        <h2 className="truncate font-sans text-sm font-medium text-foreground">{title}</h2>
      </div>
      {groups.map((group, gi) => (
        <div key={group.title ?? gi} className={cn("flex flex-col py-4 md:mx-3", gi > 0 && "border-t border-border")}>
          {group.title && <p className="heading-meta mb-2 px-3 text-foreground-lighter">{group.title}</p>}
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "my-px flex min-w-0 items-center gap-2 rounded-md px-3 py-[5px] text-sm transition-colors",
                      active
                        ? "bg-selection font-medium text-foreground"
                        : "text-foreground-light hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.trailing}
                  </Link>
                </li>
              );
            })}
          </ul>
          {group.footer && <div className="mt-2 px-1">{group.footer}</div>}
        </div>
      ))}
    </nav>
  );
}
