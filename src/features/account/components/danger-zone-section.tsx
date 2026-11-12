"use client";

import { type ReactNode, useState } from "react";
import { useMe } from "@/features/auth";
import { useOrg } from "@/features/orgs";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Section } from "@/shared/components/section";
import { TypedConfirmDialog } from "@/shared/components/typed-confirm-dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  useDeleteAccount,
  useDeleteOrganization,
  useDeletionPreview,
  useLeaveOrganization,
} from "../hooks/use-account";

function Row({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm text-foreground">{title}</span>
        <span className="text-sm text-foreground-lighter">{children}</span>
      </div>
      <div className="shrink-0">{action}</div>
    </CardContent>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Account › Danger zone (FR-ACC-001…004): leave the organization, delete it (owners), delete the account. Every
 * action is irreversible and confirmed by typing (plus the password for deletions).
 */
export function DangerZoneSection({ orgId }: { orgId: string }) {
  const me = useMe();
  const org = useOrg(orgId);
  const preview = useDeletionPreview(Boolean(me.data));
  const leave = useLeaveOrganization(orgId);
  const deleteOrg = useDeleteOrganization(orgId);
  const deleteAccount = useDeleteAccount();
  const [dialog, setDialog] = useState<"leave" | "org" | "account" | null>(null);

  const orgName = org.data?.name ?? "this organization";
  const soleOwner = Boolean(preview.data?.orgsDeleted.some((o) => o.id === orgId));
  const userId = me.data?.user.id;

  return (
    <Section
      layout="horizontal"
      title="Danger zone"
      description="Irreversible actions for your account and organization"
    >
      <Card className="border-destructive/40">
        <Row
          title={`Leave ${orgName}`}
          action={
            <Button variant="destructive" size="sm" disabled={soleOwner || !userId} onClick={() => setDialog("leave")}>
              Leave organization
            </Button>
          }
        >
          {soleOwner
            ? "You are its only owner. Make another member owner first, or delete the organization"
            : "Removes you and your access to its projects. Your account stays"}
        </Row>
        {org.isOwner && (
          <Row
            title={`Delete ${orgName}`}
            action={
              <Button variant="destructive" size="sm" onClick={() => setDialog("org")}>
                Delete organization
              </Button>
            }
          >
            Deletes every project, environment, stored credential, access grant, invite and the activity log, for all{" "}
            {plural(org.data?.memberCount ?? 0, "member")}
          </Row>
        )}
        <Row
          title="Delete account"
          action={
            <Button variant="destructive" size="sm" onClick={() => setDialog("account")}>
              Delete account
            </Button>
          }
        >
          Deletes your account, signs out every browser and CLI device, and removes you from every organization
        </Row>
      </Card>

      {userId && (
        <ConfirmDialog
          open={dialog === "leave"}
          onOpenChange={(open) => !open && setDialog(null)}
          title={`Leave ${orgName}?`}
          description="Your access to its projects ends at once and running apps lose their connections. An admin can invite you again."
          confirmLabel="Leave organization"
          onConfirm={() => leave.mutateAsync(userId)}
        />
      )}

      <TypedConfirmDialog
        open={dialog === "org"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Delete ${orgName}`}
        warning="This cannot be undone"
        confirmText={org.data?.name ?? ""}
        confirmTextLabel="Organization name"
        confirmLabel="Delete organization"
        requirePassword
        onConfirm={(body) => deleteOrg.mutateAsync(body)}
      >
        Every project, environment, variable, stored credential, webhook, access grant, invite and the activity log of{" "}
        {orgName} are deleted. {plural(org.data?.memberCount ?? 0, "member")} lose access at once.
      </TypedConfirmDialog>

      <TypedConfirmDialog
        open={dialog === "account"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Delete your account"
        warning="This cannot be undone"
        confirmText={me.data?.user.email ?? ""}
        confirmTextLabel="Your email"
        caseInsensitive
        confirmLabel="Delete account"
        requirePassword
        onConfirm={(body) => deleteAccount.mutateAsync(body)}
      >
        <span className="flex flex-col gap-1.5">
          <span>Your account, sessions and CLI devices are deleted and every live connection closes.</span>
          {preview.data && preview.data.orgsDeleted.length > 0 && (
            <span>
              You are the only owner of{" "}
              <strong className="font-medium text-foreground">
                {preview.data.orgsDeleted.map((o) => `${o.name} (${plural(o.memberCount, "member")})`).join(", ")}
              </strong>
              , so {preview.data.orgsDeleted.length === 1 ? "it is" : "they are"} deleted too, with everything in{" "}
              {preview.data.orgsDeleted.length === 1 ? "it" : "them"}.
            </span>
          )}
          {preview.data && preview.data.orgsLeft.length > 0 && (
            <span>
              You leave{" "}
              <strong className="font-medium text-foreground">
                {preview.data.orgsLeft.map((o) => o.name).join(", ")}
              </strong>
              ; {preview.data.orgsLeft.length === 1 ? "it stays" : "they stay"} for the other members.
            </span>
          )}
        </span>
      </TypedConfirmDialog>
    </Section>
  );
}
