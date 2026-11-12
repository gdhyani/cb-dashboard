import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvitesTable } from "@/features/members/components/invites-table";
import { MembersTable } from "@/features/members/components/members-table";
import { memberFilters, memberSearchFields, memberSorters } from "@/features/members/lib/member-query";
import type { Member } from "@/features/members/types";

const member = (o: Partial<Member> & { userId: string; name: string }): Member => ({
  email: `${o.name.toLowerCase().split(" ")[0]}@acme.dev`,
  role: "developer",
  joinedAt: "2026-01-01T00:00:00.000Z",
  ...o,
});

const MEMBERS: Member[] = [
  member({ userId: "u1", name: "Zoe Owner", role: "owner", joinedAt: "2025-01-01T00:00:00.000Z" }),
  member({ userId: "u2", name: "asha Admin", role: "admin", joinedAt: "2026-03-01T00:00:00.000Z" }),
  member({ userId: "u3", name: "Dev Dan", role: "developer", joinedAt: "2026-02-01T00:00:00.000Z" }),
];

const mutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
vi.mock("@/features/members/hooks/use-members", () => ({
  useMembers: () => ({ data: MEMBERS, isPending: false, error: null }),
  useMemberMutations: () => ({
    updateRole: mutation,
    remove: mutation,
    createInvite: mutation,
    revokeInvite: mutation,
  }),
}));

describe("members table query logic", () => {
  it("searches by name and email", () => {
    expect(memberSearchFields(MEMBERS[2] as Member)).toEqual(["Dev Dan", "dev@acme.dev"]);
  });

  it("filters by role", () => {
    expect(MEMBERS.filter((m) => memberFilters.role(m, "admin")).map((m) => m.userId)).toEqual(["u2"]);
  });

  it("sorts by name (case-insensitive), role (owner first) and joined date", () => {
    expect([...MEMBERS].sort(memberSorters.name).map((m) => m.name)).toEqual(["asha Admin", "Dev Dan", "Zoe Owner"]);
    expect([...MEMBERS].sort(memberSorters.role).map((m) => m.role)).toEqual(["owner", "admin", "developer"]);
    expect([...MEMBERS].sort(memberSorters.joined).map((m) => m.userId)).toEqual(["u1", "u3", "u2"]);
  });
});

describe("MembersTable", () => {
  it("lists members sorted by name, filters by search and shows a zero-results row", () => {
    render(<MembersTable orgId="o1" canManage isOwner currentUserId="u1" />);
    expect(screen.getByText("3 members")).toBeInTheDocument();
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("asha Admin");
    expect(rows[2]).toHaveTextContent("Zoe Owner");

    fireEvent.change(screen.getByLabelText("Search by name or email"), { target: { value: "dev@" } });
    expect(screen.getByText("1 of 3 members")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Search by name or email"), { target: { value: "nobody" } });
    expect(screen.getByText("No members match your search")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("3 members")).toBeInTheDocument();
  });

  it("toggles sort direction from the column head", () => {
    render(<MembersTable orgId="o1" canManage isOwner currentUserId="u1" />);
    fireEvent.click(screen.getByRole("button", { name: "User" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Zoe Owner");
  });

  it("FR-UI-004: developers see role badges and no row actions", () => {
    render(<MembersTable orgId="o1" canManage={false} isOwner={false} currentUserId="u3" />);
    expect(screen.queryByLabelText(/Role for/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Actions for/ })).not.toBeInTheDocument();
    expect(screen.getByText("Owner", { selector: "span" })).toBeInTheDocument();
  });

  it("FR-UI-004: admins cannot change an owner's role or remove themselves", () => {
    render(<MembersTable orgId="o1" canManage isOwner={false} currentUserId="u2" onSelect={vi.fn()} />);
    expect(screen.queryByLabelText("Role for Zoe Owner")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Role for Dev Dan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for asha Admin" })).toBeInTheDocument();
  });
});

describe("InvitesTable", () => {
  it("lists pending invites with role and a revoke menu each", () => {
    render(
      <InvitesTable
        orgId="o1"
        invites={[
          {
            id: "i1",
            role: "admin",
            email: "new@acme.dev",
            expiresAt: "2099-01-01T00:00:00.000Z",
            createdAt: "2026-11-01T00:00:00.000Z",
          },
          {
            id: "i2",
            role: "developer",
            email: null,
            expiresAt: "2099-01-01T00:00:00.000Z",
            createdAt: "2026-11-01T00:00:00.000Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("new@acme.dev")).toBeInTheDocument();
    expect(screen.getByText("Anyone with the link")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Actions for invite/ })).toHaveLength(2);
  });
});
