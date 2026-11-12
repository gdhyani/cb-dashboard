import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnvTypeExplorer } from "@/features/docs/components/blog/env-type-explorer";
import { Sequence } from "@/features/docs/components/blog/gateway-sequences";
import { PacketLayers } from "@/features/docs/components/blog/packet-layers";
import { ENV_TYPES } from "@/features/docs/lib/env-types";
import { SEQUENCES } from "@/features/docs/lib/sequences";
import { getMDXComponents } from "@/features/docs/mdx-components";
import { listPages } from "../../../scripts/docs-check.mjs";

describe("FR-DOC-010 env type catalogue", () => {
  it("covers every family cb supports", () => {
    const ids = ENV_TYPES.map((t) => t.id);
    for (const id of ["port", "flag", "random", "visible", "postgres", "mysql", "mongodb", "redis", "supabase"]) {
      expect(ids).toContain(id);
    }
    for (const id of ["stripe", "razorpay", "ai", "api", "stripe-webhook", "razorpay-webhook", "s3", "ses", "smtp"]) {
      expect(ids).toContain(id);
    }
    for (const id of ["signin", "firebase", "apns"]) expect(ids).toContain(id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never carries a real secret on the laptop or inside the tunnel", () => {
    const bad = ENV_TYPES.flatMap((t) =>
      t.hops.filter((h) => h.real && (h.side === "laptop" || h.side === "tunnel")).map((h) => `${t.id}: ${h.proto}`),
    );
    expect(bad).toEqual([]);
  });

  it("only Shown as-is gives the app a real value", () => {
    const real = ENV_TYPES.filter((t) => t.lines.some((l) => l.kind === "real")).map((t) => t.id);
    expect(real).toEqual(["visible"]);
  });

  it("every connected type ends with exactly one real hop; local values have no hops", () => {
    for (const t of ENV_TYPES) {
      if (t.mode === "local") expect(t.hops).toEqual([]);
      else expect(t.hops.filter((h) => h.real)).toHaveLength(1);
    }
  });

  it("Layer 1 and Layer 2 types reach the agent on 127.0.0.1", () => {
    for (const t of ENV_TYPES.filter((t) => t.mode === "layer1" || t.mode === "layer2")) {
      expect(t.hops[0].proto).toMatch(/127\.0\.0\.1:\d{4}/);
    }
  });
});

describe("FR-DOC-010 sequences", () => {
  it("a real-key step never starts or ends on a laptop lane", () => {
    const bad = Object.entries(SEQUENCES).flatMap(([name, s]) =>
      s.steps
        .filter((st) => st.real && (s.lanes[st.from].side === "laptop" || s.lanes[st.to].side === "laptop"))
        .map((st) => `${name}: ${st.label}`),
    );
    expect(bad).toEqual([]);
  });

  it("covers every protocol walk-through the posts use", () => {
    for (const n of [
      "https",
      "postgres",
      "mysql",
      "mongodb",
      "redis",
      "webhook",
      "googleSa",
      "awsPresigned",
      "oauth",
      "apns",
    ]) {
      expect(SEQUENCES).toHaveProperty(n);
    }
  });

  it("renders a named sequence", () => {
    render(<Sequence name="webhook" />);
    expect(screen.getAllByTestId("sequence-step")).toHaveLength(SEQUENCES.webhook.steps.length);
  });
});

describe("FR-DOC-010 type explorer", () => {
  it("starts on the first type and switches when another is chosen", () => {
    render(<EnvTypeExplorer />);
    const tabs = screen.getByRole("tablist", { name: /env types/i });
    expect(within(tabs).getAllByRole("tab")).toHaveLength(ENV_TYPES.length);
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("PORT")).toBeInTheDocument();
    fireEvent.click(within(tabs).getByRole("tab", { name: "PostgreSQL" }));
    const pg = screen.getByRole("tabpanel");
    expect(within(pg).getByText("DATABASE_URL")).toBeInTheDocument();
    expect(within(pg).getAllByTestId("hop")).toHaveLength(3);
    expect(within(pg).getByText(/Layer 1/)).toBeInTheDocument();
  });

  it("marks the real hop and the laptop side", () => {
    render(<EnvTypeExplorer initial="stripe" />);
    const hops = screen.getAllByTestId("hop");
    expect(hops.map((h) => h.getAttribute("data-real"))).toEqual(["false", "false", "true"]);
    expect(hops[0].getAttribute("data-side")).toBe("laptop");
  });
});

describe("FR-DOC-010 packet layers", () => {
  it("Layer 2: the app's TLS rides inside the tunnel's TLS on the agent → cb hop", () => {
    render(<PacketLayers mode="layer2" />);
    const hop = screen.getByRole("group", { name: /agent → cb server/i });
    const labels = within(hop)
      .getAllByTestId("packet-layer")
      .map((l) => l.getAttribute("data-label"));
    expect(labels.filter((l) => /TLS/.test(l ?? ""))).toHaveLength(2);
  });

  it("Layer 1: plain database bytes on loopback, wrapped in TLS + WebSocket in the tunnel", () => {
    render(<PacketLayers mode="layer1" />);
    const loop = within(screen.getByRole("group", { name: /app → agent/i }))
      .getAllByTestId("packet-layer")
      .map((l) => l.getAttribute("data-label"));
    expect(loop.some((l) => /TLS/.test(l ?? ""))).toBe(false);
    const tunnel = within(screen.getByRole("group", { name: /agent → cb server/i }))
      .getAllByTestId("packet-layer")
      .map((l) => l.getAttribute("data-label") ?? "");
    expect(tunnel.some((l) => /WebSocket/.test(l))).toBe(true);
  });
});

describe("FR-DOC-010 series posts", () => {
  const posts = listPages(path.resolve(import.meta.dirname, "../../../content/blog")).map((p) => p.rel);
  it.each([
    "every-env-type.mdx",
    "network-model.mdx",
    "local-values.mdx",
    "databases-through-cb.mdx",
    "payment-webhooks.mdx",
    "key-files-and-signed-requests.mdx",
  ])("has %s", (f) => expect(posts).toContain(f));

  it("all series components are available to MDX", () => {
    const c = getMDXComponents();
    for (const k of ["EnvTypeExplorer", "PacketLayers", "Sequence", "ConnectionModes"]) expect(c[k]).toBeDefined();
  });
});
