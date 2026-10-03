"use client";

import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { SecretInput } from "@/shared/components/secret-input";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { useResourceMutations, useResources } from "../hooks/use-resources";
import type { Resource } from "../types";
import { ResourceFormDialog } from "./resource-form-dialog";

function summary(r: Resource): string {
  if (r.kind === "http") return String(r.config.upstreamUrl ?? "");
  return `${String(r.config.host ?? "")} · ${String(r.config.database ?? "")}`;
}

function RotateForm({ resource, envId }: { resource: Resource; envId: string }) {
  const [value, setValue] = useState("");
  const { rotate } = useResourceMutations(envId);
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        rotate.mutate(
          { id: resource.id, ...(resource.kind === "http" ? { apiKey: value } : { connectionUri: value }) },
          { onSuccess: () => setValue("") },
        );
      }}
    >
      <div className="flex-1">
        <SecretInput
          isSet
          aria-label={`New credentials for ${resource.name}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button size="sm" variant="outline" type="submit" disabled={!value || rotate.isPending}>
        Rotate
      </Button>
    </form>
  );
}

export function ResourcesPanel({ envId, isAdmin }: { envId: string; isAdmin: boolean }) {
  const resources = useResources(envId);
  const { remove } = useResourceMutations(envId);
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <ResourceFormDialog envId={envId} />
        </div>
      )}
      <QueryState isPending={resources.isPending} error={resources.error}>
        {resources.data?.length === 0 ? (
          <EmptyState
            title="No resources"
            description="Add the databases and APIs this environment talks to. Their credentials never leave the server."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {resources.data?.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{r.name}</span>
                      <BadgeLabel>{r.kind}</BadgeLabel>
                    </span>
                    <span className="font-mono text-xs text-subtle">{summary(r)}</span>
                  </div>
                  <span className="font-mono text-xs text-subtle">•••• set · rotated {timeAgo(r.rotatedAt)}</span>
                </div>
                {Array.isArray(r.config.redirectHosts) && r.config.redirectHosts.length > 0 && (
                  <p className="font-mono text-xs text-subtle">
                    redirects {(r.config.redirectHosts as string[]).join(", ")}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-64 flex-1">
                      <RotateForm resource={r} envId={envId} />
                    </div>
                    <ConfirmDialog
                      trigger={
                        <Button size="sm" variant="ghost">
                          Delete
                        </Button>
                      }
                      title={`Delete ${r.name}?`}
                      description="Variables brokered through it are deleted too, and running apps lose this connection."
                      confirmLabel="Delete resource"
                      onConfirm={() => remove.mutateAsync(r.id)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
}
