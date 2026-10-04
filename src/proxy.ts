import { type NextRequest, NextResponse } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE } from "@/constants";

/** Next 16 proxy (formerly middleware): send signed-out visitors of app pages to /login. */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  const wanted = request.nextUrl.pathname + request.nextUrl.search;
  url.search = wanted === "/" ? "" : `?next=${encodeURIComponent(wanted)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/", "/orgs/:path*", "/device"] };
