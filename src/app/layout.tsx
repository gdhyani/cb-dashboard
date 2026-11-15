import type { Metadata } from "next";
import { Archivo, Fragment_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants";
import { THEME_BOOT_SCRIPT } from "@/shared/theme/theme";

// No CSS and no providers here: each section loads its own (landing: landing.css only; dashboard: app.css +
// AppProviders; docs and blog: globals.css + AppProviders), so the landing page ships none of the app.
// The cb brand type on every page (landing, dashboard, docs, blog): Archivo for text, Fragment Mono for code.
const brandSans = Archivo({ variable: "--brand-font-sans", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const brandMono = Fragment_Mono({ variable: "--brand-font-mono", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: PRODUCT_TAGLINE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // One theme for every page (`cb-theme`): the boot script sets data-theme (landing, dashboard, docs tokens) and the
    // `dark` class (Fumadocs) before first paint, hence suppressHydrationWarning on <html> only.
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${brandSans.variable} ${brandMono.variable}`}
    >
      <head>
        {/*
         * Theme (light/dark) before first paint, on every route, so a light-theme reader never sees a dark flash.
         * A plain inline script in <head>: server-rendered and only hydrated, so React never renders it on the client
         * (next/script beforeInteractive did, and React 19 warns about that).
         */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme boot script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
