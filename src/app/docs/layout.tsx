import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { DOCS_SEARCH_PATH } from "@/constants";
import { docsLayoutOptions, source } from "@/features/docs";

/** FR-DOC-001: public, static documentation. Dark only: `dark` is set on <html> by the root layout (no theme script). */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }} search={{ options: { type: "static", api: DOCS_SEARCH_PATH } }}>
      <DocsLayout tree={source.getPageTree()} tabMode="top" {...docsLayoutOptions}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
