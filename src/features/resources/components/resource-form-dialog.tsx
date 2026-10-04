"use client";

import { useState } from "react";
import { FormField } from "@/shared/components/form-field";
import { SecretInput } from "@/shared/components/secret-input";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useResourceMutations } from "../hooks/use-resources";
import type { CreateResourceInput, ResourceKind } from "../types";

const KIND_HINT: Record<ResourceKind, string> = {
  mongodb: "mongodb://user:password@host:27017/db?authSource=admin",
  redis: "redis://user:password@host:6379/0",
  postgres: "postgresql://user:password@host:5432/db?sslmode=require",
  mysql: "mysql://user:password@host:3306/db",
  smtp: "smtp://user:password@smtp.provider.com:587",
  http: "https://api.provider.com",
};

const KIND_LABEL: Record<ResourceKind, string> = {
  mongodb: "MongoDB",
  redis: "Redis",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  smtp: "SMTP",
  http: "HTTP API",
};

/** J2: add a resource. Credentials are write-only (FR-UI-001): they go to the backend and are never shown again. */
export function ResourceFormDialog({ envId }: { envId: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ResourceKind>("mongodb");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [authScheme, setAuthScheme] = useState<"bearer" | "x-api-key" | "basic-password">("bearer");
  const [fakePrefix, setFakePrefix] = useState("cb_");
  const [basePath, setBasePath] = useState("");
  const [redirectHosts, setRedirectHosts] = useState("");
  const { create } = useResourceMutations(envId);

  const reset = () => {
    setName("");
    setSecret("");
    setUpstreamUrl("");
    setBasePath("");
    setRedirectHosts("");
  };
  const body = (): CreateResourceInput =>
    kind === "http"
      ? {
          kind,
          name,
          upstreamUrl,
          authScheme,
          apiKey: secret,
          fakePrefix,
          basePath,
          redirectHosts: redirectHosts.split(/[\s,]+/).filter(Boolean),
        }
      : { kind, name, connectionUri: secret };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Add resource</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add resource</DialogTitle>
          <DialogDescription>
            Real credentials stay on the server. Developers only ever get per-device fake values.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(body(), {
              onSuccess: () => {
                setOpen(false);
                reset();
              },
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField id="resource-kind" label="Type">
              <Select value={kind} onValueChange={(v) => setKind(v as ResourceKind)}>
                <SelectTrigger id="resource-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_LABEL) as ResourceKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="resource-name" label="Name">
              <Input
                id="resource-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={kind === "http" ? "payments-api" : `main-${kind}`}
              />
            </FormField>
          </div>
          {kind === "http" && (
            <>
              <FormField id="resource-upstream" label="Upstream URL" hint="Where real requests go (https only).">
                <Input
                  id="resource-upstream"
                  value={upstreamUrl}
                  onChange={(e) => setUpstreamUrl(e.target.value)}
                  placeholder={KIND_HINT.http}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField id="resource-auth" label="Auth header">
                  <Select value={authScheme} onValueChange={(v) => setAuthScheme(v as typeof authScheme)}>
                    <SelectTrigger id="resource-auth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearer">Authorization: Bearer</SelectItem>
                      <SelectItem value="x-api-key">x-api-key</SelectItem>
                      <SelectItem value="basic-password">Basic (password)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField id="resource-prefix" label="Fake key prefix">
                  <Input
                    id="resource-prefix"
                    value={fakePrefix}
                    onChange={(e) => setFakePrefix(e.target.value)}
                    className="font-mono"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField id="resource-basepath" label="Base path (optional)" hint="e.g. /v1 for base-URL SDKs">
                  <Input
                    id="resource-basepath"
                    value={basePath}
                    onChange={(e) => setBasePath(e.target.value)}
                    className="font-mono"
                  />
                </FormField>
                <FormField
                  id="resource-redirects"
                  label="Redirect hosts (optional)"
                  hint="host:443 for SDKs with a fixed host"
                >
                  <Input
                    id="resource-redirects"
                    value={redirectHosts}
                    onChange={(e) => setRedirectHosts(e.target.value)}
                    className="font-mono"
                    placeholder="api.stripe.com:443"
                  />
                </FormField>
              </div>
            </>
          )}
          <FormField
            id="resource-secret"
            label={kind === "http" ? "Real API key" : "Real connection URI"}
            hint="Write-only. Stored encrypted; never shown again."
          >
            <SecretInput
              id="resource-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={kind === "http" ? "sk_live_…" : KIND_HINT[kind]}
            />
          </FormField>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || !secret || (kind === "http" && !upstreamUrl) || create.isPending}
            >
              Save resource
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
