"use client";

import { ShieldCheck } from "lucide-react";
import { Admonition } from "@/shared/components/admonition";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Card, CardContent } from "@/shared/ui/card";
import { useStops } from "../hooks/use-emergency-stop";
import { SCOPES, StopAccessDialog } from "./stop-access-dialog";
import { StopsTable } from "./stops-table";

/** J7: emergency stops — what a stop does, active stops, the stop controls, then recent history. */
export function EmergencyStopView({ orgId }: { orgId: string }) {
  const stops = useStops(orgId);
  const active = stops.data?.filter((s) => !s.clearedAt) ?? [];
  const past = stops.data?.filter((s) => s.clearedAt).slice(0, 20) ?? [];
  return (
    <>
      <PageHeader title="Emergency Stop" description="Cut access at once for incidents, lost laptops or leaked keys" />
      <div className="pt-8">
        <Admonition type="warning" title="A stop takes effect within seconds">
          Live database and API connections close and new ones are refused until you restore access. You give a reason
          first; every stop and restore is recorded in Activity.
        </Admonition>
      </div>

      <Section title="Active stops" description="Access stays cut until you restore it from the row menu">
        <QueryState isPending={stops.isPending} error={stops.error} skeleton={<SkeletonRows rows={1} />}>
          {active.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck strokeWidth={1.5} />}
              title="Nothing is stopped"
              description="Access is flowing normally"
            />
          ) : (
            <StopsTable orgId={orgId} stops={active} />
          )}
        </QueryState>
      </Section>

      <Section title="Stop access" description="Choose what to cut off; nothing stops until you confirm with a reason">
        <Card>
          {SCOPES.map((s) => (
            <CardContent key={s.value} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm text-foreground-lighter">{s.hint}</span>
              </div>
              <StopAccessDialog orgId={orgId} scope={s.value} />
            </CardContent>
          ))}
        </Card>
      </Section>

      {past.length > 0 && (
        <Section title="History" description="The last 20 restored stops">
          <StopsTable orgId={orgId} stops={past} history />
        </Section>
      )}
    </>
  );
}
