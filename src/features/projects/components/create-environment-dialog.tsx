"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { useProjectMutations } from "../hooks/use-projects";
import type { Project } from "../types";

/** Admin-only: add an environment to a project (lowercase name, e.g. preview). */
export function CreateEnvironmentDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { createEnvironment } = useProjectMutations(project.orgId);
  const change = (next: boolean) => {
    setOpen(next);
    if (!next) setName("");
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger asChild>
        <Button variant="dashed" size="sm">
          <Plus strokeWidth={1.5} />
          New environment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create environment</DialogTitle>
          <DialogDescription>Gets its own variables, services and access in {project.name}</DialogDescription>
        </DialogHeader>
        <form
          method="post"
          className="flex flex-col gap-4"
          onSubmit={(ev) => {
            ev.preventDefault();
            createEnvironment.mutate({ projectId: project.id, name }, { onSuccess: () => change(false) });
          }}
        >
          <FormField id="environment-name" label="Name" hint="Lowercase, for example preview or qa">
            <Input
              id="environment-name"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="preview"
              className="font-mono"
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim()} loading={createEnvironment.isPending}>
              Create environment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
