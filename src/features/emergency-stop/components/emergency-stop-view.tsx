"use client";

import { ShieldCheck } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { useStopMutations, useStops } from "../hooks/use-emergency-stop";
import type { EmergencyStop } from "../types";
import { StopAccessDialog } from "./stop-access-dialog";

const SCOPE_LABEL: Record<EmergencyStop["scope"], string> = {
  org: "Everyone",
  environment: "Environment",
  resource: "Service",
  user: "Person",
  device: "Device",
};

function StopRow({ stop, orgId, index }: { stop: EmergencyStop; orgId: string; index: number }) {
  const { clear } = useStopMutations(orgId);
  const active = !stop.clearedAt;
  return (
    <StaggerItem index={index} className="flex items-center gap-3 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <span className="truncate font-medium">{stop.targetLabel}</span>
          <BadgeLabel tone={active ? "warning" : "muted"}>{SCOPE_LABEL[stop.scope]}</BadgeLabel>
        </span>
        <span className="truncate text-xs text-subtle">
          “{stop.reason}” · {active ? `since ${timeAgo(stop.createdAt)}` : `restored ${timeAgo(stop.clearedAt)}`}
        </span>
      </div>
      {active && (
        <RowActions
          label={`Actions for the stop on ${stop.targetLabel}`}
          actions={[
            {
              label: "Restore access",
              icon: ShieldCheck,
              confirm: {
                title: `Restore access for ${stop.targetLabel}?`,
                description: "People with access can connect again; running apps reconnect automatically.",
                confirmLabel: "Restore access",
                destructive: false,
                onConfirm: () => clear.mutateAsync(stop.id),
              },
            },
          ]}
        />
      )}
    </StaggerItem>
  );
}

/** J7: emergency stops — active first, then recent history. */
export function EmergencyStopView({ orgId }: { orgId: string }) {
  const stops = useStops(orgId);
  const active = stops.data?.filter((s) => !s.clearedAt) ?? [];
  const past = stops.data?.filter((s) => s.clearedAt).slice(0, 20) ?? [];
  return (
    <>
      <PageHeader
        breadcrumb="Security"
        title="Emergency stop"
        description="Cut access at once for a person, a device, a service, an environment or everyone — for incidents, lost laptops or leaked keys."
        actions={<StopAccessDialog orgId={orgId} />}
      />
      <Section title="Active">
        <QueryState isPending={stops.isPending} error={stops.error} skeleton={<SkeletonRows rows={1} />}>
          {active.length === 0 ? (
            <EmptyState
              title="Nothing is stopped"
              description="Access is flowing normally. Use Stop access during an incident."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {active.map((s, i) => (
                <StopRow key={s.id} stop={s} orgId={orgId} index={i} />
              ))}
            </ul>
          )}
        </QueryState>
      </Section>
      {past.length > 0 && (
        <Section title="History">
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {past.map((s, i) => (
              <StopRow key={s.id} stop={s} orgId={orgId} index={i} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
