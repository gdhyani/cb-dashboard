import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { DOCS_SEARCH_PATH } from "@/constants";
import { docsLayoutOptions, source } from "@/features/docs";
import { BackToTop } from "@/features/docs/components/back-to-top";

/**
 * FR-DOC-001: public, static documentation. Top bar + one sidebar tree (Introduction always visible, sections as
 * accordions). Dark only: `dark` is set on <html> by the root layout (no theme script).
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }} search={{ options: { type: "static", api: DOCS_SEARCH_PATH } }}>
      <DocsLayout
        tree={source.getPageTree()}
        {...docsLayoutOptions}
        nav={{ ...docsLayoutOptions.nav, mode: "top" }}
        tabs={false}
        sidebar={{ defaultOpenLevel: 0, collapsible: false }}
      >
        {children}
        <BackToTop />
      </DocsLayout>
    </RootProvider>
  );
}
