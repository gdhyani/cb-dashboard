import { GithubInfo } from "fumadocs-ui/components/github-info";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LayoutDashboard } from "lucide-react";
import { DOCS_PATH, GITHUB_REPO, PRODUCT_NAME } from "@/constants";

export const docsLayoutOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="flex items-center gap-2 font-semibold">
        {PRODUCT_NAME}
        <span className="rounded-md bg-violet-400/15 px-1.5 py-0.5 text-xs font-medium text-violet-300">docs</span>
      </span>
    ),
    url: DOCS_PATH,
  },
  // The app is dark only.
  themeSwitch: { enabled: false },
  links: [
    // "/" sends signed-out visitors to /login and signed-in ones into the app (proxy.ts); the docs never read the session.
    { type: "main", text: "Open dashboard", url: "/", icon: <LayoutDashboard /> },
    // Stars and forks, fetched when the docs are built (static).
    { type: "custom", children: <GithubInfo owner={GITHUB_REPO.owner} repo={GITHUB_REPO.repo} className="lg:-mx-2" /> },
  ],
};
