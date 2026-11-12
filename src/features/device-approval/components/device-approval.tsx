"use client";

import { useState } from "react";
import { AuthCard, useMe } from "@/features/auth";
import { Admonition } from "@/shared/components/admonition";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useApproveDevice } from "../hooks/use-approve-device";

/** FR-AUTH-002: confirm the code printed by `npx cb login`. */
export function DeviceApproval({ initialCode }: { initialCode: string }) {
  const me = useMe();
  const approve = useApproveDevice();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [deviceName, setDeviceName] = useState("");

  if (approve.data) {
    return (
      <AuthCard title="Device approved" description="Return to your terminal. The CLI is now signed in">
        <Admonition type="success" title={approve.data.deviceName}>
          {approve.data.os}
        </Admonition>
      </AuthCard>
    );
  }
  return (
    <AuthCard
      title="Approve CLI sign-in"
      description={
        me.data ? (
          <>
            Signed in as <span className="text-foreground">{me.data.user.email}</span>. Only approve a code you just
            requested
          </>
        ) : (
          "Only approve a code you just requested"
        )
      }
    >
      <form
        method="post"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          approve.mutate({ userCode: code.trim(), ...(deviceName.trim() ? { deviceName: deviceName.trim() } : {}) });
        }}
      >
        <FormField id="code" label="Code from your terminal" hint="Looks like ABCD-EFGH">
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-11 text-center font-mono text-lg tracking-[0.3em]"
            autoComplete="off"
            autoFocus={!initialCode}
          />
        </FormField>
        <FormField id="device" label="Device name" aside="Optional">
          <Input
            id="device"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Work laptop"
          />
        </FormField>
        <Button type="submit" size="lg" block loading={approve.isPending} disabled={code.trim().length < 9}>
          Approve
        </Button>
      </form>
    </AuthCard>
  );
}
