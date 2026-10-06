"use client";

import { Ban } from "lucide-react";
import { useState } from "react";
import type { Role } from "@/features/auth/types";
import { CopyCommand } from "@/shared/components/copy-command";
import { FormField } from "@/shared/components/form-field";
import { RowActions } from "@/shared/components/row-actions";
import { timeUntil } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useInvites, useMemberMutations } from "../hooks/use-members";

/** J4: generate an invite link to copy (no email sending in M0). */
export function InvitePanel({ orgId, isOwner }: { orgId: string; isOwner: boolean }) {
  const [role, setRole] = useState<Role>("developer");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string>();
  const invites = useInvites(orgId);
  const { createInvite, revokeInvite } = useMemberMutations(orgId);
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border p-4 sm:p-5">
      <form
        method="post"
        className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          createInvite.mutate(
            { role, ...(email.trim() ? { email: email.trim() } : {}) },
            { onSuccess: (inv) => setLink(inv.url) },
          );
        }}
      >
        <div>
          <FormField id="invite-role" label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["developer", "admin", ...(isOwner ? ["owner"] : [])] as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="min-w-0">
          <FormField id="invite-email" label="Email (optional)">
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Only this address can accept"
            />
          </FormField>
        </div>
        <Button type="submit" loading={createInvite.isPending} className="w-full sm:w-auto">
          Generate invite link
        </Button>
      </form>
      {link && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Share this link. It works once and expires in 7 days.</p>
          <CopyCommand command={link} label="Copy invite link" />
        </div>
      )}
      {invites.data && invites.data.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">Pending invites</p>
          <ul className="flex flex-col divide-y divide-border">
            {invites.data.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                  <span className="truncate">
                    {inv.email ?? <span className="text-subtle">Anyone with the link</span>}
                  </span>
                  <span className="font-mono text-xs text-subtle">
                    {inv.role} · expires {timeUntil(inv.expiresAt)}
                  </span>
                </span>
                <span className="shrink-0">
                  <RowActions
                    label="Invite actions"
                    actions={[
                      {
                        label: "Revoke invite",
                        icon: Ban,
                        destructive: true,
                        confirm: {
                          title: "Revoke invite?",
                          description: "The link stops working.",
                          confirmLabel: "Revoke invite",
                          onConfirm: () => revokeInvite.mutateAsync(inv.id),
                        },
                      },
                    ]}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
