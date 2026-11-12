"use client";

import { Info } from "lucide-react";
import { useMe } from "@/features/auth";
import { useOrg } from "@/features/orgs";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { CopyButton } from "@/shared/components/copy-button";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Card, CardContent } from "@/shared/ui/card";

/** One label/value line of the profile card: plain text, never an input (nothing here can be edited yet). */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-sm text-foreground-lighter">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">{children}</span>
    </div>
  );
}

/** Who you are: identity header (name, role), then email and organization as read-only text (OQ17). */
export function ProfileSection({ orgId }: { orgId: string }) {
  const me = useMe();
  const org = useOrg(orgId);
  const role = org.data?.role;
  return (
    <Section layout="horizontal" title="Profile" description="How you appear to other members and in the activity log">
      <QueryState isPending={me.isPending} error={me.error} skeleton={<SkeletonRows rows={2} />}>
        {me.data && (
          <Card>
            <CardContent className="flex items-center gap-4">
              <AvatarInitials name={me.data.user.name} size="lg" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-base text-foreground">{me.data.user.name}</span>
                  {role && <BadgeLabel tone={org.isAdmin ? "strong" : "default"}>{role}</BadgeLabel>}
                </span>
                <span className="truncate text-sm text-foreground-lighter">
                  Member of {org.data?.name ?? "this organization"}
                </span>
              </div>
            </CardContent>
            <CardContent className="flex flex-col gap-4">
              <Field label="Email">
                <span className="truncate">{me.data.user.email}</span>
                <CopyButton value={me.data.user.email} label="Copy email" />
              </Field>
              <Field label="Organization">{org.data?.name ?? "—"}</Field>
            </CardContent>
            <CardContent className="flex items-start gap-2 bg-surface-75 text-xs text-foreground-lighter">
              <Info className="mt-px size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Name, email and password can't be changed from the dashboard yet
            </CardContent>
          </Card>
        )}
      </QueryState>
    </Section>
  );
}
