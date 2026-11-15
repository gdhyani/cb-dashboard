import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { RootProvider } from "fumadocs-ui/provider/next";
import { LayoutDashboard, Newspaper } from "lucide-react";
import type { ComponentProps } from "react";
import { APP_HOME_PATH, BLOG_PATH, DOCS_PATH, GITHUB_URLS, THEME_STORAGE_KEY } from "@/constants";
import { GithubMark } from "../components/github-mark";

/**
 * Docs and blog share the one cb theme (`cb-theme`: dark, light or system) with the landing page and the dashboard.
 * next-themes writes the same key and the same attributes the boot script sets (the `dark` class for Fumadocs,
 * data-theme for the cb tokens), so switching here switches everywhere.
 */
export const docsThemeOptions: ComponentProps<typeof RootProvider>["theme"] = {
  enabled: true,
  storageKey: THEME_STORAGE_KEY,
  attribute: ["class", "data-theme"],
  defaultTheme: "dark",
  enableSystem: true,
  disableTransitionOnChange: true,
  // The root layout's boot script already applies the theme before first paint on every route, so next-themes' own
  // inline script is redundant; a non-JS type keeps it inert (and React 19 quiet about scripts in client renders).
  scriptProps: { type: "application/json" },
};

/**
 * Shared by the docs and the blog. The header itself is `SiteHeader` (passed as `nav.component` by each layout); these
 * links only appear in the docs' phone drawer, under the page tree.
 */
export const docsLayoutOptions: BaseLayoutProps = {
  nav: { url: DOCS_PATH },
  // The theme switcher lives in SiteHeader (the same control as the dashboard's).
  themeSwitch: { enabled: false },
  links: [
    { type: "main", text: "Blog", url: BLOG_PATH, icon: <Newspaper />, on: "menu" },
    {
      type: "main",
      text: "GitHub",
      url: GITHUB_URLS.env,
      icon: <GithubMark className="size-4" />,
      external: true,
      on: "menu",
    },
    // The dashboard entry sends signed-out visitors to /login and signed-in ones into the app (proxy.ts).
    { type: "main", text: "Open dashboard", url: APP_HOME_PATH, icon: <LayoutDashboard />, on: "menu" },
  ],
};
