import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants";

/** Public pages (landing, docs, blog) are crawlable; the signed-in app and the API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/docs", "/blog"],
      disallow: ["/dashboard", "/orgs", "/device", "/invite", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
