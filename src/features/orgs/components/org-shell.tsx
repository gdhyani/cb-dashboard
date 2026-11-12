"use client";

import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { DOCS_PATH, PRODUCT_NAME } from "@/constants";
import { EnvironmentSwitcher, ProjectSwitcher } from "@/features/projects";
import { CommandMenu, SearchButton, useCommandShortcut } from "@/features/search/components/command-menu";
import { cn } from "@/shared/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { useOrg } from "../hooks/use-orgs";
import { useSidebarMode } from "../hooks/use-sidebar-mode";
import { OrgSidebar } from "./org-sidebar";
import { OrgUnavailable } from "./org-unavailable";
import { UserMenu } from "./user-menu";

/** The `/` between breadcrumb switchers in the top bar. */
function Divider({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("shrink-0 text-lg font-light text-border-stronger select-none", className)}>
      /
    </span>
  );
}

/** Product mark: the only place the brand green appears as decoration. */
function ProductMark() {
  return (
    <span className="flex size-6 items-center justify-center rounded-md bg-brand font-mono text-[11px] font-semibold text-[#0b1f15]">
      {PRODUCT_NAME.slice(0, 2)}
    </span>
  );
}

/**
 * Supabase Studio shell: a 48px top bar (product mark / org / project / environment, then search, docs and the
 * account menu), a left icon rail (48px, expands to 208px), and the page area. Phones get a menu sheet instead of
 * the rail; the project switcher stays in the top bar on every size (FR-UI-007).
 */
export function OrgShell({ orgId, children }: { orgId: string; children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string; envId?: string }>();
  const org = useOrg(orgId);
  const { mode, setMode } = useSidebarMode();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandShortcut(openSearch);
  // biome-ignore lint/correctness/useExhaustiveDependencies: close the phone menu on every route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const expanded = mode === "expanded" || (mode === "hover" && hovered);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-overlay px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-background pr-3 pl-2 md:pl-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="flex size-8 items-center justify-center rounded-md text-foreground-lighter hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </SheetTrigger>
          <SheetContent showClose={false}>
            <SheetTitle>Navigation</SheetTitle>
            <div className="flex h-12 items-center gap-2 border-b border-border px-4">
              <ProductMark />
              <span className="truncate text-sm text-foreground">{org.data?.name}</span>
            </div>
            <OrgSidebar orgId={orgId} variant="sheet" />
          </SheetContent>
        </Sheet>
        <Link href={`/orgs/${orgId}`} aria-label={`${PRODUCT_NAME} home`} className="hidden shrink-0 md:block">
          <ProductMark />
        </Link>
        <Divider className="hidden md:inline" />
        <Link
          href={`/orgs/${orgId}`}
          className="hidden max-w-40 truncate rounded-md px-1.5 py-1 text-sm text-foreground-light transition-colors hover:text-foreground md:block"
        >
          {org.data?.name}
        </Link>
        <Divider className="hidden md:inline" />
        <div className="flex min-w-0 items-center gap-1.5">
          <ProjectSwitcher orgId={orgId} canCreate={org.isAdmin} />
          {params.projectId && params.envId && (
            <>
              <Divider />
              <EnvironmentSwitcher orgId={orgId} projectId={params.projectId} envId={params.envId} />
            </>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <SearchButton onClick={openSearch} />
          <Link
            href={DOCS_PATH}
            aria-label="Docs"
            title="Docs"
            className="hidden size-8 items-center justify-center rounded-md text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground sm:flex"
          >
            <BookOpen className="size-4" strokeWidth={1.5} />
          </Link>
          <UserMenu orgId={orgId} />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "sticky top-12 hidden h-[calc(100dvh-3rem)] shrink-0 transition-[width] duration-200 md:block",
            mode === "expanded" ? "w-52" : "w-12",
          )}
        >
          {/* In "Expand on hover" the panel grows over the page instead of pushing it. Keyboard focus expands it too. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover/focus only widen the panel; the links inside are the controls */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovered(false)}
            className={cn(
              "absolute inset-y-0 left-0 z-30 border-r border-border bg-background transition-[width,box-shadow] duration-200",
              expanded ? "w-52" : "w-12",
              mode === "hover" && hovered && "shadow-floating",
            )}
          >
            <OrgSidebar orgId={orgId} expanded={expanded} mode={mode} onModeChange={setMode} />
          </div>
        </aside>
        <main id="main" className="flex min-w-0 flex-1 flex-col">
          {org.error ? <OrgUnavailable error={org.error} /> : children}
        </main>
      </div>
      <CommandMenu orgId={orgId} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
