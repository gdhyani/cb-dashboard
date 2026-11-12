"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PRODUCT_NAME } from "@/constants";
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
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
      <span className="flex size-8 animate-pulse items-center justify-center rounded-md bg-brand font-mono text-xs font-semibold text-[#0b1f15]">
        {PRODUCT_NAME}
      </span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
