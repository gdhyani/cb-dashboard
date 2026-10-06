import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LayoutDashboard } from "lucide-react";
import { DOCS_PATH, GITHUB_URLS, PRODUCT_NAME } from "@/constants";

export const docsLayoutOptions: BaseLayoutProps = {
  nav: { title: <span className="font-semibold">{PRODUCT_NAME} docs</span>, url: DOCS_PATH },
  githubUrl: GITHUB_URLS.dashboard,
  // The app is dark only.
  themeSwitch: { enabled: false },
  // "/" sends signed-out visitors to /login and signed-in ones into the app (proxy.ts); the docs never read the session.
  links: [{ type: "main", text: "Open dashboard", url: "/", icon: <LayoutDashboard /> }],
};
