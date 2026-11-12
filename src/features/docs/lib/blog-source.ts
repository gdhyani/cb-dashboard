import { blog } from "@source/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { BLOG_PATH } from "@/constants";
import { readingMinutes, sortPosts } from "./blog";

/** FR-DOC-010: blog posts from content/blog, served at /blog/<file name>. */
export const blogSource = loader({ baseUrl: BLOG_PATH, source: toFumadocsSource(blog, []) });

export type BlogPostSummary = {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string;
  author: string;
  minutes: number;
};

export async function summarize(page: ReturnType<typeof blogSource.getPages>[number]): Promise<BlogPostSummary> {
  return {
    slug: page.slugs[0],
    url: page.url,
    title: page.data.title,
    description: page.data.description ?? "",
    date: page.data.date,
    author: page.data.author,
    minutes: readingMinutes(await page.data.getText("processed")),
  };
}

export async function listPosts(): Promise<BlogPostSummary[]> {
  return sortPosts(await Promise.all(blogSource.getPages().map(summarize)));
}
