import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http";
import type { CreateVariableInput, Preview, Variable } from "../types";

export const listVariables = (envId: string) => apiGet<Variable[]>(`/environments/${envId}/variables`);
export const createVariable = (envId: string, body: CreateVariableInput) =>
  apiPost<Variable>(`/environments/${envId}/variables`, body);
export const updateVariable = (id: string, body: Partial<{ value: string; format: string; required: boolean }>) =>
  apiPatch<Variable>(`/variables/${id}`, body);
export const deleteVariable = (id: string) => apiDelete<{ deleted: true }>(`/variables/${id}`);
export const previewAs = (envId: string, userId: string) =>
  apiGet<Preview>(`/environments/${envId}/preview?userId=${userId}`);
