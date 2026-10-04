import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/constants";

/** Next 16 proxy (formerly middleware): send signed-out visitors of app pages to /login. */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/orgs/:path*", "/device"] };
