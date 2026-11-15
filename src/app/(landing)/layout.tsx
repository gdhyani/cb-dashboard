import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRODUCT_NAME, SITE_URL } from "@/constants";
import { LANDING_MOTION_CLASS } from "@/features/landing";
import "lenis/dist/lenis.css";
import "@/features/landing/landing.css";

const title = `${PRODUCT_NAME}: develop with zero secrets`;
const description =
  "cb gives every developer's app placeholder keys instead of the real ones in .env. cb adds the real keys on its own server, so npm packages, logs and AI agents only ever see placeholders.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title,
  description,
  openGraph: { title, description, type: "website", siteName: PRODUCT_NAME },
  twitter: { card: "summary_large_image", title, description },
};

// Before first paint: hide reveal targets only when motion is allowed (content stays visible without JS).
const BOOT = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('${LANDING_MOTION_CLASS}')`;

/**
 * Public route group for `/`: no sign-in, no dashboard design system, no app providers or Tailwind (only landing.css).
 * Its type is the root layout's brand fonts (Archivo, Fragment Mono).
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static boot flag, no user input */}
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      {children}
    </>
  );
}
