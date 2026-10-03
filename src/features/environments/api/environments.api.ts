import { apiDelete, apiGet, apiPatch } from "@/shared/api/http";
import type { Environment } from "../types";

export const getEnvironment = (envId: string) => apiGet<Environment>(`/environments/${envId}`);
export const updateEnvironment = (envId: string, body: { name?: string; killed?: boolean; reason?: string }) =>
  apiPatch<Environment>(`/environments/${envId}`, body);
export const deleteEnvironment = (envId: string) => apiDelete<{ deleted: true }>(`/environments/${envId}`);
