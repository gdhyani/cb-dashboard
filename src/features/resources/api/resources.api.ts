import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http";
import type { CreateResourceInput, Resource } from "../types";

export const listResources = (envId: string) => apiGet<Resource[]>(`/environments/${envId}/resources`);
export const createResource = (envId: string, body: CreateResourceInput) =>
  apiPost<Resource>(`/environments/${envId}/resources`, body);
export const rotateResource = (resourceId: string, body: { connectionUri?: string; apiKey?: string }) =>
  apiPatch<Resource>(`/resources/${resourceId}`, body);
export const deleteResource = (resourceId: string) => apiDelete<{ deleted: true }>(`/resources/${resourceId}`);
