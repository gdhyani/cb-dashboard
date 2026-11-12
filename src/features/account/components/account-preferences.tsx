"use client";

import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { AppearanceSection } from "./appearance-section";
import { ProfileSection } from "./profile-section";
import { SessionsSection } from "./sessions-section";

/** Account Preferences: profile (read-only), theme, and where you are signed in. */
export function AccountPreferences({ orgId }: { orgId: string }) {
  return (
    <PageContainer size="small">
      <PageHeader title="Account Preferences" description="Your profile, theme and sign-ins" />
      <ProfileSection />
      <AppearanceSection />
      <SessionsSection orgId={orgId} />
    </PageContainer>
  );
}
