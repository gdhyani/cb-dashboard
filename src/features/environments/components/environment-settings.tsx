"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { Admonition } from "@/shared/components/admonition";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { CopyButton } from "@/shared/components/copy-button";
import { FormItemLayout } from "@/shared/components/form-item-layout";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useEnvironment, useEnvironmentMutations } from "../hooks/use-environment";
import type { Environment } from "../types";
import { AdminsOnly } from "./environment-pages";
import { SuspensionControl } from "./suspension-control";

/** Mirrors the backend's EnvName (lower-cased before the check, like the server does). */
const EnvironmentNameSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z][a-z0-9-]{0,30}$/, "Use lowercase letters, digits and dashes, starting with a letter (max 31)"),
});
type EnvironmentNameValues = z.infer<typeof EnvironmentNameSchema>;

type EnvPageProps = { orgId: string; projectId: string; envId: string };

/** Environment › Settings: rename, suspend/resume, delete (admins, FR-UI-004). Rendered under the env header. */
export function EnvironmentSettings({ orgId, projectId, envId }: EnvPageProps) {
  const org = useOrg(orgId);
  const env = useEnvironment(envId);
  if (org.data && !org.isAdmin) return <AdminsOnly />;
  return (
    <div className="flex w-full max-w-[768px] flex-col">
      <QueryState
        isPending={env.isPending || org.isPending}
        error={env.error ?? org.error}
        skeleton={<SkeletonRows rows={3} />}
      >
        {env.data && (
          <>
            <GeneralSection env={env.data} />
            <Section
              title="Suspension"
              description="Stop every app and member from reaching this environment's services"
            >
              <SuspensionControl env={env.data} />
            </Section>
            <DangerSection orgId={orgId} projectId={projectId} env={env.data} />
          </>
        )}
      </QueryState>
    </div>
  );
}

function GeneralSection({ env }: { env: Environment }) {
  const { rename } = useEnvironmentMutations(env.id);
  const form = useForm<z.input<typeof EnvironmentNameSchema>, unknown, EnvironmentNameValues>({
    resolver: zodResolver(EnvironmentNameSchema),
    defaultValues: { name: env.name },
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (!form.formState.isDirty) form.reset({ name: env.name });
  }, [env.name, form]);

  const submit = form.handleSubmit(({ name }) =>
    rename.mutate(name, { onSuccess: (saved) => form.reset({ name: saved.name }) }),
  );

  return (
    // The first section sits right under the environment nav, so it skips the usual 48px top space.
    <Section title="General" className="pt-0 md:pt-0">
      <Card>
        <form method="post" noValidate onSubmit={submit}>
          <CardContent>
            <FormItemLayout
              id="environment-name"
              label="Environment name"
              description="Used by the CLI in npx cb init --env. Apps set up with the old name need the new one"
              error={errors.name?.message}
            >
              <Input
                id="environment-name"
                className="font-mono"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
            </FormItemLayout>
          </CardContent>
          <CardContent>
            <FormItemLayout id="environment-id" label="Environment ID" description="Quote it when asking for support">
              <div className="flex items-center gap-1">
                <Input id="environment-id" readOnly value={env.id} className="font-mono" />
                <CopyButton value={env.id} label="Copy environment ID" toastLabel="Environment ID copied" />
              </div>
            </FormItemLayout>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty || rename.isPending}
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty} loading={rename.isPending}>
              Save
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Section>
  );
}

function DangerSection({ orgId, projectId, env }: { orgId: string; projectId: string; env: Environment }) {
  const router = useRouter();
  const { remove } = useEnvironmentMutations(env.id);
  const [open, setOpen] = useState(false);
  return (
    <Section title="Danger zone">
      <Admonition
        type="destructive"
        title="Delete this environment"
        actions={
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            Delete environment
          </Button>
        }
      >
        Permanently removes its variables, services and access grants. Apps using it lose access. This cannot be undone
      </Admonition>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${env.name}?`}
        description="Its variables, services and grants are deleted. Running apps lose access."
        confirmLabel="Delete environment"
        onConfirm={() =>
          remove.mutateAsync(undefined, {
            onSuccess: () => router.replace(`/orgs/${orgId}/projects/${projectId}`),
          })
        }
      />
    </Section>
  );
}
