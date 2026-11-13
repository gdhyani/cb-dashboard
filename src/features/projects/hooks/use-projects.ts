import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/projects.api";
import { projectKeys } from "../api/projects.keys";

export const useProjects = (orgId: string) =>
  useQuery({ queryKey: projectKeys.list(orgId), queryFn: () => api.listProjects(orgId) });
export const useProject = (projectId: string) =>
  useQuery({ queryKey: projectKeys.detail(projectId), queryFn: () => api.getProject(projectId) });

export function useProjectMutations(orgId: string) {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["orgs", orgId] }),
      client.invalidateQueries({ queryKey: ["projects"] }),
    ]);
  return {
    create: useMutation({
      mutationFn: (body: { name: string; description?: string }) => api.createProject(orgId, body),
      onSuccess: (p) => {
        notifySuccess(`Project ${p.name} created`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (projectId: string) => api.deleteProject(projectId),
      onSuccess: () => refresh(),
      onError: (e) => notifyError(e),
    }),
    createEnvironment: useMutation({
      mutationFn: ({ projectId, name }: { projectId: string; name: string }) => api.createEnvironment(projectId, name),
      onSuccess: () => refresh(),
      onError: (e) => notifyError(e),
    }),
  };
}

/** Project Settings › General: rename and describe (admins; the backend enforces it too). */
export function useUpdateProject(orgId: string, projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description: string }) => api.updateProject(projectId, body),
    onSuccess: (project) => {
      client.setQueryData(projectKeys.detail(projectId), project);
      notifySuccess("Project updated");
      return Promise.all([
        client.invalidateQueries({ queryKey: ["orgs", orgId] }),
        client.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
    onError: (e) => notifyError(e),
  });
}
