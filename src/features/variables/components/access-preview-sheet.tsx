"use client";

import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/shared/ui/sheet";
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
          <>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 pr-12">
              <AvatarInitials name={person.name} />
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{person.name}</p>
                <p className="text-sm text-foreground-lighter">
                  What their app receives in <span className="font-mono text-foreground">{envName}</span>. Secret values
                  are never displayed.
                </p>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
              <QueryState isPending={preview.isPending} error={preview.error} skeleton={<SkeletonRows rows={4} />}>
                {preview.data && (
                  <div className="flex flex-col gap-3">
                    {preview.data.hasAccess ? (
                      <BadgeLabel tone="success" dot>
                        Access granted
                      </BadgeLabel>
                    ) : (
                      <span className="flex flex-wrap items-center gap-2 text-sm">
                        <BadgeLabel tone="warning" dot>
                          No access
                        </BadgeLabel>
                        <span className="text-foreground-light">
                          Sessions will be refused for {preview.data.user.name}
                        </span>
                      </span>
                    )}
                    <pre className="rounded-lg border border-border bg-surface-200 p-4 font-mono text-xs leading-6 break-words whitespace-pre-wrap text-foreground">
                      {preview.data.entries.map((e) => `${e.key}=${e.display}`).join("\n") || "# no variables"}
                    </pre>
                  </div>
                )}
              </QueryState>
            </div>
            <div className="flex justify-end border-t border-border px-5 py-3">
              <SheetClose asChild>
                <Button variant="secondary" size="sm">
                  Close
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
