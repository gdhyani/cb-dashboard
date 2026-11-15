import type { ReactNode } from "react";
import { PRODUCT_NAME } from "@/constants";
import { cn } from "@/shared/lib/utils";

/**
 * FR-DOC-001 / FR-DOC-010: the big title block on the docs home and the blog home, in the landing page's display type
 * (heavy Archivo, tight tracking) with the section word on the highlighter yellow, so a reader knows at a glance which
 * part of the site they are on. The drawing on the right is decorative (`aria-hidden`) and only shows when the block is wide (container query).
 */
export function SectionHero({
  section,
  kicker,
  lede,
  children,
  className,
}: {
  section: "docs" | "blog";
  kicker: string;
  lede: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("@container relative isolate mb-12 border-b border-fd-border pb-10", className)}
      data-section-hero={section}
    >
      <div
        aria-hidden
        className="cb-grid pointer-events-none absolute inset-x-0 -top-12 bottom-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_80%_at_85%_30%,#000,transparent)]"
      />
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2.5 font-mono text-xs text-fd-muted-foreground">
            <span aria-hidden className="size-2 rounded-full bg-mark shadow-[0_0_0_4px_var(--dg-ph-soft)]" />
            {kicker}
          </p>
          <h1 className="mt-5 -ms-[0.04em] text-[clamp(3rem,1.4rem+5.2vw,6rem)] font-[760] leading-[0.92] tracking-[-0.045em] text-fd-foreground [font-variation-settings:'wdth'_100]">
            The {PRODUCT_NAME}{" "}
            <span className="inline-block -rotate-2 rounded-[0.08em] bg-mark px-[0.1em] pb-[0.04em] text-mark-ink">
              {section}
            </span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-fd-muted-foreground sm:text-xl">{lede}</p>
          {children && <div className="mt-8 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        <div aria-hidden className="hidden shrink-0 @3xl:block">
          {section === "docs" ? <DocsArt /> : <BlogArt />}
        </div>
      </div>
    </header>
  );
}

const mono = { fontFamily: "var(--brand-font-mono)" } as const;

/** A stack of manual pages: the front one open at "Quick start", with a `cb run` line on the yellow. */
function DocsArt() {
  return (
    <svg viewBox="0 0 240 230" className="w-52 xl:w-60" role="presentation">
      <rect x="44" y="6" width="176" height="200" rx="8" fill="var(--dg-panel-2)" stroke="var(--dg-line)" />
      <rect x="30" y="16" width="176" height="200" rx="8" fill="var(--dg-panel-2)" stroke="var(--dg-line)" />
      <rect x="16" y="26" width="176" height="200" rx="8" fill="var(--dg-panel)" stroke="var(--dg-line-strong)" />
      <text x="32" y="54" fontSize="10" fill="var(--dg-ph)" style={mono}>
        § 01
      </text>
      <rect x="32" y="64" width="104" height="9" rx="2" fill="var(--dg-ink-2)" />
      <rect x="32" y="84" width="140" height="5" rx="2" fill="var(--dg-line)" />
      <rect x="32" y="96" width="124" height="5" rx="2" fill="var(--dg-line)" />
      <rect x="32" y="108" width="132" height="5" rx="2" fill="var(--dg-line)" />
      <rect x="32" y="126" width="144" height="30" rx="4" fill="var(--dg-ph-soft)" stroke="var(--dg-ph)" />
      <text x="42" y="145" fontSize="11" fill="var(--dg-ink)" style={mono}>
        $ cb run npm dev
      </text>
      <rect x="32" y="172" width="120" height="5" rx="2" fill="var(--dg-line)" />
      <rect x="32" y="184" width="96" height="5" rx="2" fill="var(--dg-line)" />
      <path d="M168 26h16v26l-8-6-8 6z" fill="var(--color-mark)" />
    </svg>
  );
}

/** A fan of post cards: the front one dated, with a cover drawing of a placeholder key turning into a real call. */
function BlogArt() {
  return (
    <svg viewBox="0 0 260 230" className="w-56 xl:w-64" role="presentation">
      <g transform="rotate(-8 130 120)">
        <rect x="40" y="20" width="170" height="190" rx="8" fill="var(--dg-panel-2)" stroke="var(--dg-line)" />
      </g>
      <g transform="rotate(5 130 120)">
        <rect x="50" y="20" width="170" height="190" rx="8" fill="var(--dg-panel-2)" stroke="var(--dg-line)" />
      </g>
      <rect x="44" y="22" width="170" height="194" rx="8" fill="var(--dg-panel)" stroke="var(--dg-line-strong)" />
      <rect x="56" y="34" width="146" height="78" rx="5" fill="var(--dg-panel-2)" stroke="var(--dg-line)" />
      <rect x="68" y="62" width="44" height="22" rx="3" fill="var(--dg-ph-soft)" stroke="var(--dg-ph)" />
      <path
        d="M114 73c10-12 18 12 28 0s18 12 28 0"
        fill="none"
        stroke="var(--color-mark)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="184" cy="73" r="6" fill="none" stroke="var(--dg-ok)" strokeWidth="2" />
      <text x="56" y="132" fontSize="10" fill="var(--dg-ph)" style={mono}>
        NEW POST
      </text>
      <rect x="56" y="142" width="132" height="9" rx="2" fill="var(--dg-ink-2)" />
      <rect x="56" y="157" width="96" height="9" rx="2" fill="var(--dg-ink-2)" />
      <rect x="56" y="178" width="140" height="5" rx="2" fill="var(--dg-line)" />
      <rect x="56" y="190" width="118" height="5" rx="2" fill="var(--dg-line)" />
    </svg>
  );
}
