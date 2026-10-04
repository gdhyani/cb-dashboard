import { describe, expect, it } from "vitest";
import {
  developersWithoutAccess,
  environmentPeople,
  expiryLabel,
  peopleWithAccess,
  scopeLabel,
  toInput,
} from "@/features/access/lib/people";
import type { AccessMatrix, Grant } from "@/features/access/types";

const member = (userId: string, role: "owner" | "admin" | "developer" = "developer") => ({
  userId,
  name: userId.toUpperCase(),
  email: `${userId}@x.dev`,
  role,
  joinedAt: "2026-01-01T00:00:00.000Z",
});
const grant = (id: string, userId: string, environmentId: string | null, extra: Partial<Grant> = {}): Grant => ({
  id,
  scope: environmentId ? "environment" : "project",
  projectId: "p",
  environmentId,
  userId,
  expiresAt: null,
  resourceProfiles: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "o",
  ...extra,
});

const matrix: AccessMatrix = {
  members: [member("owner", "owner"), member("dan"), member("erin"), member("kai")],
  environments: [
    { id: "dev", name: "development", killed: false },
    { id: "stg", name: "staging", killed: false },
  ],
  grants: [grant("g1", "dan", null), grant("g2", "erin", "stg", { expiresAt: "2999-01-01T00:00:00.000Z" })],
};

describe("access lists (J4)", () => {
  it("lists only developers with access, with readable scope and expiry", () => {
    const people = peopleWithAccess(matrix);
    expect(people.map((p) => p.member.userId)).toEqual(["dan", "erin"]);
    expect(scopeLabel(people[0]!, matrix)).toBe("All environments");
    expect(scopeLabel(people[1]!, matrix)).toBe("staging");
    expect(expiryLabel(people[0]!)).toBe("No expiry");
    expect(expiryLabel(people[1]!)).toMatch(/^Expires /);
    expect(developersWithoutAccess(matrix).map((m) => m.userId)).toEqual(["kai"]);
  });

  it("shows where environment access comes from", () => {
    expect(environmentPeople(matrix, "dev")).toEqual([expect.objectContaining({ via: "project" })]);
    expect(environmentPeople(matrix, "stg").map((p) => [p.member.userId, p.via])).toEqual([
      ["dan", "project"],
      ["erin", "environment"],
    ]);
  });

  it("turns current access into dialog defaults", () => {
    const [dan, erin] = peopleWithAccess(matrix);
    expect(toInput(dan)).toMatchObject({ scope: "project" });
    expect(toInput(erin)).toMatchObject({ scope: "environments", environmentIds: ["stg"] });
    expect(toInput(undefined)).toEqual({ scope: "project", expiresAt: null, resourceProfiles: [] });
  });
});
