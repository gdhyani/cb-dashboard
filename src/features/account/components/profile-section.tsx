"use client";

import { useMe } from "@/features/auth";
import { FormItemLayout } from "@/shared/components/form-item-layout";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

/** Name and email, read-only: the backend has no endpoint to change them yet. */
export function ProfileSection() {
  const me = useMe();
  return (
    <Section title="Profile" description="How you appear to other members and in the activity log">
      <QueryState isPending={me.isPending} error={me.error} skeleton={<SkeletonRows rows={2} />}>
        {me.data && (
          <Card>
            <CardContent>
              <FormItemLayout id="account-name" label="Name">
                <Input id="account-name" readOnly value={me.data.user.name} />
              </FormItemLayout>
            </CardContent>
            <CardContent>
              <FormItemLayout id="account-email" label="Email" description="Used to sign in">
                <Input id="account-email" readOnly value={me.data.user.email} />
              </FormItemLayout>
            </CardContent>
            <CardContent>
              <p className="text-sm text-foreground-lighter">
                Your name, email and password cannot be changed from the dashboard yet
              </p>
            </CardContent>
          </Card>
        )}
      </QueryState>
    </Section>
  );
}
