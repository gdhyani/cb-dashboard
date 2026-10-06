import type { DocStatus } from "../components/status-badge";

export type PlatformGroup = "frameworks" | "tooling" | "coming-soon";
export type Platform = { slug: string; name: string; group: PlatformGroup; status: DocStatus; logo: string };

/**
 * One list for the support matrix and the content test (FR-DOC-009). Page = /docs/platforms/<slug>.
 * Supported = covered by the cb-env end-to-end suite; Beta = runs on Node.js under `cb run`, not yet in that suite.
 */
export const PLATFORMS: Platform[] = [
  { slug: "nextjs", name: "Next.js", group: "frameworks", status: "supported", logo: "nextdotjs" },
  { slug: "node-express", name: "Node.js (Express)", group: "frameworks", status: "supported", logo: "nodedotjs" },
  { slug: "nestjs", name: "NestJS", group: "frameworks", status: "supported", logo: "nestjs" },
  { slug: "vite", name: "Vite", group: "frameworks", status: "beta", logo: "vite" },
  { slug: "react-spa", name: "React (single-page app)", group: "frameworks", status: "beta", logo: "react" },
  { slug: "react-router", name: "React Router / Remix", group: "frameworks", status: "beta", logo: "reactrouter" },
  { slug: "sveltekit", name: "SvelteKit", group: "frameworks", status: "beta", logo: "svelte" },
  { slug: "nuxt", name: "Nuxt", group: "frameworks", status: "beta", logo: "nuxt" },
  { slug: "astro", name: "Astro", group: "frameworks", status: "beta", logo: "astro" },
  { slug: "node-frameworks", name: "Fastify, Koa, Hono", group: "frameworks", status: "beta", logo: "fastify" },
  { slug: "test-runners", name: "Vitest, Jest, Playwright", group: "tooling", status: "beta", logo: "vitest" },
  { slug: "node-tooling", name: "tsx, nodemon, Prisma CLI", group: "tooling", status: "beta", logo: "prisma" },
  { slug: "bun", name: "Bun", group: "coming-soon", status: "coming-soon", logo: "bun" },
  { slug: "deno", name: "Deno", group: "coming-soon", status: "coming-soon", logo: "deno" },
  { slug: "python", name: "Python", group: "coming-soon", status: "coming-soon", logo: "python" },
  { slug: "docker", name: "Docker & devcontainers", group: "coming-soon", status: "coming-soon", logo: "docker" },
];

export const platformHref = (p: Platform) => `/docs/platforms/${p.slug}`;
