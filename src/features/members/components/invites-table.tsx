"use client";

import { Ban } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { RowActions } from "@/shared/components/row-actions";
import { timeAgo, timeUntil } from "@/shared/lib/format-time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useMemberMutations } from "../hooks/use-members";
import { ROLE_LABEL } from "../lib/member-query";
import type { Invite } from "../types";

/** Invite links not used yet; each can be revoked from its "…" menu (FR-UI-002). */
export function InvitesTable({ orgId, invites }: { orgId: string; invites: Invite[] }) {
  const { revokeInvite } = useMemberMutations(orgId);
  return (
    <Table className="min-w-[520px]">
      <TableHeader>
        <TableRow>
          <TableHead>Invited</TableHead>
          <TableHead className="w-36">Role</TableHead>
          <TableHead className="hidden w-36 sm:table-cell">Created</TableHead>
          <TableHead className="w-36">Expires</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>
              <span className="block max-w-xs truncate">
                {inv.email ?? <span className="text-foreground-lighter">Anyone with the link</span>}
              </span>
            </TableCell>
            <TableCell>
              <BadgeLabel tone={inv.role === "developer" ? "default" : "strong"}>{ROLE_LABEL[inv.role]}</BadgeLabel>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-foreground-lighter sm:table-cell">
              {timeAgo(inv.createdAt)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-foreground-lighter">{timeUntil(inv.expiresAt)}</TableCell>
            <TableCell className="py-0 text-right">
              <RowActions
                label={`Actions for invite ${inv.email ?? "link"}`}
                actions={[
                  {
                    label: "Revoke invite",
                    icon: Ban,
                    destructive: true,
                    confirm: {
                      title: "Revoke invite?",
                      description: "The link stops working. You can create a new one at any time.",
                      confirmLabel: "Revoke invite",
                      onConfirm: () => revokeInvite.mutateAsync(inv.id),
                    },
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
