import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/notebook/page";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS_MARKDOWN_PATH, PRODUCT_NAME } from "@/constants";
import { getMDXComponents, SectionHero, StatusBadge, source } from "@/features/docs";
import { TocFooter } from "@/features/docs/components/toc-footer";

type Props = { params: Promise<{ slug?: string[] }> };

const markdownUrl = (slug?: string[]) => `${DOCS_MARKDOWN_PATH}/${slug?.length ? slug.join("/") : "index"}`;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const isHome = !slug?.length;
  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{ footer: <TocFooter /> }}
      tableOfContentPopover={{ footer: <TocFooter inPopover /> }}
    >
      {isHome ? (
        <SectionHero
          section="docs"
          kicker={`Documentation for ${PRODUCT_NAME}`}
          lede={`Set up ${PRODUCT_NAME}, add your services once, and run your app with placeholder keys. The real keys stay on the ${PRODUCT_NAME} server.`}
          className="mb-4"
        >
          <Link
            href="/docs/quick-start"
            className="inline-flex h-9 items-center rounded-md bg-mark px-4 text-sm font-medium text-mark-ink transition-[filter,transform] hover:brightness-105 active:scale-[0.97]"
          >
            Quick start
          </Link>
          <Link
            href="/docs/overview/how-it-works"
            className="inline-flex h-9 items-center rounded-md border border-fd-border px-4 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            How it works
          </Link>
          <MarkdownCopyButton markdownUrl={markdownUrl(slug)} />
          <ViewOptionsPopover markdownUrl={markdownUrl(slug)} />
        </SectionHero>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <DocsTitle>{page.data.title}</DocsTitle>
              {page.data.status && <StatusBadge status={page.data.status} />}
            </div>
            {/* "Copy page" for pasting into an AI assistant, plus view/open options (eve.dev style). */}
            <div className="flex items-center gap-2">
              <MarkdownCopyButton markdownUrl={markdownUrl(slug)} />
              <ViewOptionsPopover markdownUrl={markdownUrl(slug)} />
            </div>
          </div>
          <DocsDescription>{page.data.description}</DocsDescription>
        </>
      )}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: `${page.data.title} — ${PRODUCT_NAME} docs`, description: page.data.description };
}
