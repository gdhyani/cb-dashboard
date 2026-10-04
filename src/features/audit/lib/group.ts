import type { AuditEvent } from "../types";

export type FeedItem = { kind: "event"; event: AuditEvent } | { kind: "session"; id: string; events: AuditEvent[] };

const SESSION_GAP_MS = 5 * 60_000;

/**
 * Runtime noise (connections, API calls, app starts) from the same person in the same environment,
 * close together in time, collapses into one "session" item. Everything else stays one item per event.
 */
export function groupFeed(events: AuditEvent[]): FeedItem[] {
  const items: FeedItem[] = [];
  for (const event of events) {
    const last = items[items.length - 1];
    const isRuntime = event.category === "runtime" && event.outcome === "success";
    if (isRuntime && last) {
      const anchor = last.kind === "session" ? last.events[last.events.length - 1] : last.event;
      const sameRun =
        anchor?.category === "runtime" &&
        anchor.outcome === "success" &&
        anchor.actor?.id === event.actor?.id &&
        anchor.environment?.id === event.environment?.id &&
        Math.abs(Date.parse(anchor.createdAt) - Date.parse(event.createdAt)) < SESSION_GAP_MS;
      if (sameRun && anchor) {
        if (last.kind === "session") last.events.push(event);
        else items[items.length - 1] = { kind: "session", id: `s-${anchor.id}`, events: [anchor, event] };
        continue;
      }
    }
    items.push({ kind: "event", event });
  }
  return items;
}

export function sessionSummary(events: AuditEvent[]) {
  const resources = new Map<string, string>();
  let connections = 0;
  let calls = 0;
  let starts = 0;
  for (const e of events) {
    if (e.action === "tunnel.opened") connections += 1;
    if (e.action === "http.request") calls += 1;
    if (e.action === "agent.bootstrap") starts += 1;
    if (e.resource) resources.set(e.resource.id, e.resource.name);
  }
  return { connections, calls, starts, resources: [...resources.values()] };
}
