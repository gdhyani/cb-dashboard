import { useQuery } from "@tanstack/react-query";
import * as api from "../api/orgs.api";
import { orgKeys } from "../api/orgs.keys";

export const useOrgs = () => useQuery({ queryKey: orgKeys.all, queryFn: api.listOrgs });

export function useOrg(orgId: string) {
  const query = useQuery({ queryKey: orgKeys.detail(orgId), queryFn: () => api.getOrg(orgId) });
  const role = query.data?.role;
  return { ...query, isAdmin: role === "owner" || role === "admin", isOwner: role === "owner" };
}
