import {
  siAnthropic,
  siApple,
  siFirebase,
  siGithub,
  siGoogle,
  siGooglecloud,
  siGooglegemini,
  siMistralai,
  siMongodb,
  siMysql,
  siOpenrouter,
  siPostgresql,
  siRazorpay,
  siRedis,
  siStripe,
} from "simple-icons";

const ICONS: Record<string, { path: string }> = {
  anthropic: siAnthropic,
  apple: siApple,
  firebase: siFirebase,
  github: siGithub,
  google: siGoogle,
  googlecloud: siGooglecloud,
  googlegemini: siGooglegemini,
  mistralai: siMistralai,
  mongodb: siMongodb,
  mysql: siMysql,
  openrouter: siOpenrouter,
  postgresql: siPostgresql,
  razorpay: siRazorpay,
  redis: siRedis,
  stripe: siStripe,
};

/** Monochrome brand mark (simple-icons) or a short text badge ("letter:AI"); decorative, the name is always shown next to it. */
export function ServiceLogo({ icon, className = "" }: { icon: string; className?: string }) {
  const known = ICONS[icon];
  const text = icon.startsWith("letter:") ? icon.slice("letter:".length) : icon.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className={`inline-grid size-5 shrink-0 place-items-center rounded-md border border-border-strong bg-card text-foreground ${className}`}
    >
      {known ? (
        <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
          <path d={known.path} />
        </svg>
      ) : (
        <span className="font-mono text-[9px] font-semibold leading-none">{text}</span>
      )}
    </span>
  );
}
