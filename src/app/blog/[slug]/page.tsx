import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCT_NAME } from "@/constants";
import { BlogPostHeader, BlogToc, blogSource, getMDXComponents, listPosts, PostNav, summarize } from "@/features/docs";

type Props = { params: Promise<{ slug: string }> };

/**
 * FR-DOC-010: one post. The article (reading width) with an "On this page" rail on wide screens, a reading-progress
 * line under the header, and the newer / older post at the end. Phones get the headings as a fold-out list instead.
 */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  const MDX = page.data.body;
  const posts = await listPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  const toc = page.data.toc;
  return (
    <>
      <div className="blog-progress" aria-hidden="true" />
      {/* `nd-page` gives posts the same reading styles as the docs (globals.css). */}
      <main
        id="nd-page"
        data-blog-post
        className="mx-auto grid w-full max-w-6xl gap-x-14 px-4 pt-12 pb-24 sm:px-6 xl:grid-cols-[minmax(0,1fr)_15rem]"
      >
        <article className="min-w-0">
          <BlogPostHeader post={await summarize(page)} />
          {toc.length > 0 && (
            <details className="group mb-10 rounded-xl border border-fd-border bg-fd-card xl:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-fd-muted-foreground">
                On this page
                <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="flex flex-col gap-1 border-t border-fd-border px-4 py-3 text-sm">
                {toc.map((t) => (
                  <li key={t.url} className={t.depth > 2 ? "ps-4" : undefined}>
                    <a href={t.url} className="block py-1 text-fd-muted-foreground hover:text-fd-foreground">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="prose">
            <MDX components={getMDXComponents()} />
          </div>
          <PostNav newer={i > 0 ? posts[i - 1] : undefined} older={i >= 0 ? posts[i + 1] : undefined} />
        </article>
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <BlogToc toc={toc} />
          </div>
        </aside>
      </main>
    </>
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
