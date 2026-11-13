"use client";

import { GATEWAY_OVERHEAD } from "../../lib/blog-data";
import { HBarChart } from "./hbar-chart";

/** FR-DOC-010: milliseconds cb adds at the median (M7 T2 benchmark, localhost). The PRD target is 3 ms. */
export function GatewayOverheadChart() {
  return (
    <HBarChart
      title="Milliseconds cb adds per request, median (target: under 3 ms)"
      data={GATEWAY_OVERHEAD}
      tableLabel="Added latency through cb"
      valueLabel="Added ms (median)"
      format={(n) => `${n.toFixed(2)} ms`}
    />
  );
}