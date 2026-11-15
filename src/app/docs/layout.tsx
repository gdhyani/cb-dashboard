import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { AppProviders } from "@/shared/providers/app-providers";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";
import { DOCS_SEARCH_PATH } from "@/constants";
import { docsLayoutOptions, docsThemeOptions, source } from "@/features/docs";
import { BackToTop } from "@/features/docs/components/back-to-top";
import { DocsSidebarTrigger } from "@/features/docs/components/docs-sidebar-trigger";
import { SiteHeader } from "@/features/docs/components/site-header";

/**
 * FR-DOC-001: public, static documentation. The site header (shared with the blog) + one sidebar tree (Introduction
 * always visible, sections as accordions). Dark, light or system, shared with the whole site (`cb-theme`).
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <RootProvider theme={docsThemeOptions} search={{ options: { type: "static", api: DOCS_SEARCH_PATH } }}>
        <DocsLayout
          tree={source.getPageTree()}
          {...docsLayoutOptions}
          nav={{
            ...docsLayoutOptions.nav,
            mode: "top",
            // Same placement classes as Fumadocs' own notebook header (grid area, sticky row, header height).
            component: (
              <SiteHeader
                section="docs"
                mobileMenu={<DocsSidebarTrigger />}
                className="sticky top-(--fd-docs-row-1) [grid-area:header] layout:[--fd-header-height:--spacing(14)]"
              />
            ),
          }}
          tabs={false}
          sidebar={{ defaultOpenLevel: 0, collapsible: false }}
        >
          {children}
          <BackToTop />
        </DocsLayout>
      </RootProvider>
    </AppProviders>
  );
}
