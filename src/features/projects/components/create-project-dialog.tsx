"use client";

import { useState } from "react";
import { FormField } from "@/shared/components/form-field";
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
import { Textarea } from "@/shared/ui/textarea";
import { useProjectMutations } from "../hooks/use-projects";
import type { Project } from "../types";

/**
 * Without `open`/`onOpenChange` it renders its own "New project" button. Controlled, it renders no trigger
 * (the project switcher opens it). `onCreated` runs with the new project after a successful create.
 */
export function CreateProjectDialog({
  orgId,
  open: controlledOpen,
  onOpenChange,
  onCreated,
}: {
  orgId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (project: Project) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => (controlled ? onOpenChange?.(next) : setUncontrolledOpen(next));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { create } = useProjectMutations(orgId);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <DialogTrigger asChild>
          <Button>New project</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Starts with development and staging environments.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              { name, ...(description ? { description } : {}) },
              {
                onSuccess: (project) => {
                  setOpen(false);
                  setName("");
                  setDescription("");
                  onCreated?.(project);
                },
              },
            );
          }}
        >
          <FormField id="project-name" label="Name">
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shop API"
              autoFocus
            />
          </FormField>
          <FormField id="project-description" label="Description (optional)">
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </FormField>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
