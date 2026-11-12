"use client";

import { PageNav } from "@/shared/components/page-nav";

/** Project sub-pages as underline tabs, below lg only (wider screens have the product menu). */
export function ProjectNav({ orgId, projectId, isAdmin }: { orgId: string; projectId: string; isAdmin: boolean }) {
  const base = `/orgs/${orgId}/projects/${projectId}`;
  if (!isAdmin) return null;
  return (
    <div className="lg:hidden">
      <PageNav
        label="Project"
        items={[
          { href: base, label: "Overview", exact: true },
          { href: `${base}/access`, label: "Access" },
          { href: `${base}/settings`, label: "Settings" },
        ]}
      />
    </div>
  );
}
