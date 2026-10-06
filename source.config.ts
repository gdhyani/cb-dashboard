import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // `status` → badge in the sidebar (statusBadgesPlugin) and next to the page title (FR-DOC-006, FR-DOC-009).
    schema: frontmatterSchema.extend({ status: z.enum(["beta", "coming-soon"]).optional() }),
  },
});

export default defineConfig();
