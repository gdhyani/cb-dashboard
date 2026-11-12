"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { MemberAccessSheet } from "@/features/access";
import { useMe } from "@/features/auth/hooks/use-auth";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";
import { Button } from "@/shared/ui/button";
import { useInvites } from "../hooks/use-members";
import type { Member } from "../types";
import { InviteDialog } from "./invite-dialog";
import { InvitesTable } from "./invites-table";
import { MembersTable } from "./members-table";

/** Studio Team settings: members table with a toolbar, pending invites below; admins invite and manage (FR-UI-004). */
export function MembersView({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  const me = useMe();
  const invites = useInvites(orgId, org.isAdmin);
  const [selected, setSelected] = useState<Member | null>(null);
  const [inviting, setInviting] = useState(false);
  return (
    <>
      <PageHeader
        title="Members"
        description="People in this organization and their roles"
        actions={
          org.isAdmin && (
            <Button size="sm" onClick={() => setInviting(true)}>
              <UserPlus />
              Invite member
            </Button>
          )
        }
      />
      <Section>
        <MembersTable
          orgId={orgId}
          canManage={org.isAdmin}
          isOwner={org.isOwner}
          currentUserId={me.data?.user.id}
          onSelect={org.isAdmin ? setSelected : undefined}
        />
        <MemberAccessSheet orgId={orgId} member={selected} onClose={() => setSelected(null)} />
      </Section>
      {org.isAdmin && invites.data && invites.data.length > 0 && (
        <Section title="Pending invites" description="Links that have not been used yet">
          <InvitesTable orgId={orgId} invites={invites.data} />
        </Section>
      )}
      {org.isAdmin && <InviteDialog orgId={orgId} isOwner={org.isOwner} open={inviting} onOpenChange={setInviting} />}
    </>
  );
}
