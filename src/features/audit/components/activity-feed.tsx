"use client";

import { ActivityList } from "./activity-list";
import { ActivityLog } from "./activity-log";

/** J8 activity: the full log (toolbar, table, pagination) or, `compact`, a short recent list for overviews. */
export function ActivityFeed({
  orgId,
  pageSize = 50,
  compact = false,
}: {
  orgId: string;
  pageSize?: number;
  compact?: boolean;
}) {
  return compact ? (
    <ActivityList orgId={orgId} pageSize={pageSize} />
  ) : (
    <ActivityLog orgId={orgId} pageSize={pageSize} />
  );
}
