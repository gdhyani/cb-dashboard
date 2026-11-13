"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGIN_PATH, PRODUCT_NAME } from "@/constants";
import { useLogout, useMe } from "@/features/auth";
import { EmptyState } from "@/shared/components/empty-state";
import { TypedConfirmDialog } from "@/shared/components/typed-confirm-dialog";
import { Button } from "@/shared/ui/button";
import { useDeleteAccount } from "../hooks/use-account";

/**
 * A signed-in user with no organization (they left or deleted their last one, FR-ACC-002/004). Accounts can only join
 * an organization through an invite, so the page says that and offers Sign out and Delete account.
 */
export function NoOrganization() {
  const router = useRouter();
  const me = useMe();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const [deleting, setDeleting] = useState(false);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <span className="flex size-8 items-center justify-center self-center rounded-md bg-brand font-mono text-xs font-semibold text-brand-foreground">
          {PRODUCT_NAME}
        </span>
        <EmptyState
          icon={<Building2 strokeWidth={1.5} />}
          title="You're not in an organization"
          description={
            <>
              Signed in as <span className="text-foreground">{me.data?.user.email}</span>. Ask an owner or admin for an
              invite link and open it to join their organization
            </>
          }
          action={
            <>
              <Button
                variant="secondary"
                size="sm"
                loading={logout.isPending}
                onClick={() => logout.mutate(undefined, { onSettled: () => router.replace(LOGIN_PATH) })}
              >
                Sign out
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleting(true)}>
                Delete account
              </Button>
            </>
          }
        />
      </div>
      <TypedConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete your account"
        warning="This cannot be undone"
        confirmText={me.data?.user.email ?? ""}
        confirmTextLabel="Your email"
        caseInsensitive
        confirmLabel="Delete account"
        requirePassword
        onConfirm={(body) => deleteAccount.mutateAsync(body)}
      >
        Your account, sessions and CLI devices are deleted and every live connection closes.
      </TypedConfirmDialog>
    </main>
  );
}
