"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { RowActions } from "@/shared/components/row-actions";
import { timeAgo } from "@/shared/lib/format-time";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProfileMutations, useProfiles, useResourceMutations } from "../hooks/use-resources";
import type { Resource } from "../types";
import { CredentialsDialog } from "./credentials-dialog";

/** J2: the resource's credential sets. "default" is the resource's own; others are assigned per grant. */
export function ResourceProfiles({ resource, envId }: { resource: Resource; envId: string }) {
  const profiles = useProfiles(resource.id);
  const { rotate: rotateDefault } = useResourceMutations(envId);
  const { rotate, remove } = useProfileMutations(resource.id);
  const [rotating, setRotating] = useState<string | null>(null);

  if (profiles.isPending) return <Skeleton className="h-8 w-full" />;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Credential profiles</p>
      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
        {profiles.data?.map((p) => (
          <li key={p.name} className="flex min-w-0 items-center gap-3 py-1 pr-1 pl-3">
            <span className="truncate font-mono text-sm">{p.name}</span>
            <span className="ml-auto shrink-0 font-mono text-[11px] text-subtle">rotated {timeAgo(p.rotatedAt)}</span>
            <RowActions
              label={`Actions for profile ${p.name}`}
              actions={[
                { label: "Rotate credentials", icon: RefreshCw, onSelect: () => setRotating(p.name) },
                ...(p.isDefault
                  ? []
                  : [
                      {
                        label: "Delete profile",
                        icon: Trash2,
                        destructive: true,
                        confirm: {
                          title: `Delete profile ${p.name}?`,
                          description: "Only possible when no access grant uses it. Its credentials are erased.",
                          confirmLabel: "Delete profile",
                          onConfirm: () => remove.mutateAsync(p.name),
                        },
                      },
                    ]),
              ]}
            />
          </li>
        ))}
      </ul>
      {rotating && (
        <CredentialsDialog
          open
          onOpenChange={(open) => !open && setRotating(null)}
          resource={resource}
          mode="rotate"
          profileName={rotating}
          pending={rotate.isPending || rotateDefault.isPending}
          onSubmit={(body) =>
            rotating === "default"
              ? rotateDefault.mutateAsync({ id: resource.id, body })
              : rotate.mutateAsync({ name: rotating, body })
          }
        />
      )}
    </div>
  );
}
