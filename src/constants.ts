export const PRODUCT_NAME = "cb";
export const PRODUCT_TAGLINE = "Credentialless development environments";
export const CORRELATION_HEADER = "x-correlation-id";
export const API_BASE_PATH = "/api";
export const CSRF_HEADER = "x-cb-csrf";
export const SESSION_COOKIE = "cb_session";
export const LOGIN_PATH = "/login";
/** Public product page (signed-out visitors). */
export const LANDING_PATH = "/";
/** Dashboard entry: sends a signed-in user to their organization (v1.63; "/" is the public landing page). */
export const APP_HOME_PATH = "/dashboard";
/** Public address of this dashboard (canonical links, sitemap). Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4201";
export const CLI_COMMANDS = {
  install: "npm i -D @cb/env",
  login: "npx cb login",
  init: "npx cb init",
  run: "npm run dev",
} as const;
export const DOCS_PATH = "/docs";
/** FR-DOC-010: public blog next to the docs. */
export const BLOG_PATH = "/blog";
/** Prebuilt local search index (outside /api/*, which is rewritten to the backend). */
export const DOCS_SEARCH_PATH = "/docs-search";
export const GITHUB_URLS = {
  env: "https://github.com/gdhyani/cb-env",
  backend: "https://github.com/gdhyani/cb-backend",
  dashboard: "https://github.com/gdhyani/cb-dashboard",
} as const;
/** Plain Markdown of a docs page ("Copy page", "View as Markdown"); outside the /api rewrite. */
export const DOCS_MARKDOWN_PATH = "/docs-md";
export const GITHUB_REPO = { owner: "gdhyani", repo: "cb-env" } as const;
/** Dashboard theme choice (light / dark / system), kept per browser. */
export const THEME_STORAGE_KEY = "cb-theme";
/** Sidebar behaviour (expanded / collapsed / hover), kept per browser. */
export const SIDEBAR_STORAGE_KEY = "cb-sidebar";
/** Session flag: the first-landing splash (cb wordmark) has played in this browser tab. */
export const SPLASH_SESSION_KEY = "cb-splash";
