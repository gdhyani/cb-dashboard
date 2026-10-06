"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { DOCS_PATH } from "@/constants";
import { DocsLink } from "@/shared/components/docs-link";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { PasswordInput } from "@/shared/components/password-input";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useSignup } from "../hooks/use-auth";
import { safeNext } from "../lib/next-path";
import { SignupSchema } from "../schemas/auth.schemas";
import { AuthCard } from "./auth-card";

export function SignupForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const signup = useSignup();
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: "", email: "", password: "", orgName: "" },
  });
  const errors = form.formState.errors;
  return (
    <AuthCard
      title="Create your organization"
      description="You'll be its owner. Invite your team after."
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            Log in
          </Link>
          <span className="mt-3 flex justify-center">
            <DocsLink href={DOCS_PATH}>Read the docs</DocsLink>
          </span>
        </>
      }
    >
      <form
        method="post"
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => signup.mutate(values, { onSuccess: () => router.replace(next) }))}
      >
        <FormField id="name" label="Your name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...form.register("name")} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message} hint="At least 8 characters.">
          <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
        </FormField>
        <FormField id="orgName" label="Organization" error={errors.orgName?.message}>
          <Input id="orgName" autoComplete="organization" {...form.register("orgName")} />
        </FormField>
        <FormError error={signup.error} />
        <Button type="submit" disabled={signup.isPending}>
          {signup.isPending ? "Creating…" : "Create organization"}
        </Button>
      </form>
    </AuthCard>
  );
}
