import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Supabase Button. Green is rare: only `default` (the page's one primary action) uses the deep green plate.
 * Everything else is the raised grey `secondary`, a quiet `ghost`, or an `outline`/`dashed` frame.
 * Sizes follow Studio's density: 26px is the everyday size, 34px for auth pages and big forms.
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-center font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-solid bg-[linear-gradient(to_bottom,rgb(255_255_255/0.015),rgb(0_0_0/0.01))] text-primary-solid-foreground shadow-raised hover:bg-primary-solid-hover data-[state=open]:bg-primary-solid-hover [&_svg]:opacity-60",
        secondary:
          "border-transparent bg-surface-300 text-foreground shadow-control hover:bg-selection data-[state=open]:bg-selection [&_svg]:text-foreground-lighter",
        outline:
          "border-border-strong bg-transparent text-foreground hover:border-foreground-muted data-[state=open]:border-border-stronger [&_svg]:text-foreground-lighter",
        dashed:
          "border-dashed border-border-strong bg-transparent text-foreground hover:border-border-control-hover [&_svg]:text-foreground-lighter",
        ghost:
          "border-transparent text-foreground hover:bg-accent data-[state=open]:bg-accent [&_svg]:text-foreground-lighter",
        inverse: "border-transparent bg-foreground text-background shadow-control hover:bg-foreground/90",
        destructive:
          "border-transparent bg-destructive-solid text-white shadow-raised hover:bg-destructive-solid-hover [&_svg]:opacity-70",
        "destructive-ghost": "border-transparent text-destructive hover:bg-destructive/10",
        warning: "border-transparent bg-warning text-warning-foreground shadow-raised hover:bg-warning/90",
        link: "h-auto border-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[28px] px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-[26px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[34px] px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        icon: "size-[28px] [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-[26px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3.5",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "default", size: "default", block: false },
  },
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner in place of the content (width kept); the button is disabled while loading. */
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      className={cn(buttonVariants({ variant, size, block, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="absolute animate-spin" aria-hidden="true" />}
          <span className={cn("inline-flex items-center gap-1.5", loading && "invisible")}>{children}</span>
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
