import type { MetadataRoute } from "next";
import { BLOG_PATH, DOCS_PATH, SITE_URL } from "@/constants";

/** The public entry points; docs and blog pages are linked from their own indexes. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}${DOCS_PATH}`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}${BLOG_PATH}`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
