import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/resources.api";
import { resourceKeys } from "../api/resources.keys";
import type { CreateResourceInput, CredentialsInput } from "../types";

export const useResources = (envId: string) =>
  useQuery({ queryKey: resourceKeys.list(envId), queryFn: () => api.listResources(envId) });

export const usePresets = () =>
  useQuery({ queryKey: resourceKeys.presets, queryFn: api.listPresets, staleTime: 60 * 60 * 1000 });

/** J2: test a resource's real credentials from the gateway; the result is kept per resource+profile. */
export function useTestResource(resourceId: string) {
  return useMutation({
    mutationFn: (profile?: string) => api.testResource(resourceId, profile),
    onSuccess: (r) =>
      r.ok
        ? notifySuccess(`Connection ok — ${r.message} (${r.latencyMs} ms)`)
        : notifyError(undefined, `Connection failed — ${r.message}`),
    onError: (e) => notifyError(e),
  });
}

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
    updateCa: useMutation({
      mutationFn: ({ id, caCert }: { id: string; caCert: string }) => api.rotateResource(id, { caCert }),
      onSuccess: (_r, v) => {
        notifySuccess(v.caCert ? "CA certificate saved" : "CA certificate removed");
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

/** Unified Variables: replace a value or change settings (tested first), remove or disable a service. */
export function useServiceMutations(envId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["environments", envId] });
  return {
    /** Errors (e.g. SERVICE_TEST_FAILED) are shown inline by the dialog, not as toasts. */
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.updateResource(id, body),
      onSuccess: () => {
        notifySuccess("Saved — running apps reconnect automatically");
        return refresh();
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.deleteResource(id),
      onSuccess: () => {
        notifySuccess("Removed — live connections closed");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
  };
}
