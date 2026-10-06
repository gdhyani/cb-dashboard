"use client";

import { ArrowUpCircle, MessageSquareWarning } from "lucide-react";
import { GITHUB_URLS } from "@/constants";

const LINK = "flex items-center gap-2 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground";

/** Quiet links under "On this page" (eve.dev style): back to top, and where to report a problem with the docs. */
export function TocFooter() {
  return (
    <div className="mt-4 flex flex-col gap-2.5 border-t border-fd-border pt-4">
      <button type="button" className={LINK} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUpCircle className="size-4" aria-hidden="true" /> Scroll to top
      </button>
      <a className={LINK} href={`${GITHUB_URLS.dashboard}/issues/new/choose`} target="_blank" rel="noreferrer">
        <MessageSquareWarning className="size-4" aria-hidden="true" /> Report a problem
      </a>
    </div>
  );
}
