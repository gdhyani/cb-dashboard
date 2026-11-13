import { cn } from "@/shared/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("shimmer rounded-[4px]", className)} {...props} />;
}

export { Skeleton };
