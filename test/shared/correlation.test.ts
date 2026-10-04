import { afterEach, describe, expect, it, vi } from "vitest";
import { newCorrelationId } from "@/shared/api/correlation";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => vi.unstubAllGlobals());

describe("newCorrelationId", () => {
  it("returns a v4 UUID", () => {
    expect(newCorrelationId()).toMatch(UUID_V4);
  });

  // Plain-HTTP LAN origins (http://192.168.x.x) are not secure contexts, so browsers omit crypto.randomUUID.
  it("returns a v4 UUID outside a secure context (no crypto.randomUUID)", () => {
    vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) });
    const ids = new Set(Array.from({ length: 50 }, () => newCorrelationId()));
    for (const id of ids) expect(id).toMatch(UUID_V4);
    expect(ids.size).toBe(50);
  });
});
