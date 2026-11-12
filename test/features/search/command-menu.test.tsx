import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CommandMenu } from "@/features/search/components/command-menu";

const push = vi.fn();
const setChoice = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/features/auth/hooks/use-auth", () => ({ useLogout: () => ({ mutate: vi.fn() }) }));
vi.mock("@/features/members/hooks/use-members", () => ({ useMembers: () => ({ data: [] }) }));
vi.mock("@/features/orgs/hooks/use-orgs", () => ({ useOrg: () => ({ isAdmin: true, isOwner: true }) }));
vi.mock("@/features/projects/hooks/use-projects", () => ({ useProjects: () => ({ data: [] }) }));
vi.mock("@/shared/theme/use-theme", () => ({ useTheme: () => ({ choice: "dark", setChoice }) }));

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => {};
});

describe("CommandMenu", () => {
  it("offers account preferences, theme choices and Sign out in an Account group", () => {
    const onOpenChange = vi.fn();
    render(<CommandMenu orgId="o1" open onOpenChange={onOpenChange} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
    // "Account" is not repeated under Go to; Account preferences replaces it.
    fireEvent.click(screen.getByText("Account preferences"));
    expect(push).toHaveBeenCalledWith("/orgs/o1/account");

    fireEvent.click(screen.getByText("Use light theme"));
    expect(setChoice).toHaveBeenCalledWith("light");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
