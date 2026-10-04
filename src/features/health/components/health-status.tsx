"use client";

import { motion } from "motion/react";
import { formatDuration } from "@/shared/lib/format-duration";
import { useHealth } from "../hooks/use-health";

export function HealthStatus() {
  const { data, error, isPending } = useHealth();

  return (
    <section
      aria-label="Backend status"
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground"
    >
      <span className="text-subtle">backend</span>
      {isPending && <span>checking…</span>}
      {data && (
        <motion.span
          key={data.status}
          initial={{ y: 2 }}
          animate={{ y: 0 }}
          className="flex flex-wrap items-baseline gap-x-3"
        >
          <span className="text-foreground">{data.status}</span>
          {Object.entries(data.checks).map(([name, state]) => (
            <span key={name}>{`${name} ${state}`}</span>
          ))}
          <span>{formatDuration(data.uptimeSec)}</span>
          <span className="text-subtle">{`v${data.version}`}</span>
        </motion.span>
      )}
      {error && (
        <span role="alert" className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-destructive">{error.code}</span>
          <span>{error.message}</span>
          <span className="text-subtle">{`correlation id ${error.correlationId}`}</span>
        </span>
      )}
    </section>
  );
}
