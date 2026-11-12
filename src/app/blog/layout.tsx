import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { BLOG_PATH, DOCS_PATH, DOCS_SEARCH_PATH, PRODUCT_NAME } from "@/constants";
import { docsLayoutOptions } from "@/features/docs";

/** FR-DOC-010: the public blog, in the docs' look (dark only), with the same top links and search. */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }} search={{ options: { type: "static", api: DOCS_SEARCH_PATH } }}>
      <HomeLayout
        {...docsLayoutOptions}
        nav={{
          ...docsLayoutOptions.nav,
          title: (
            <span className="flex items-center gap-2 font-semibold">
              {PRODUCT_NAME}
              <span className="rounded-md bg-violet-400/15 px-1.5 py-0.5 text-xs font-medium text-violet-300">
                blog
              </span>
            </span>
          ),
          url: BLOG_PATH,
        }}
        links={[
          { type: "main", text: "Docs", url: DOCS_PATH },
          ...(docsLayoutOptions.links ?? []).filter((l) => !("url" in l) || l.url !== BLOG_PATH),
        ]}
      >
        {children}
      </HomeLayout>
    </RootProvider>
  );
}
