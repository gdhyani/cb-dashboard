import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/features/docs";

// FR-DOC-005: the index is built at build time and searched in the browser; no external service.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
