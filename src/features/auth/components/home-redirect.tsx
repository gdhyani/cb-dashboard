"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "../hooks/use-auth";

/** "/" → first organization when logged in, otherwise the login page. */
export function HomeRedirect() {
  const router = useRouter();
  const me = useMe({ allowSignedOut: true });
  useEffect(() => {
    if (me.data) {
      const first = me.data.memberships[0];
      router.replace(first ? `/orgs/${first.orgId}` : "/signup");
    } else if (me.error) {
      router.replace("/login");
    }
  }, [me.data, me.error, router]);
  return <p className="p-8 font-mono text-sm text-subtle">loading…</p>;
}
