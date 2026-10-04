"use client";

import {
  Activity,
  FolderKanban,
  KeyRound,
  Laptop,
  LayoutGrid,
  LogOut,
  type LucideIcon,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Skeleton } from "@/shared/ui/skeleton";
import { useOrg } from "../hooks/use-orgs";

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
          { href: `${base}/devices`, label: "Devices & sessions", icon: Laptop },
          { href: `${base}/audit`, label: "Activity", icon: Activity },
          { href: `${base}/emergency`, label: "Emergency stop", icon: ShieldAlert },
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
  const org = useOrg(orgId);
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col gap-6 p-3">
      <div className="flex items-center gap-1">
        {/* One org per user: shown as a label, not a switcher. Projects are switched from the navbar. */}
        <Link href={`/orgs/${orgId}`} className="flex h-11 min-w-0 flex-1 flex-col justify-center rounded-md px-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{PRODUCT_NAME}</span>
          <span className="truncate font-medium">{org.data?.name ?? <Skeleton className="mt-1 h-4 w-28" />}</span>
        </Link>
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

      <DropdownMenu>
        <DropdownMenuTrigger className="mt-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/[0.04]">
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
