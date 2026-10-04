"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { CommandMenu, SearchButton, useCommandShortcut } from "@/features/search/components/command-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { useOrg } from "../hooks/use-orgs";
import { OrgSidebar } from "./org-sidebar";

export function OrgShell({ orgId, children }: { orgId: string; children: ReactNode }) {
  const pathname = usePathname();
  const org = useOrg(orgId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandShortcut(openSearch);
  // Navigating from the mobile menu closes it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: close on every route change
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border md:block">
        <OrgSidebar orgId={orgId} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              className="-ml-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent showClose={false}>
              <SheetTitle>Navigation</SheetTitle>
              <OrgSidebar orgId={orgId} onClose={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="min-w-0 flex-1 truncate font-medium md:hidden">{org.data?.name}</span>
          <SearchButton
            onClick={openSearch}
            className="w-10 justify-center px-0 sm:w-64 sm:justify-start sm:px-3 md:ml-auto [&>span:first-of-type]:hidden sm:[&>span:first-of-type]:inline"
          />
        </header>
        <main className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-10 px-4 py-8 sm:px-6 md:py-10">
          {children}
        </main>
      </div>
      <CommandMenu orgId={orgId} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
