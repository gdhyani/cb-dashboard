import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCT_NAME } from "@/constants";
import { BlogPostHeader, blogSource, getMDXComponents, summarize } from "@/features/docs";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    // `nd-page` gives posts the same reading styles as the docs (globals.css).
    <main id="nd-page" data-blog-post className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <article>
        <BlogPostHeader post={await summarize(page)} />
        <div className="prose">
          <MDX components={getMDXComponents()} />
        </div>
      </article>
    </main>
  );
}

export function generateStaticParams() {
  return blogSource.getPages().map((p) => ({ slug: p.slugs[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  return { title: `${page.data.title} — ${PRODUCT_NAME} blog`, description: page.data.description };
}
