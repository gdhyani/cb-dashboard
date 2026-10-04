import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/resources.api";
import { resourceKeys } from "../api/resources.keys";
import type { CreateResourceInput, CredentialsInput } from "../types";

export const useResources = (envId: string) =>
  useQuery({ queryKey: resourceKeys.list(envId), queryFn: () => api.listResources(envId) });

export const useProfiles = (resourceId: string) =>
  useQuery({ queryKey: resourceKeys.profiles(resourceId), queryFn: () => api.listProfiles(resourceId) });

export function useResourceMutations(envId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["environments", envId] });
  return {
    create: useMutation({
      mutationFn: (body: CreateResourceInput) => api.createResource(envId, body),
      onSuccess: (r) => {
        notifySuccess(`${r.name} added. Credentials stored write-only.`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    rotate: useMutation({
      mutationFn: ({ id, body }: { id: string; body: CredentialsInput }) => api.rotateResource(id, body),
      onSuccess: () => {
        notifySuccess("Credentials rotated");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.deleteResource(id),
      onSuccess: () => {
        notifySuccess("Resource deleted");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
  };
}

export function useProfileMutations(resourceId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: resourceKeys.profiles(resourceId) });
  return {
    create: useMutation({
      mutationFn: (body: CredentialsInput & { name: string }) => api.createProfile(resourceId, body),
      onSuccess: (p) => {
        notifySuccess(`Profile ${p.name} added`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    rotate: useMutation({
      mutationFn: ({ name, body }: { name: string; body: CredentialsInput }) =>
        api.rotateProfile(resourceId, name, body),
      onSuccess: (p) => {
        notifySuccess(`Profile ${p.name} rotated`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (name: string) => api.deleteProfile(resourceId, name),
      onSuccess: () => {
        notifySuccess("Profile deleted");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
  };
}
