"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { LOGIN_PATH } from "@/constants";
import { makeQueryClient } from "@/shared/api/query-client";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { SmoothScroll } from "./smooth-scroll";

/** Session expired mid-use: drop cached data and go to the login page, coming back here afterwards. */
function redirectToLogin() {
  const { pathname, search } = window.location;
  if (pathname === LOGIN_PATH) return;
  const back = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  window.location.replace(`${LOGIN_PATH}${back}`);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient({ onUnauthorized: redirectToLogin }));
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <SmoothScroll>{children}</SmoothScroll>
      </TooltipProvider>
      <Toaster
        theme="dark"
        position="bottom-right"
        closeButton
        toastOptions={{ style: { background: "#0a0a0a", border: "1px solid #262626", color: "#fafafa" } }}
      />
    </QueryClientProvider>
  );
}
