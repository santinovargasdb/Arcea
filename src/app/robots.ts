import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
