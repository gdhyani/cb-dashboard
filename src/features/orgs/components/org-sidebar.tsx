"use client";

import {
  Activity,
  ChevronsUpDown,
  FolderKanban,
  KeyRound,
  Laptop,
  LayoutGrid,
  LogOut,
  type LucideIcon,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PRODUCT_NAME } from "@/constants";
import { useLogout, useMe } from "@/features/auth/hooks/use-auth";
import { useProjects } from "@/features/projects/hooks/use-projects";
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
import { Skeleton } from "@/shared/ui/skeleton";
import { useOrg, useOrgs } from "../hooks/use-orgs";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function orgNav(orgId: string, isAdmin: boolean): NavItem[] {
  const base = `/orgs/${orgId}`;
  return [
    { href: base, label: "Overview", icon: LayoutGrid, exact: true },
    { href: `${base}/projects`, label: "Projects", icon: FolderKanban },
    { href: `${base}/members`, label: "Members", icon: Users },
    ...(isAdmin
      ? [
          { href: `${base}/devices`, label: "Devices", icon: Laptop },
          { href: `${base}/audit`, label: "Activity", icon: Activity },
        ]
      : []),
    { href: `${base}/me`, label: "My access", icon: KeyRound },
  ];
}

// Segment-aware: "/me" must not match "/members".
const isActive = (pathname: string, href: string, exact?: boolean) =>
  pathname === href || (!exact && pathname.startsWith(`${href}/`));

const rowClass = (active: boolean) =>
  cn(
    "flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
    active ? "bg-white/[0.07] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
  );

/** Sidebar body, shared by the desktop rail and the mobile sheet. */
export function OrgSidebar({ orgId, onClose }: { orgId: string; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();
  const orgs = useOrgs();
  const org = useOrg(orgId);
  const projects = useProjects(orgId);
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col gap-6 p-3">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 text-left hover:bg-white/[0.04]">
            <span className="flex min-w-0 flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{PRODUCT_NAME}</span>
              <span className="truncate font-medium">{org.data?.name ?? <Skeleton className="mt-1 h-4 w-28" />}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-subtle" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {orgs.data?.map((o) => (
              <DropdownMenuItem key={o.id} onSelect={() => router.push(`/orgs/${o.id}`)}>
                <span className="flex-1 truncate">{o.name}</span>
                <span className="font-mono text-[10px] text-subtle">{o.role}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Organization">
        {orgNav(orgId, org.isAdmin).map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} className={rowClass(isActive(pathname, href, exact))}>
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <p className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Projects</p>
        <nav className="flex min-h-0 flex-col gap-0.5 overflow-y-auto" aria-label="Projects">
          {projects.isPending && [0, 1].map((i) => <Skeleton key={i} className="mx-2 my-1 h-5 w-32" />)}
          {projects.data?.map((p) => {
            const href = `/orgs/${orgId}/projects/${p.id}`;
            const suspended = p.environments.some((e) => e.killed);
            return (
              <Link key={p.id} href={href} className={rowClass(isActive(pathname, href))}>
                <span
                  aria-hidden
                  className="flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-border-strong font-mono text-[9px] leading-none uppercase"
                >
                  {p.name.slice(0, 1)}
                </span>
                <span className="truncate">{p.name}</span>
                {suspended && (
                  <span
                    className="ml-auto size-1.5 shrink-0 rounded-full bg-muted-foreground"
                    title="Has a suspended environment"
                  />
                )}
              </Link>
            );
          })}
          {projects.data?.length === 0 && <p className="px-2 py-1 text-sm text-subtle">No projects yet</p>}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/[0.04]">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm">{me.data?.user.name}</span>
            <span className="truncate font-mono text-xs text-subtle">{me.data?.user.email}</span>
          </span>
          {org.data && <BadgeLabel>{org.data.role}</BadgeLabel>}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>{me.data?.user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
