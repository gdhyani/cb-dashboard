"use client";

import { useState } from "react";
import { useProfiles, useResources } from "@/features/resources/hooks/use-resources";
import { KINDS } from "@/features/resources/lib/kinds";
import type { Resource } from "@/features/resources/types";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import type { Grant } from "../types";

function ProfileRow({
  resource,
  value,
  onChange,
}: {
  resource: Resource;
  value: string;
  onChange: (profile: string) => void;
}) {
  const profiles = useProfiles(resource.id);
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{resource.name}</span>
        <span className="block truncate text-[11px] text-subtle">{KINDS[resource.kind]?.label ?? resource.kind}</span>
      </span>
      {profiles.isPending ? (
        <Skeleton className="h-9 w-36" />
      ) : (
        <Select value={value} onValueChange={onChange} disabled={(profiles.data?.length ?? 0) < 2}>
          <SelectTrigger className="w-36 font-mono" aria-label={`Profile for ${resource.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profiles.data?.map((p) => (
              <SelectItem key={p.name} value={p.name} className="font-mono">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </li>
  );
}

/** J4: which credential set each resource uses for this developer. */
export function GrantProfilesDialog({
  grant,
  title,
  open,
  onOpenChange,
  pending,
  onSave,
}: {
  grant: Grant;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSave: (resourceProfiles: Grant["resourceProfiles"]) => Promise<unknown>;
}) {
  const resources = useResources(grant.environmentId);
  const [choice, setChoice] = useState<Record<string, string>>(() =>
    Object.fromEntries(grant.resourceProfiles.map((p) => [p.resourceId, p.profile])),
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pick the real credentials used for this developer, e.g. a read-only database user. Their fake values don't
            change; live connections reconnect with the new profile.
          </DialogDescription>
        </DialogHeader>
        {resources.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {resources.data?.map((r) => (
              <ProfileRow
                key={r.id}
                resource={r}
                value={choice[r.id] ?? "default"}
                onChange={(profile) => setChoice((c) => ({ ...c, [r.id]: profile }))}
              />
            ))}
            {resources.data?.length === 0 && (
              <li className="py-2 text-sm text-subtle">No resources in this environment.</li>
            )}
          </ul>
        )}
        <DialogFooter>
          <Button
            loading={pending}
            onClick={() =>
              void onSave(
                Object.entries(choice)
                  .filter(([, profile]) => profile !== "default")
                  .map(([resourceId, profile]) => ({ resourceId, profile })),
              ).then(() => onOpenChange(false))
            }
          >
            Save profiles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
