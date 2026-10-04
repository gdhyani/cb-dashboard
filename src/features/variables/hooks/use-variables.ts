import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
