"use client";

import { useNotebookLayout } from "fumadocs-ui/layouts/notebook";
import { PanelLeft } from "lucide-react";

/** Phones: opens the docs sidebar drawer (pages, plus the site links). Only rendered inside the docs layout. */
export function DocsSidebarTrigger() {
  const { slots } = useNotebookLayout();
  const Trigger = slots.sidebar?.trigger;
  if (!Trigger) return null;
  return (
    <Trigger
      aria-label="Open the docs menu"
      className="flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
    >
      <PanelLeft className="size-4" strokeWidth={1.5} />
    </Trigger>
  );
}
