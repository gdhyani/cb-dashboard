"use client";

import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { AppearanceSection } from "./appearance-section";
import { DangerZoneSection } from "./danger-zone-section";
import { ProfileSection } from "./profile-section";
import { SessionsSection } from "./sessions-section";
import { SignOutSection } from "./sign-out-section";

/**
 * Account Preferences, laid out like Studio's settings pages: each section has its summary on the left and its card
 * on the right (stacked on narrow screens).
 */
export function AccountPreferences({ orgId }: { orgId: string }) {
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title="Account Preferences"
        description="Your profile, how the dashboard looks and where you are signed in"
      />
      <ProfileSection orgId={orgId} />
      <AppearanceSection />
      <SessionsSection orgId={orgId} />
      <SignOutSection />
      <DangerZoneSection orgId={orgId} />
    </PageContainer>
  );
}
