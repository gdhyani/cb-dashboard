import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants";
import { LandingPage } from "@/features/landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: PRODUCT_NAME,
  description: PRODUCT_TAGLINE,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  license: "https://www.apache.org/licenses/LICENSE-2.0",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from constants
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
