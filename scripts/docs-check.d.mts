export type DocPage = { file: string; rel: string; frontmatter: Record<string, string>; body: string };
export function listPages(root: string): DocPage[];
export function brokenLinks(pages: DocPage[]): string[];
export function imageProblems(pages: DocPage[], publicDir: string): string[];
export function forbidden(pages: DocPage[]): string[];
export function betaMismatches(pages: DocPage[], catalog: { slug: string; group: string; beta: boolean }[]): string[];
