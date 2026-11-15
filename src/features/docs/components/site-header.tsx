"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_HOME_PATH, BLOG_PATH, DOCS_PATH, GITHUB_URLS, PRODUCT_NAME } from "@/constants";
import { cn } from "@/shared/lib/utils";
import { GithubMark } from "./github-mark";
import { SiteThemeToggle } from "./site-theme-toggle";

type Section = "docs" | "blog";

const SECTIONS: { id: Section; label: string; href: string }[] = [
  { id: "docs", label: "Docs", href: DOCS_PATH },
  { id: "blog", label: "Blog", href: BLOG_PATH },
];

const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground";

/**
 * One header for the docs and the blog (FR-DOC-001, FR-DOC-010): the cb mark and the section tag, Docs / Blog with the
 * current one underlined in the highlighter yellow, search (⌘K), GitHub, the site theme switcher and "Open dashboard".
 * Phones keep the mark, search, theme and a menu button (`mobileMenu`: the docs sidebar drawer, or the blog's menu).
 * `className` carries the layout placement (the docs grid area, or a plain sticky bar on the blog).
 */
export function SiteHeader({
  section,
  mobileMenu,
  className,
}: {
  section: Section;
  mobileMenu: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const { setOpenSearch, enabled: searchEnabled } = useSearchContext();
  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  return (
    <header className={cn("z-30 bg-fd-background/85 backdrop-blur-md", className)} data-site-header="">
      {/* Same width as the docs frame (Fumadocs' 97rem), so the bar lines up on the docs and the blog. */}
      <div className="mx-auto flex h-14 w-full max-w-[97rem] items-center gap-2 border-b border-fd-border px-4 md:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-fd-foreground transition-opacity hover:opacity-80"
          aria-label={`${PRODUCT_NAME} home`}
        >
          {PRODUCT_NAME}
        </Link>
        <Link
          href={current?.href ?? DOCS_PATH}
          className="rounded-[3px] bg-mark px-1.5 py-0.5 font-mono text-xs leading-none text-mark-ink transition-transform hover:-rotate-2"
        >
          {section}
        </Link>

        <nav aria-label="Site sections" className="ms-5 hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => {
            const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
            return (
              <Link
                key={s.id}
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  "after:absolute after:inset-x-2.5 after:-bottom-[11px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-mark after:transition-transform",
                  "hover:text-fd-foreground hover:after:scale-x-100",
                  active ? "text-fd-foreground after:scale-x-100" : "text-fd-muted-foreground",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>

        {searchEnabled && (
          <button
            type="button"
            onClick={() => setOpenSearch(true)}
            className="ms-auto hidden h-9 w-full max-w-64 items-center gap-2 rounded-md border border-fd-border bg-fd-muted/50 ps-3 pe-1.5 text-sm text-fd-muted-foreground transition-colors hover:border-border-strong hover:text-fd-foreground md:flex lg:max-w-72"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-start">Search docs and blog</span>
            <kbd className="rounded border border-fd-border bg-fd-background px-1.5 font-mono text-[11px] leading-5">
              ⌘K
            </kbd>
          </button>
        )}

        <div className={cn("flex items-center gap-1", searchEnabled ? "ms-auto md:ms-2" : "ms-auto")}>
          {searchEnabled && (
            <button
              type="button"
              onClick={() => setOpenSearch(true)}
              aria-label="Search"
              className={cn(ICON_BUTTON, "md:hidden")}
            >
              <Search className="size-4" strokeWidth={1.5} />
            </button>
          )}
          <a
            href={GITHUB_URLS.env}
            target="_blank"
            rel="noreferrer"
            aria-label="cb on GitHub"
            className={cn(ICON_BUTTON, "max-sm:hidden")}
          >
            <GithubMark className="size-4" />
          </a>
          <SiteThemeToggle className="text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground data-[state=open]:bg-fd-accent" />
          <Link
            href={APP_HOME_PATH}
            className="ms-1.5 hidden h-8 items-center gap-1 rounded-md bg-mark px-3 text-sm font-medium text-mark-ink transition-[filter,transform] hover:brightness-105 active:scale-[0.97] md:inline-flex"
          >
            Open dashboard
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
          <div className="md:hidden">{mobileMenu}</div>
        </div>
      </div>
    </header>
  );
}
