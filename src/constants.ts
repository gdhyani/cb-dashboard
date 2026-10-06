export const PRODUCT_NAME = "cb";
export const PRODUCT_TAGLINE = "Credentialless development environments";
export const CORRELATION_HEADER = "x-correlation-id";
export const API_BASE_PATH = "/api";
export const CSRF_HEADER = "x-cb-csrf";
export const SESSION_COOKIE = "cb_session";
export const LOGIN_PATH = "/login";
export const CLI_COMMANDS = {
  install: "npm i -D @cb/env",
  login: "npx cb login",
  init: "npx cb init",
  run: "npm run dev",
} as const;
export const DOCS_PATH = "/docs";
/** Prebuilt local search index (outside /api/*, which is rewritten to the backend). */
export const DOCS_SEARCH_PATH = "/docs-search";
export const GITHUB_URLS = {
  env: "https://github.com/gdhyani/cb-env",
  backend: "https://github.com/gdhyani/cb-backend",
  dashboard: "https://github.com/gdhyani/cb-dashboard",
} as const;
/** "Edit this page" base: the docs content lives in the dashboard repo. */
export const DOCS_CONTENT_EDIT_URL = `${GITHUB_URLS.dashboard}/blob/main/content/docs`;
