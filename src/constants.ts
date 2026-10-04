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
