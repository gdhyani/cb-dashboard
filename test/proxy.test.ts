// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

describe("FR-UI-006 proxy (signed-out redirect)", () => {
  it("guards the dashboard entry", () => {
    expect(config.matcher).toContain("/dashboard");
  });

  it("sends signed-out visitors to /login with the page they wanted", () => {
    const res = proxy(new NextRequest("http://localhost:4201/orgs/o1/members?tab=2"));
    expect(res.headers.get("location")).toBe("http://localhost:4201/login?next=%2Forgs%2Fo1%2Fmembers%3Ftab%3D2");
  });

  it("does not add a pointless next for the dashboard entry", () => {
    const res = proxy(new NextRequest("http://localhost:4201/dashboard"));
    expect(res.headers.get("location")).toBe("http://localhost:4201/login");
  });

  it("lets visitors with a session cookie through", () => {
    const req = new NextRequest("http://localhost:4201/orgs/o1", { headers: { cookie: "cb_session=abc" } });
    expect(proxy(req).headers.get("location")).toBeNull();
  });
});

describe("FR-DOC-001 docs are public", () => {
  it("the sign-in proxy never matches /docs or the search index", () => {
    for (const m of config.matcher) {
      expect(m.startsWith("/docs")).toBe(false);
      expect(m).not.toBe("/:path*");
    }
  });

  it("DOCS_PATH and DOCS_SEARCH_PATH stay outside the /api rewrite", async () => {
    const { DOCS_PATH, DOCS_SEARCH_PATH, API_BASE_PATH } = await import("@/constants");
    expect(DOCS_PATH).toBe("/docs");
    expect(DOCS_SEARCH_PATH.startsWith(API_BASE_PATH)).toBe(false);
  });
});

describe("Landing page at / (v1.69)", () => {
  it("never runs the proxy on /, so everyone sees the landing page, signed in or not", () => {
    expect(config.matcher).not.toContain("/");
  });
});
