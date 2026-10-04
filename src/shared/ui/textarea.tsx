import type * as React from "react";
import { cn } from "@/shared/lib/utils";
import { fieldClasses } from "./input";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClasses, "min-h-20 resize-y py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export { Textarea };
