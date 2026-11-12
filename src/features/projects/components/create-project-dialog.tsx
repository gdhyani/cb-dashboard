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
  size = "default",
}: {
  orgId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (project: Project) => void;
  /** Trigger size: `sm` in toolbars. */
  size?: "default" | "sm";
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : uncontrolledOpen;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const setOpen = (next: boolean) => {
    if (controlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
    if (!next) {
      setName("");
      setDescription("");
    }
  };
  const { create } = useProjectMutations(orgId);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <DialogTrigger asChild>
          <Button size={size}>
            <Plus strokeWidth={1.5} />
            New project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Starts with development and staging environments</DialogDescription>
        </DialogHeader>
        <form
          method="post"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              { name, ...(description ? { description } : {}) },
              {
                onSuccess: (project) => {
                  setOpen(false);
                  onCreated?.(project);
                },
              },
            );
          }}
        >
          <FormField id="project-name" label="Name" hint="Shown across the dashboard and the CLI">
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shop API"
              autoFocus
            />
          </FormField>
          <FormField id="project-description" label="Description" aside="Optional">
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim()} loading={create.isPending}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
