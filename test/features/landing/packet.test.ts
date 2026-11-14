import { describe, expect, it } from "vitest";
import { packetStateAt } from "@/features/landing/motion/packet";

describe("FR-LP-002 how-it-works packet: real only at the .env and the last two stops", () => {
  it("carries the real key at the .env", () => {
    expect(packetStateAt(0)).toBe("real");
    expect(packetStateAt(0.49)).toBe("real");
  });

  it("carries the stand-in from halfway to Preload until halfway into Gateway", () => {
    for (const f of [0.5, 1, 2, 3, 3.49]) expect(packetStateAt(f)).toBe("standin");
  });

  it("carries the real key again at Gateway and api.stripe.com", () => {
    for (const f of [3.5, 4, 4.5, 5]) expect(packetStateAt(f)).toBe("upstream");
  });
});
