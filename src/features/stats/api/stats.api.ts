import { apiGet } from "@/shared/api/http";
import type { OrgStats } from "../types";

export const getOrgStats = (orgId: string) => apiGet<OrgStats>(`/orgs/${orgId}/stats`);
