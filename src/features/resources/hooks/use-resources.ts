import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/resources.api";
import { resourceKeys } from "../api/resources.keys";
import type { CreateResourceInput } from "../types";

export const useResources = (envId: string) =>
  useQuery({ queryKey: resourceKeys.list(envId), queryFn: () => api.listResources(envId) });

export function useResourceMutations(envId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["environments", envId] });
  return {
    create: useMutation({
      mutationFn: (body: CreateResourceInput) => api.createResource(envId, body),
      onSuccess: (r) => {
        notifySuccess(`${r.name} added — credentials stored write-only`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    rotate: useMutation({
      mutationFn: ({ id, ...body }: { id: string; connectionUri?: string; apiKey?: string }) =>
        api.rotateResource(id, body),
      onSuccess: () => {
        notifySuccess("Credentials rotated");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.deleteResource(id),
      onSuccess: refresh,
      onError: (e) => notifyError(e),
    }),
  };
}
