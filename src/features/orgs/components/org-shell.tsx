"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { PRODUCT_NAME } from "@/constants";
import { useLogout, useMe } from "@/features/auth/hooks/use-auth";
import { BadgeLabel } from "@/shared/components/badge-label";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useOrg, useOrgs } from "../hooks/use-orgs";

export function OrgShell({ orgId, children }: { orgId: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();
  const orgs = useOrgs();
  const org = useOrg(orgId);
  const logout = useLogout();
  const base = `/orgs/${orgId}`;
  const nav = [
    { href: base, label: "Overview", exact: true },
    { href: `${base}/projects`, label: "Projects" },
    { href: `${base}/members`, label: "Members" },
    ...(org.isAdmin
      ? [
          { href: `${base}/devices`, label: "Devices" },
          { href: `${base}/audit`, label: "Activity" },
        ]
      : []),
    { href: `${base}/me`, label: "My access" },
  ];

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between border-r border-border p-4 md:flex">
        <div className="flex flex-col gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted">
              <span className="flex min-w-0 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{PRODUCT_NAME}</span>
                <span className="truncate font-medium">{org.data?.name ?? "…"}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-subtle" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {orgs.data?.map((o) => (
                <DropdownMenuItem key={o.id} onSelect={() => router.push(`/orgs/${o.id}`)}>
                  <span className="flex-1 truncate">{o.name}</span>
                  <span className="font-mono text-[10px] text-subtle">{o.role}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <nav className="flex flex-col gap-0.5" aria-label="Organization">
            {nav.map((item) => {
              // Segment-aware: "/me" must not match "/members".
              const active = pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-sm transition-colors",
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm">{me.data?.user.name}</span>
              <span className="truncate font-mono text-xs text-subtle">{me.data?.user.email}</span>
            </span>
            {org.data && <BadgeLabel>{org.data.role}</BadgeLabel>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{me.data?.user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <span className="font-medium">{org.data?.name}</span>
          <nav className="flex gap-3 text-sm text-muted-foreground">
            {nav.slice(0, 3).map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
