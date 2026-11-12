"use client";

import {
  Activity,
  FolderKanban,
  Home,
  KeyRound,
  Laptop,
  type LucideIcon,
  PanelLeft,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";
import { useOrg } from "../hooks/use-orgs";
import { SIDEBAR_MODES, type SidebarMode } from "../hooks/use-sidebar-mode";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

/** Global navigation, in groups (Title Case, Supabase). Admin-only pages are left out for developers. */
export function orgNavGroups(orgId: string, isAdmin: boolean): NavItem[][] {
  const base = `/orgs/${orgId}`;
  return [
    [{ href: base, label: "Home", icon: Home, exact: true }],
    [
      { href: `${base}/projects`, label: "Projects", icon: FolderKanban },
      { href: `${base}/members`, label: "Members", icon: Users },
      ...(isAdmin
        ? [
            { href: `${base}/devices`, label: "Devices & Sessions", icon: Laptop },
            { href: `${base}/audit`, label: "Activity", icon: Activity },
          ]
        : []),
    ],
    [
      ...(isAdmin ? [{ href: `${base}/emergency`, label: "Emergency Stop", icon: ShieldAlert }] : []),
      { href: `${base}/me`, label: "My Access", icon: KeyRound },
      { href: `${base}/account`, label: "Account", icon: UserRound },
    ],
  ];
}

/** Flat list, for the command menu. */
export function orgNav(orgId: string, isAdmin: boolean): NavItem[] {
  return orgNavGroups(orgId, isAdmin).flat();
}

// Segment-aware: "/me" must not match "/members".
export const isActive = (pathname: string, href: string, exact?: boolean) =>
  pathname === href || (!exact && pathname.startsWith(`${href}/`));

/**
 * Studio's icon sidebar. `rail`: 48px of icons that expands to 208px (on hover, or always, per the user's choice).
 * `sheet`: the same items, always labelled, for the phone menu.
 */
export function OrgSidebar({
  orgId,
  variant = "rail",
  expanded = false,
  mode,
  onModeChange,
}: {
  orgId: string;
  variant?: "rail" | "sheet";
  /** Rail only: labels visible. */
  expanded?: boolean;
  mode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
}) {
  const pathname = usePathname();
  const org = useOrg(orgId);
  const showLabels = variant === "sheet" || expanded;
  const groups = orgNavGroups(orgId, org.isAdmin);

  return (
    <nav aria-label="Organization" className="flex h-full flex-col gap-1 overflow-hidden px-2 py-2">
      {groups.map((group, gi) => (
        <div key={group[0]?.href ?? gi} className="flex flex-col gap-0.5">
          {gi > 0 && <Separator className="mx-auto my-1.5 data-[orientation=horizontal]:w-[calc(100%-0.5rem)]" />}
          {group.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={showLabels ? undefined : label}
                className={cn(
                  "flex h-8 min-w-0 items-center gap-2.5 rounded-md px-1.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-selection font-medium text-foreground"
                    : "text-foreground-lighter hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span
                  className={cn("truncate transition-opacity duration-150", showLabels ? "opacity-100" : "opacity-0")}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
      {variant === "rail" && mode && onModeChange && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Sidebar control"
            title={showLabels ? undefined : "Sidebar control"}
            className="mt-auto flex h-8 min-w-0 items-center gap-2.5 rounded-md px-1.5 text-sm whitespace-nowrap text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent"
          >
            <PanelLeft className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className={cn("truncate transition-opacity duration-150", showLabels ? "opacity-100" : "opacity-0")}>
              Sidebar control
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuLabel>Sidebar control</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={mode} onValueChange={(v) => onModeChange(v as SidebarMode)}>
              {SIDEBAR_MODES.map((m) => (
                <DropdownMenuRadioItem key={m.value} value={m.value}>
                  {m.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
