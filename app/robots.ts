import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/en-construction", "/verifier-email", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
