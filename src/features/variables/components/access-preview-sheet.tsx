"use client";

import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";
import { usePreview } from "../hooks/use-variables";

export interface PreviewPerson {
  userId: string;
  name: string;
}

/** J3 "Access preview": exactly what one person's app receives in this environment (no real secrets shown). */
export function AccessPreviewSheet({
  envId,
  envName,
  person,
  onClose,
}: {
  envId: string;
  envName: string;
  person: PreviewPerson | null;
  onClose: () => void;
}) {
  const preview = usePreview(envId, person?.userId);
  return (
    <Sheet open={Boolean(person)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[32rem] max-w-[92vw]">
        <SheetTitle>{person ? `Access preview for ${person.name}` : "Access preview"}</SheetTitle>
        {person && (
          <div className="flex h-full flex-col gap-5 overflow-y-auto p-5 pt-4">
            <div className="flex items-center gap-3 pr-8">
              <AvatarInitials name={person.name} />
              <div className="min-w-0">
                <p className="truncate font-medium">{person.name}</p>
                <p className="text-xs text-subtle">
                  What their app receives in <span className="font-mono text-foreground">{envName}</span>. Secret values
                  are never displayed.
                </p>
              </div>
            </div>
            <QueryState isPending={preview.isPending} error={preview.error} skeleton={<SkeletonRows rows={4} />}>
              {preview.data && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm">
                    {preview.data.hasAccess ? (
                      <BadgeLabel tone="strong" dot>
                        Access granted
                      </BadgeLabel>
                    ) : (
                      <span className="flex items-center gap-2">
                        <BadgeLabel tone="warning" dot>
                          No access
                        </BadgeLabel>
                        <span className="text-muted-foreground">
                          Sessions will be refused for {preview.data.user.name}.
                        </span>
                      </span>
                    )}
                  </p>
                  <pre className="rounded-lg border border-border bg-card p-4 font-mono text-xs leading-6 whitespace-pre-wrap break-words">
                    {preview.data.entries.map((e) => `${e.key}=${e.display}`).join("\n") || "# no variables"}
                  </pre>
                </div>
              )}
            </QueryState>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
