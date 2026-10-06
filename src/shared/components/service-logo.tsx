import { Braces, Cloud, KeyRound, type LucideIcon, Mail } from "lucide-react";
import {
  siAnthropic,
  siApple,
  siAstro,
  siBun,
  siDeno,
  siDocker,
  siFastify,
  siFirebase,
  siGithub,
  siGoogle,
  siGooglecloud,
  siGooglegemini,
  siMistralai,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siNuxt,
  siOpenrouter,
  siPostgresql,
  siPrisma,
  siPython,
  siRazorpay,
  siReact,
  siReactrouter,
  siRedis,
  siStripe,
  siSupabase,
  siSvelte,
  siVite,
  siVitest,
} from "simple-icons";

const ICONS: Record<string, { path: string; hex: string }> = {
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
  // Razorpay's mark colour is a navy that disappears on black; use its light brand blue.
  razorpay: { ...siRazorpay, hex: "3395FF" },
  redis: siRedis,
  stripe: siStripe,
  supabase: siSupabase,
  // Platforms (docs, FR-DOC-009).
  astro: siAstro,
  bun: siBun,
  deno: siDeno,
  docker: siDocker,
  fastify: siFastify,
  nestjs: siNestjs,
  nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  nuxt: siNuxt,
  prisma: siPrisma,
  python: siPython,
  react: siReact,
  reactrouter: siReactrouter,
  svelte: siSvelte,
  vite: siVite,
  vitest: siVitest,
};

/** Types with no brand mark (simple-icons has no AWS logo): a coloured glyph instead of a letter badge. */
const GLYPHS: Record<string, { Icon: LucideIcon; hex: string }> = {
  aws: { Icon: Cloud, hex: "FF9900" },
  secret: { Icon: KeyRound, hex: "FBBF24" },
  mail: { Icon: Mail, hex: "38BDF8" },
  api: { Icon: Braces, hex: "F472B6" },
};

/** Owner trial (PRD v1.32): brand-coloured marks. Set to false to go back to monochrome. */
const BRAND_COLORS = true;

/** Relative luminance (WCAG) of a 6-digit hex colour. */
function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** The brand colour, unless it is too dark to see on the black background (Anthropic, Apple, GitHub). */
const markColor = (hex: string) => (BRAND_COLORS && luminance(hex) > 0.05 ? `#${hex}` : undefined);

/** The colour a logo is drawn in (brand mark or glyph), or undefined when it is drawn in the text colour. */
export function logoColor(icon: string): string | undefined {
  const hex = ICONS[icon]?.hex ?? GLYPHS[icon]?.hex;
  return hex ? markColor(hex) : undefined;
}

/** Brand mark (simple-icons) or a short text badge ("letter:AI"); decorative, the name is always shown next to it. */
export function ServiceLogo({ icon, className = "" }: { icon: string; className?: string }) {
  const known = ICONS[icon];
  const text = icon.startsWith("letter:") ? icon.slice("letter:".length) : icon.slice(0, 2).toUpperCase();
  const glyph = GLYPHS[icon];
  const color = logoColor(icon);
  return (
    <span
      aria-hidden
      className={`inline-grid size-5 shrink-0 place-items-center rounded-md text-foreground ${known || glyph ? "" : "bg-white/[0.06]"} ${className}`}
    >
      {known ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="currentColor"
          style={color ? { color } : undefined}
        >
          <path d={known.path} />
        </svg>
      ) : glyph ? (
        <glyph.Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} style={color ? { color } : undefined} />
      ) : (
        <span className="font-mono text-[9px] font-semibold leading-none">{text}</span>
      )}
    </span>
  );
}
