import { apiGet } from "@/shared/api/http";
import type { Org } from "../types";

export const listOrgs = () => apiGet<Org[]>("/orgs");
export const getOrg = (orgId: string) => apiGet<Org>(`/orgs/${orgId}`);
