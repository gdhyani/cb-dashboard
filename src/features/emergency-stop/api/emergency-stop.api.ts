import { apiDelete, apiGet, apiPost } from "@/shared/api/http";
import type { EmergencyStop, StopScope } from "../types";

export const listStops = (orgId: string) => apiGet<EmergencyStop[]>(`/orgs/${orgId}/killswitches`);
export const activateStop = (orgId: string, body: { scope: StopScope; targetId?: string; reason: string }) =>
  apiPost<EmergencyStop>(`/orgs/${orgId}/killswitches`, body);
export const clearStop = (id: string) => apiDelete<EmergencyStop>(`/killswitches/${id}`);
