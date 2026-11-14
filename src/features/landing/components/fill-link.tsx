import Link from "next/link";

/** Primary / secondary call to action: a highlighter sweeps in from the pointer's side and the label re-keys. */
export function FillLink({
  href,
  label,
  variant = "primary",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inverse";
  className?: string;
}) {
  return (
    <Link href={href} aria-label={label} className={`lp-btn lp-btn--${variant} ${className}`} data-fill="">
      <span className="lp-btn__fill" data-fill-layer="" aria-hidden="true" />
      <span className="lp-btn__label" data-fill-label="" aria-hidden="true">
        {label}
      </span>
      <span className="lp-btn__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
