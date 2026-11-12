"use client";

import { useRouter } from "next/navigation";
import { LOGIN_PATH } from "@/constants";
import { useLogout } from "@/features/auth";
import { Section } from "@/shared/components/section";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

/** Sign out of this browser only; other sessions and CLI devices stay signed in. */
export function SignOutSection() {
  const router = useRouter();
  const logout = useLogout();
  return (
    <Section layout="horizontal" title="Sign out" description="Ends the session in this browser only">
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-light">
            Other browsers and CLI devices stay signed in. Revoke them under Sessions
          </p>
          <Button
            variant="destructive"
            size="sm"
            loading={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace(LOGIN_PATH) })}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </Section>
  );
}
