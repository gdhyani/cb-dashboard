import { useQuery } from "@tanstack/react-query";
import { getOrgStats } from "../api/stats.api";
import { statsKeys } from "../api/stats.keys";

export const useOrgStats = (orgId: string) =>
  useQuery({ queryKey: statsKeys.org(orgId), queryFn: () => getOrgStats(orgId), refetchInterval: 30_000 });
