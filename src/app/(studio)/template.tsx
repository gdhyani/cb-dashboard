import type { ReactNode } from "react";

/** Dashboard only. Re-mounts when the top-level section changes (sign-in, device, invite, orgs): each enters with the shared slide-up. */
export default function RootTemplate({ children }: { children: ReactNode }) {
  return <div className="cb-enter">{children}</div>;
}
