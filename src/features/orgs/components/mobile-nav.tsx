"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PRODUCT_NAME } from "@/constants";
import { cn } from "@/shared/lib/utils";
import { SheetClose } from "@/shared/ui/sheet";
import { useOrg } from "../hooks/use-orgs";
import { isActive, orgNavGroups } from "./org-sidebar";

function Item({
  href,
  active,
  icon,
  children,
  trailing,
}: {
  href: string;
  active: boolean;
  icon?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-0 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-selection font-medium text-foreground"
          : "text-foreground-light hover:bg-accent hover:text-foreground",
      )}
    >
      {icon && <span className="shrink-0 text-foreground-lighter [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}

/**
 * Phone menu: the same items and groups as the desktop rail, on every page (static), under an org header. Account,
 * theme, Docs and Sign out live in the profile menu (top bar).
 */
export function MobileNav({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const org = useOrg(orgId);
  const groups = orgNavGroups(orgId, org.isAdmin);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-brand font-mono text-[11px] font-semibold text-brand-foreground">
          {PRODUCT_NAME.slice(0, 2)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{org.data?.name}</span>
          <span className="text-xs text-foreground-lighter">Organization</span>
        </div>
        <SheetClose
          aria-label="Close menu"
          className="flex size-8 items-center justify-center rounded-md border border-border-strong text-foreground-lighter hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </SheetClose>
      </div>

      <nav aria-label="Menu" className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group, gi) => (
          <div key={group[0]?.href ?? gi} className="flex flex-col gap-0.5">
            {gi > 0 && <div className="mx-3 my-2 h-px bg-border" />}
            {group.map(({ href, label, icon: Icon, exact }) => (
              <Item key={href} href={href} active={isActive(pathname, href, exact)} icon={<Icon strokeWidth={1.5} />}>
                {label}
              </Item>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
