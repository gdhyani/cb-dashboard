// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

describe("FR-UI-006 proxy (signed-out redirect)", () => {
  it("guards the home page too", () => {
    expect(config.matcher).toContain("/");
  });

  it("sends signed-out visitors to /login with the page they wanted", () => {
    const res = proxy(new NextRequest("http://localhost:4201/orgs/o1/members?tab=2"));
    expect(res.headers.get("location")).toBe("http://localhost:4201/login?next=%2Forgs%2Fo1%2Fmembers%3Ftab%3D2");
  });

  it("does not add a pointless next for the home page", () => {
    const res = proxy(new NextRequest("http://localhost:4201/"));
    expect(res.headers.get("location")).toBe("http://localhost:4201/login");
  });

  it("lets visitors with a session cookie through", () => {
    const req = new NextRequest("http://localhost:4201/orgs/o1", { headers: { cookie: "cb_session=abc" } });
    expect(proxy(req).headers.get("location")).toBeNull();
  });
});
