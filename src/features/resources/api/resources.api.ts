import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/shared/api/http";
import type {
  CreateResourceInput,
  CredentialProfile,
  CredentialsInput,
  Preset,
  Resource,
  ResourceTestResult,
} from "../types";

export const listResources = (envId: string) => apiGet<Resource[]>(`/environments/${envId}/resources`);
export const createResource = (envId: string, body: CreateResourceInput) =>
  apiPost<Resource>(`/environments/${envId}/resources`, body);
export const rotateResource = (resourceId: string, body: CredentialsInput) =>
  apiPatch<Resource>(`/resources/${resourceId}`, body);
export const deleteResource = (resourceId: string) => apiDelete<{ deleted: true }>(`/resources/${resourceId}`);

export const listProfiles = (resourceId: string) => apiGet<CredentialProfile[]>(`/resources/${resourceId}/profiles`);
export const createProfile = (resourceId: string, body: CredentialsInput & { name: string }) =>
  apiPost<CredentialProfile>(`/resources/${resourceId}/profiles`, body);
export const rotateProfile = (resourceId: string, name: string, body: CredentialsInput) =>
  apiPut<CredentialProfile>(`/resources/${resourceId}/profiles/${encodeURIComponent(name)}`, body);
export const deleteProfile = (resourceId: string, name: string) =>
  apiDelete<{ deleted: true }>(`/resources/${resourceId}/profiles/${encodeURIComponent(name)}`);

export const listPresets = () => apiGet<Preset[]>("/presets");
export const testResource = (resourceId: string, profile?: string) =>
  apiPost<ResourceTestResult>(`/resources/${resourceId}/test`, profile ? { profile } : {});
