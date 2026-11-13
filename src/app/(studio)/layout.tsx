import { Inter, Manrope, Source_Code_Pro } from "next/font/google";
import type { ReactNode } from "react";
import { Splash } from "@/shared/components/splash";

// Supabase Studio's type: Inter for UI text, Manrope for headings, Source Code Pro for code and micro-labels.
// Loaded here, so docs and other public pages never download them.
const inter = Inter({ subsets: ["latin"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], display: "swap" });

const fontVars = `:root{--studio-font-sans:${inter.style.fontFamily};--studio-font-heading:${manrope.style.fontFamily};--studio-font-mono:${sourceCodePro.style.fontFamily}}`;

/**
 * Every dashboard route (sign-in, device approval, invites, the org app) renders inside this layout. The
 * `data-studio` marker switches on the dashboard design system (styles/studio.css); nothing outside this group
 * (docs, blog, marketing) is styled by it.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div data-studio="" className="min-h-dvh bg-background text-foreground">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static font-family names from next/font */}
      <style dangerouslySetInnerHTML={{ __html: fontVars }} />
      <Splash />
      {children}
    </div>
  );
}
