import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const setOpenSearch = vi.fn();
let pathname = "/docs/guides/develop/preload-and-api";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("fumadocs-ui/contexts/search", () => ({ useSearchContext: () => ({ enabled: true, setOpenSearch }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

const { SiteHeader } = await import("@/features/docs/components/site-header");
const { PostNav } = await import("@/features/docs/components/blog/post-nav");

const post = (slug: string, date: string) => ({
  slug,
  url: `/blog/${slug}`,
  title: `Post ${slug}`,
  description: "",
  date,
  author: "The cb team",
  minutes: 3,
  image: "/blog/covers/x.svg",
  imageAlt: "",
});

describe("FR-DOC-001 / FR-DOC-010 one header for docs and blog", () => {
  beforeAll(() => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  beforeEach(() => setOpenSearch.mockClear());

  it("marks the current section, links home, GitHub and the dashboard, on one bar", () => {
    render(<SiteHeader section="docs" mobileMenu={null} />);
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "cb home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "cb on GitHub" })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
    expect(screen.getByRole("link", { name: /Open dashboard/ })).toHaveAttribute("href", "/dashboard");
  });

  it("the blog marks Blog as current", () => {
    pathname = "/blog/payment-webhooks";
    render(<SiteHeader section="blog" mobileMenu={null} />);
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page");
  });

  it("opens search from the bar", () => {
    render(<SiteHeader section="blog" mobileMenu={null} />);
    fireEvent.click(screen.getByRole("button", { name: /Search docs and blog/ }));
    expect(setOpenSearch).toHaveBeenCalledWith(true);
  });

  it("uses the site theme switcher (same control as the dashboard)", () => {
    render(<SiteHeader section="docs" mobileMenu={null} />);
    expect(screen.getByRole("button", { name: /^Theme: / })).toBeInTheDocument();
  });
});

describe("FR-DOC-010 newer / older post at the end of a post", () => {
  it("links both neighbours, and nothing when there are none", () => {
    const { container, rerender } = render(<PostNav newer={post("b", "2026-11-12")} older={post("a", "2026-11-10")} />);
    expect(screen.getByRole("link", { name: /Newer post.*Post b/ })).toHaveAttribute("href", "/blog/b");
    expect(screen.getByRole("link", { name: /Older post.*Post a/ })).toHaveAttribute("href", "/blog/a");
    rerender(<PostNav />);
    expect(container).toBeEmptyDOMElement();
  });
});
