import { type NextRequest, NextResponse } from "next/server";
import { APP_HOME_PATH, LOGIN_PATH, SESSION_COOKIE } from "@/constants";

/**
 * Next 16 proxy (formerly middleware). Every matched app page sends signed-out visitors to /login. `/` is the public
 * landing page for everyone, signed in or not (v1.69), so it is not matched.
 */
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE);
  const url = request.nextUrl.clone();
  if (signedIn) return NextResponse.next();
  url.pathname = LOGIN_PATH;
  const wanted = request.nextUrl.pathname + request.nextUrl.search;
  url.search = wanted === APP_HOME_PATH ? "" : `?next=${encodeURIComponent(wanted)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard", "/orgs/:path*", "/device", "/no-organization"] };
