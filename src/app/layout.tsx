import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants";
import { AppProviders } from "@/shared/providers/app-providers";
import { THEME_BOOT_SCRIPT } from "@/shared/theme/theme";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: PRODUCT_TAGLINE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `dark`: docs (Fumadocs) key their tokens off this class. Dashboard pages also get data-theme (light/dark)
    // from their boot script before hydration, hence suppressHydrationWarning on <html> only.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        {/* Dashboard theme (light/dark) before first paint; only dashboard tokens read data-theme, docs ignore it. */}
        <Script id="cb-theme" strategy="beforeInteractive">
          {THEME_BOOT_SCRIPT}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
