import { DocsBody, DocsDescription, DocsPage, DocsTitle, EditOnGitHub } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOCS_CONTENT_EDIT_URL, PRODUCT_NAME } from "@/constants";
import { getMDXComponents, StatusBadge, source } from "@/features/docs";

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <div className="flex flex-wrap items-center gap-3">
        <DocsTitle>{page.data.title}</DocsTitle>
        {page.data.status && <StatusBadge status={page.data.status} />}
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
      <EditOnGitHub href={`${DOCS_CONTENT_EDIT_URL}/${page.path}`} />
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
