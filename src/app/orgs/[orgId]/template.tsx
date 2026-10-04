import type { ReactNode } from "react";

/** Re-mounts on every navigation: each page enters with the shared slide-up. */
export default function OrgTemplate({ children }: { children: ReactNode }) {
  return <div className="cb-enter flex min-w-0 flex-col gap-10">{children}</div>;
}
