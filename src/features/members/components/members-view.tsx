"use client";

import { useMe } from "@/features/auth/hooks/use-auth";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";
import { InvitePanel } from "./invite-panel";
import { MembersTable } from "./members-table";

export function MembersView({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  const me = useMe();
  return (
    <>
      <PageHeader
        breadcrumb="Team"
        title="Members"
        description="Owners and admins manage everything; developers use the environments they are granted."
      />
      {org.isAdmin && (
        <Section title="Invite">
          <InvitePanel orgId={orgId} isOwner={org.isOwner} />
        </Section>
      )}
      <Section title={`People${org.data ? ` · ${org.data.memberCount}` : ""}`}>
        <MembersTable orgId={orgId} canManage={org.isAdmin} isOwner={org.isOwner} currentUserId={me.data?.user.id} />
      </Section>
    </>
  );
}
