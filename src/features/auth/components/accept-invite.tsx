"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { BadgeLabel } from "@/shared/components/badge-label";
import { FormField } from "@/shared/components/form-field";
import { QueryState } from "@/shared/components/query-state";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAcceptInvite, useInvitePreview, useMe } from "../hooks/use-auth";
import { AcceptInviteSchema } from "../schemas/auth.schemas";
import { AuthCard } from "./auth-card";

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const preview = useInvitePreview(token);
  const me = useMe();
  const accept = useAcceptInvite();
  const form = useForm<z.infer<typeof AcceptInviteSchema>>({
    resolver: zodResolver(AcceptInviteSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const errors = form.formState.errors;
  const goToOrg = (orgId: string) => router.replace(`/orgs/${orgId}`);

  return (
    <AuthCard
      title={preview.data ? `Join ${preview.data.orgName}` : "Join organization"}
      description={
        preview.data && (
          <span className="flex items-center gap-2">
            You were invited as <BadgeLabel tone="strong">{preview.data.role}</BadgeLabel>
          </span>
        )
      }
    >
      <QueryState isPending={preview.isPending} error={preview.error}>
        {me.data ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{me.data.user.email}</span>.
            </p>
            <Button
              disabled={accept.isPending}
              onClick={() => accept.mutate({ token }, { onSuccess: (r) => goToOrg(r.orgId) })}
            >
              Accept invite
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((v) => accept.mutate({ token, ...v }, { onSuccess: (r) => goToOrg(r.orgId) }))}
          >
            <FormField id="name" label="Your name" error={errors.name?.message}>
              <Input id="name" autoComplete="name" {...form.register("name")} />
            </FormField>
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                defaultValue={preview.data?.email ?? ""}
                {...form.register("email")}
              />
            </FormField>
            <FormField id="password" label="Password" error={errors.password?.message} hint="At least 8 characters.">
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            </FormField>
            <Button type="submit" disabled={accept.isPending}>
              Create account and join
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                className="text-foreground underline underline-offset-4"
                href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
              >
                Log in first
              </Link>
            </p>
          </form>
        )}
      </QueryState>
    </AuthCard>
  );
}
