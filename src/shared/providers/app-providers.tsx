"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { APP_HOME_PATH, LANDING_PATH, LOGIN_PATH } from "@/constants";
import { makeQueryClient } from "@/shared/api/query-client";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { SmoothScroll } from "./smooth-scroll";

/** Session expired mid-use: drop cached data and go to the login page, coming back here afterwards. */
function redirectToLogin() {
  const { pathname, search } = window.location;
  if (pathname === LOGIN_PATH) return;
  const back =
    pathname === LANDING_PATH || pathname === APP_HOME_PATH ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  window.location.replace(`${LOGIN_PATH}${back}`);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient({ onUnauthorized: redirectToLogin }));
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <SmoothScroll>{children}</SmoothScroll>
      </TooltipProvider>
      <Toaster theme="dark" position="bottom-right" closeButton />
    </QueryClientProvider>
  );
}
