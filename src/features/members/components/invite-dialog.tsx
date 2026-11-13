"use client";

import { useState } from "react";
import type { Role } from "@/features/auth/types";
import { Admonition } from "@/shared/components/admonition";
import { CopyCommand } from "@/shared/components/copy-command";
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
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useMemberMutations } from "../hooks/use-members";
import { ROLE_LABEL } from "../lib/member-query";

/** J4: create a one-time invite link to copy (no email sending). Owners can also invite owners. */
export function InviteDialog({
  orgId,
  isOwner,
  open,
  onOpenChange,
}: {
  orgId: string;
  isOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState<Role>("developer");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string>();
  const { createInvite } = useMemberMutations(orgId);
  const roles: Role[] = ["developer", "admin", ...(isOwner ? (["owner"] as Role[]) : [])];

  const change = (next: boolean) => {
    if (!next) {
      setRole("developer");
      setEmail("");
      setLink(undefined);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>Create a link that adds one person to this organization</DialogDescription>
        </DialogHeader>
        {link ? (
          <>
            <Admonition type="success" title="Invite link created">
              Share it with the person you are inviting. It works once and expires in 7 days.
            </Admonition>
            <CopyCommand command={link} label="Copy invite link" prompt={false} />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setLink(undefined)}>
                Invite another
              </Button>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            method="post"
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createInvite.mutate(
                { role, ...(email.trim() ? { email: email.trim() } : {}) },
                { onSuccess: (inv) => setLink(inv.url) },
              );
            }}
          >
            <FormField id="invite-email" label="Email" aside="Optional" hint="Only this address can accept the invite">
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </FormField>
            <FormField id="invite-role" label="Role" hint="Developers use the environments they are granted">
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={createInvite.isPending}>
                Create invite link
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
