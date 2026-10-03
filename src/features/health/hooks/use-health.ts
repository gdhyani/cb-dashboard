import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/health.api";
import { healthKeys } from "../api/health.keys";

export function useHealth() {
  return useQuery({ queryKey: healthKeys.all, queryFn: getHealth, refetchInterval: 15_000 });
}
