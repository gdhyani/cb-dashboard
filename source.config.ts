import { defineCollections, defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // `status` → badge in the sidebar (statusBadgesPlugin) and next to the page title (FR-DOC-006, FR-DOC-009).
    schema: frontmatterSchema.extend({ status: z.enum(["beta", "coming-soon"]).optional() }),
    // "Copy page" and "View as Markdown" serve the processed Markdown of each page.
    postprocess: { includeProcessedMarkdown: true },
  },
});

// FR-DOC-010: the blog. YAML reads an unquoted date as a Date; keep it as the calendar day "YYYY-MM-DD".
export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    date: z.union([z.string(), z.date()]).transform((d) => (typeof d === "string" ? d : d.toISOString().slice(0, 10))),
    author: z.string(),
  }),
  postprocess: { includeProcessedMarkdown: true },
});

export default defineConfig();
