"use client";

import { useState } from "react";
import type { Member } from "@/features/members/types";
import { BadgeLabel } from "@/shared/components/badge-label";
import { FormField } from "@/shared/components/form-field";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { usePreview } from "../hooks/use-variables";

/** J3 "Access preview": exactly what a member's app would receive (no real secrets shown). */
export function PreviewPanel({ envId, members }: { envId: string; members: Member[] }) {
  const [userId, setUserId] = useState<string>();
  const preview = usePreview(envId, userId);
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <FormField
          id="preview-user"
          label="Member"
          hint="Shows exactly what this member's application receives. Secret values are never displayed."
        >
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="preview-user">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.name} ({m.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      {userId && (
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
              <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs leading-6">
                {preview.data.entries.map((e) => `${e.key}=${e.display}`).join("\n") || "# no variables"}
              </pre>
            </div>
          )}
        </QueryState>
      )}
    </div>
  );
}
