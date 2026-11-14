import { describe, expect, it } from "vitest";
import * as copy from "@/features/landing/content";
import * as story from "@/features/landing/content-story";
import { agent, MASK, placeholders, scene } from "@/features/landing/content-story";
import { WORDS } from "@/features/landing/lib/words";
import { rekeyFrame } from "@/features/landing/motion/rekey";

const isWordStandIn = (v: string) =>
  /cb[-_]/i.test(v) &&
  v
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => (WORDS as readonly string[]).includes(w)).length >= 2;

describe("FR-LP-003 landing placeholder keys and real keys", () => {
  it("every placeholder on the page reads as cb-marked words, never as a key", () => {
    for (const k of scene.keys) expect(isWordStandIn(k.standIn)).toBe(true);
    for (const s of agent.steps) if (s.kind === "env") expect(isWordStandIn(s.standIn)).toBe(true);
    for (const l of placeholders.issued) expect(isWordStandIn(l.value)).toBe(true);
  });

  it("the placeholder story gives each device its own value and refuses a copied one", () => {
    const [maya, ravi, copy] = placeholders.issued;
    expect(maya?.value).not.toBe(ravi?.value);
    expect(copy?.value).toBe(maya?.value);
    expect(copy?.ok).toBe(false);
    expect(placeholders.vault.value).toContain(MASK);
  });

  it("real keys are only ever shown masked", () => {
    for (const k of scene.keys) expect(k.real).toContain(MASK);
    for (const s of agent.steps) if (s.kind === "env") expect(s.real).toContain(MASK);
  });

  it("no visible copy uses the old word stand-in", () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk([copy, story]);
    expect(strings.length).toBeGreaterThan(100);
    for (const t of strings) expect(t.toLowerCase()).not.toMatch(/stand[-‑\s]ins?\b/);
  });

  it("keep the provider prefix, so it is clear the SDK still accepts them", () => {
    const values = scene.keys.map((k) => k.standIn);
    expect(values.some((v) => v.startsWith("sk_test_cb_"))).toBe(true);
    expect(values.some((v) => v.startsWith("sk-cb-"))).toBe(true);
  });
});

describe("Landing re-key motion", () => {
  it("ends exactly on the new value", () => {
    expect(rekeyFrame("sk_test_cb_amber", "sk_test_cb_otter", 1)).toBe("sk_test_cb_otter");
  });

  it("never scrambles a prefix the old and new placeholders share", () => {
    expect(rekeyFrame("sk_test_cb_amber", "sk_test_cb_otter", 0, () => 0).startsWith("sk_test_cb_")).toBe(true);
  });
});
