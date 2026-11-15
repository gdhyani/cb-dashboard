"use client";

import { AnchorProvider, TOCItem, type TOCItemType } from "fumadocs-core/toc";
import { AlignLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TocFooter } from "../toc-footer";

/**
 * A post's "On this page" rail (wide screens): its headings with the one being read marked by the highlighter bar, then
 * Scroll to top and Report a problem — the same as the docs' table of contents.
 */
export function BlogToc({ toc }: { toc: TOCItemType[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      {toc.length > 0 && (
        <>
          <p className="mb-3 flex items-center gap-2 text-fd-muted-foreground">
            <AlignLeft className="size-4" aria-hidden="true" /> On this page
          </p>
          <AnchorProvider toc={toc} single>
            <ul className="flex flex-col border-s border-fd-border">
              {toc.map((item) => (
                <li key={item.url}>
                  <TOCItem
                    href={item.url}
                    className={cn(
                      "-ms-px block border-s-2 border-transparent py-1.5 pe-2 leading-snug text-fd-muted-foreground transition-colors hover:text-fd-foreground",
                      "data-[active=true]:border-mark data-[active=true]:text-fd-foreground",
                      item.depth <= 2 ? "ps-3" : "ps-6",
                    )}
                  >
                    {item.title}
                  </TOCItem>
                </li>
              ))}
            </ul>
          </AnchorProvider>
        </>
      )}
      <TocFooter />
    </nav>
  );
}
