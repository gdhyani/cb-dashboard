import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/api-error";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/variables.api";
import { variableKeys } from "../api/variables.keys";
import type { CreateVariableInput } from "../types";

export const useVariables = (envId: string) =>
  useQuery({ queryKey: variableKeys.list(envId), queryFn: () => api.listVariables(envId) });
export const usePreview = (envId: string, userId: string | undefined) =>
  useQuery({
    queryKey: variableKeys.preview(envId, userId ?? ""),
    queryFn: () => api.previewAs(envId, userId ?? ""),
    enabled: Boolean(userId),
  });

export function useVariableMutations(envId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["environments", envId] });
  return {
    create: useMutation({
      mutationFn: (body: CreateVariableInput) => api.createVariable(envId, body),
      onSuccess: (v) => {
        notifySuccess(`${v.key} saved — running apps restart automatically`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    /** Several at once (resource presets); existing keys are skipped. One toast for the batch. */
    createMany: useMutation({
      mutationFn: async (bodies: CreateVariableInput[]) => {
        let created = 0;
        for (const body of bodies) {
          try {
            await api.createVariable(envId, body);
            created += 1;
          } catch (err) {
            if (!(err instanceof ApiError && err.code === "CONFLICT")) throw err;
          }
        }
        return created;
      },
      onSuccess: (n) => {
        if (n) notifySuccess(`${n} variable${n > 1 ? "s" : ""} added`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: string; value?: string; format?: string }) => api.updateVariable(id, body),
      onSuccess: refresh,
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.deleteVariable(id),
      onSuccess: refresh,
      onError: (e) => notifyError(e),
    }),
  };
}
