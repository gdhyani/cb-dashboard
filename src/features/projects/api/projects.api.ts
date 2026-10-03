import { apiDelete, apiGet, apiPost } from "@/shared/api/http";
import type { Project } from "../types";

export const listProjects = (orgId: string) => apiGet<Project[]>(`/orgs/${orgId}/projects`);
export const getProject = (projectId: string) => apiGet<Project>(`/projects/${projectId}`);
export const createProject = (orgId: string, body: { name: string; description?: string; environments?: string[] }) =>
  apiPost<Project>(`/orgs/${orgId}/projects`, body);
export const deleteProject = (projectId: string) => apiDelete<{ deleted: true }>(`/projects/${projectId}`);
export const createEnvironment = (projectId: string, name: string) =>
  apiPost<unknown>(`/projects/${projectId}/environments`, { name });
