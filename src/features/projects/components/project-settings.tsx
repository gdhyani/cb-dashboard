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
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useProject, useProjectMutations, useUpdateProject } from "../hooks/use-projects";
import type { Project } from "../types";
import { ProjectNav } from "./project-nav";

/** Mirrors the backend's UpdateProjectBody. */
const ProjectSettingsSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name").max(80, "Use at most 80 characters"),
  description: z.string().trim().max(500, "Use at most 500 characters"),
});
type ProjectSettingsValues = z.infer<typeof ProjectSettingsSchema>;

/** Project › Settings: name and description, slug to copy, and deleting the project (admins, FR-UI-004). */
export function ProjectSettings({ orgId, projectId }: { orgId: string; projectId: string }) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  return (
    <PageContainer size="small">
      <PageHeader
        title="Project Settings"
        description="General configuration and lifecycle of this project"
        nav={<ProjectNav orgId={orgId} projectId={projectId} isAdmin={org.isAdmin} />}
      />
      <QueryState
        isPending={project.isPending || org.isPending}
        error={project.error ?? org.error}
        skeleton={
          <div className="pt-10 md:pt-12">
            <SkeletonRows rows={3} />
          </div>
        }
      >
        {project.data &&
          (org.isAdmin ? (
            <>
              <GeneralSection orgId={orgId} project={project.data} />
              <DangerSection orgId={orgId} project={project.data} />
            </>
          ) : (
            <Section>
              <Admonition title="Only owners and admins can change project settings">
                Ask an admin of this organization if you need a change here
              </Admonition>
            </Section>
          ))}
      </QueryState>
    </PageContainer>
  );
}

function GeneralSection({ orgId, project }: { orgId: string; project: Project }) {
  const update = useUpdateProject(orgId, project.id);
  const form = useForm<ProjectSettingsValues>({
    resolver: zodResolver(ProjectSettingsSchema),
    defaultValues: { name: project.name, description: project.description },
  });
  const { errors, isDirty } = form.formState;

  // Keep the form in step with the saved project (after a save, or another admin's change) unless mid-edit.
  useEffect(() => {
    if (!form.formState.isDirty) form.reset({ name: project.name, description: project.description });
  }, [project.name, project.description, form]);

  const submit = form.handleSubmit((values) =>
    update.mutate(values, { onSuccess: (saved) => form.reset({ name: saved.name, description: saved.description }) }),
  );

  return (
    <Section title="General">
      <Card>
        <form method="post" noValidate onSubmit={submit}>
          <CardContent>
            <FormItemLayout
              id="project-name"
              label="Project name"
              description="Shown across the dashboard"
              error={errors.name?.message}
            >
              <Input id="project-name" aria-invalid={Boolean(errors.name)} {...form.register("name")} />
            </FormItemLayout>
          </CardContent>
          <CardContent>
            <FormItemLayout
              id="project-description"
              label="Description"
              description="A short note on what this project is for"
              optional
              error={errors.description?.message}
            >
              <Textarea
                id="project-description"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...form.register("description")}
              />
            </FormItemLayout>
          </CardContent>
          <CardContent>
            <FormItemLayout
              id="project-slug"
              label="Project slug"
              description="Used by the CLI in npx cb init --project; it does not change when you rename"
            >
              <div className="flex items-center gap-1">
                <Input id="project-slug" readOnly value={project.slug} className="font-mono" />
                <CopyButton value={project.slug} label="Copy project slug" toastLabel="Project slug copied" />
              </div>
            </FormItemLayout>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty || update.isPending}
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty} loading={update.isPending}>
              Save
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Section>
  );
}

function DangerSection({ orgId, project }: { orgId: string; project: Project }) {
  const router = useRouter();
  const { remove } = useProjectMutations(orgId);
  const [open, setOpen] = useState(false);
  return (
    <Section title="Danger zone">
      <Admonition
        type="destructive"
        title="Delete this project"
        actions={
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            Delete project
          </Button>
        }
      >
        Permanently removes its environments, variables, services and access grants. Running apps lose access. This
        cannot be undone
      </Admonition>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${project.name}?`}
        description="All environments, variables, services and grants are deleted. Running apps lose access."
        confirmLabel="Delete project"
        requireReason
        onConfirm={() => remove.mutateAsync(project.id, { onSuccess: () => router.replace(`/orgs/${orgId}/projects`) })}
      />
    </Section>
  );
}
