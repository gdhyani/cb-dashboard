import type { ReactNode } from "react";
import { Splash } from "@/shared/components/splash";

/**
 * Every dashboard route (sign-in, device approval, invites, the org app) renders inside this layout. The
 * `data-studio` marker switches on the dashboard design system (styles/studio.css); nothing outside this group
 * (docs, blog, marketing) is styled by it.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div data-studio="" className="min-h-dvh bg-background text-foreground">
      <Splash />
      {children}
    </div>
  );
}
