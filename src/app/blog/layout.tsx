import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { BLOG_PATH, DOCS_SEARCH_PATH } from "@/constants";
import { docsLayoutOptions, docsThemeOptions } from "@/features/docs";
import { BackToTop } from "@/features/docs/components/back-to-top";
import { BlogMenu } from "@/features/docs/components/blog/blog-menu";
import { SiteHeader } from "@/features/docs/components/site-header";

/** FR-DOC-010: the public blog, with the docs' header, search and theme (one site). */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={docsThemeOptions} search={{ options: { type: "static", api: DOCS_SEARCH_PATH } }}>
      <HomeLayout
        {...docsLayoutOptions}
        nav={{
          url: BLOG_PATH,
          component: <SiteHeader section="blog" mobileMenu={<BlogMenu />} className="sticky top-0" />,
        }}
      >
        {children}
        <BackToTop />
      </HomeLayout>
    </RootProvider>
  );
}
