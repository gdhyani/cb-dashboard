"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import type { ApiError } from "@/shared/api/api-error";
import { EmptyState } from "@/shared/components/empty-state";
import { PageContainer } from "@/shared/components/page-container";
import { Button } from "@/shared/ui/button";

/**
 * Shown instead of the page when the organization in the URL can't be loaded (wrong server, not a member, deleted):
 * one clear message, not the same error in every card.
 */
export function OrgUnavailable({ error }: { error: ApiError }) {
  const notFound = error.statusCode === 404 || error.statusCode === 403;
  return (
    <PageContainer size="small" className="pt-16 md:pt-24">
      <EmptyState
        icon={<Building2 strokeWidth={1.5} />}
        title={notFound ? "Organization not available" : "Organization could not be loaded"}
        description={
          <span className="flex flex-col gap-2">
            <span>
              {notFound
                ? "It doesn't exist on this server, or you are not a member. Open your own organization instead"
                : error.message}
            </span>
            <span className="font-mono text-xs text-foreground-lighter">
              {error.code} · correlation id {error.correlationId}
            </span>
          </span>
        }
        action={
          <Button asChild size="sm">
            <Link href="/">Go to my organization</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
