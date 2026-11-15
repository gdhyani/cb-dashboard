import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GatewayOverheadChart } from "@/features/docs/components/blog/gateway-overhead-chart";
import { GATEWAY_OVERHEAD } from "@/features/docs/lib/blog-data";
import { getMDXComponents } from "@/features/docs/mdx-components";

/** FR-DOC-010 (M7, PRD v1.61): the blog describes the architecture as it is after hardening. */
const blogRoot = path.resolve(import.meta.dirname, "../../../content/blog");
const read = (slug: string) => fs.readFileSync(path.join(blogRoot, `${slug}.mdx`), "utf8");
const all = fs
  .readdirSync(blogRoot)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => read(f.replace(/\.mdx$/, "")));

describe("FR-DOC-010 blog matches the hardened architecture (M7)", () => {
  it("no post says cb run loads the preload with --require by default (OQ6: --import)", () => {
    for (const text of all) {
      expect(text).not.toMatch(/NODE_OPTIONS="?--require/);
      expect(text).not.toMatch(/loaded into the app with `NODE_OPTIONS=--require`/);
    }
    expect(read("inside-cb")).toContain("--import file://");
  });

  it("the request-target guard is explained where the real key is used", () => {
    expect(read("how-a-key-travels")).toContain("cb_bad_request_target");
    expect(read("inside-cb")).toContain("cb_bad_request_target");
  });

  it("login protection names the limits and the proxy setting", () => {
    const text = read("inside-cb");
    expect(text).toMatch(/10 failed logins/);
    expect(text).toContain("TRUST_PROXY");
    expect(text).toMatch(/reuse/i);
  });

  it("shared Layer 2 hosts: each service is checked and revoked on its own", () => {
    expect(read("network-model")).toMatch(/shares? (a|the|one) host/i);
    expect(read("network-model")).toContain("each service");
  });

  it("the measured overhead is published as a chart with the T2 numbers", () => {
    expect(read("inside-cb")).toContain("<GatewayOverheadChart />");
    expect(getMDXComponents().GatewayOverheadChart).toBeDefined();
    render(<GatewayOverheadChart />);
    expect(screen.getAllByTestId("hbar")).toHaveLength(GATEWAY_OVERHEAD.length);
    expect(GATEWAY_OVERHEAD.every((d) => d.value < 3)).toBe(true);
  });
});
