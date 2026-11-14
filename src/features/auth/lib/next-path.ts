import { APP_HOME_PATH } from "@/constants";

/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = APP_HOME_PATH): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
