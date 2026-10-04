/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
