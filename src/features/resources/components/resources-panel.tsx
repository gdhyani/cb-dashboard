"use client";

import { KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonCards } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { useProfileMutations, useResourceMutations, useResources } from "../hooks/use-resources";
import { KINDS } from "../lib/kinds";
import type { Resource } from "../types";
import { ConnectionMap } from "./connection-map";
import { CredentialsDialog } from "./credentials-dialog";
import { ResourceFormDialog } from "./resource-form-dialog";
import { ResourceProfiles } from "./resource-profiles";

function ResourceCard({
  resource: r,
  envId,
  isAdmin,
  index,
}: {
  resource: Resource;
  envId: string;
  isAdmin: boolean;
  index: number;
}) {
  const { remove } = useResourceMutations(envId);
  const profiles = useProfileMutations(r.id);
  const [adding, setAdding] = useState(false);
  const spec = KINDS[r.kind];
  const redirects = Array.isArray(r.config.redirectHosts) ? (r.config.redirectHosts as string[]) : [];
  return (
    <StaggerItem index={index} className="flex min-w-0 flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-medium">{r.name}</span>
            <BadgeLabel>{spec?.label ?? r.kind}</BadgeLabel>
            {r.disabled && <BadgeLabel tone="muted">Disabled</BadgeLabel>}
          </span>
          <span className="truncate font-mono text-xs text-subtle">{spec?.summary(r.config) || "—"}</span>
          {redirects.length > 0 && (
            <span className="truncate font-mono text-xs text-subtle">redirects {redirects.join(", ")}</span>
          )}
        </div>
        {isAdmin && (
          <RowActions
            label={`Actions for ${r.name}`}
            actions={[
              { label: "Add credential profile", icon: KeyRound, onSelect: () => setAdding(true) },
              {
                label: "Delete resource",
                icon: Trash2,
                destructive: true,
                confirm: {
                  title: `Delete ${r.name}?`,
                  description: "Variables brokered through it are deleted too, and running apps lose this connection.",
                  confirmLabel: "Delete resource",
                  onConfirm: () => remove.mutateAsync(r.id),
                },
              },
            ]}
          />
        )}
      </div>
      {isAdmin ? (
        <ResourceProfiles resource={r} envId={envId} />
      ) : (
        <span className="font-mono text-xs text-subtle">•••• set · rotated {timeAgo(r.rotatedAt)}</span>
      )}
      {adding && (
        <CredentialsDialog
          open
          onOpenChange={setAdding}
          resource={r}
          mode="add-profile"
          pending={profiles.create.isPending}
          onSubmit={(body) => profiles.create.mutateAsync({ ...body, name: String(body.name ?? "") })}
        />
      )}
    </StaggerItem>
  );
}

export function ResourcesPanel({ envId, isAdmin }: { envId: string; isAdmin: boolean }) {
  const resources = useResources(envId);
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <ResourceFormDialog envId={envId} />
        </div>
      )}
      <QueryState
        isPending={resources.isPending}
        error={resources.error}
        skeleton={<SkeletonCards cards={2} columns={1} />}
      >
        {resources.data?.length === 0 ? (
          <EmptyState
            title="No resources yet"
            description="Add the databases and APIs this environment talks to. Their credentials never leave the server."
          />
        ) : (
          <>
            <ConnectionMap resources={resources.data ?? []} />
            <ul className="grid gap-3 lg:grid-cols-2">
              {resources.data?.map((r, i) => (
                <ResourceCard key={r.id} resource={r} envId={envId} isAdmin={isAdmin} index={i} />
              ))}
            </ul>
          </>
        )}
      </QueryState>
    </div>
  );
}
