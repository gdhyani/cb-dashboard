"use client";

import { motion } from "motion/react";
import { StatusDot } from "@/shared/components/status-dot";
import { formatDuration } from "@/shared/lib/format-duration";
import { useHealth } from "../hooks/use-health";

/** Small Studio-style status line: a dot, "Backend healthy", each check, uptime and the mono version. */
export function HealthStatus() {
  const { data, error, isPending } = useHealth();

  return (
    <section
      aria-label="Backend status"
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-lighter"
    >
      {isPending && (
        <>
          <StatusDot tone="unknown" label="Checking" />
          <span>Checking backend…</span>
        </>
      )}
      {data && (
        <motion.span
          key={data.status}
          initial={{ y: 2 }}
          animate={{ y: 0 }}
          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
        >
          <StatusDot
            tone={data.status === "ok" ? "ok" : "rejected"}
            label={data.status === "ok" ? "Healthy" : "Degraded"}
          />
          <span className="text-foreground">{data.status === "ok" ? "Backend healthy" : "Backend degraded"}</span>
          {Object.entries(data.checks).map(([name, state]) => (
            <span key={name} className="flex items-center gap-x-2">
              <span aria-hidden="true">·</span>
              <span className={state === "down" ? "text-destructive" : undefined}>{`${name} ${state}`}</span>
            </span>
          ))}
          <span aria-hidden="true">·</span>
          <span>{`Up ${formatDuration(data.uptimeSec)}`}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{`v${data.version}`}</span>
        </motion.span>
      )}
      {error && (
        <span role="alert" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <StatusDot tone="rejected" label="Unreachable" />
          <span className="text-foreground">Backend unreachable</span>
          <span className="font-mono text-destructive">{error.code}</span>
          <span>{error.message}</span>
          <span className="font-mono">{`correlation id ${error.correlationId}`}</span>
        </span>
      )}
    </section>
  );
}
