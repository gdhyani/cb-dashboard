import { notFound } from "next/navigation";
import { blogSource } from "@/features/docs";

export const revalidate = false;

/** Plain Markdown of a blog post, for "Copy Markdown" and the "Open in …" menu (FR-DOC-010). Static, like the posts. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  const body = await page.data.getText("processed");
  return new Response(`# ${page.data.title}\n\n${page.data.description ?? ""}\n\n${body}`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return blogSource.getPages().map((p) => ({ slug: p.slugs[0] }));
}
