import { notFound } from "next/navigation";
import { source } from "@/features/docs";

export const revalidate = false;

/** Plain Markdown of a docs page, for "Copy page" and "View as Markdown". Static, like the pages themselves. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug?.[0] === "index" && slug.length === 1 ? [] : slug);
  if (!page) notFound();
  const body = await page.data.getText("processed");
  return new Response(`# ${page.data.title}\n\n${page.data.description ?? ""}\n\n${body}`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return [{ slug: ["index"] }, ...source.generateParams().filter((p) => p.slug.length > 0)];
}
