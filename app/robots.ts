import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/apercu", "/connexion", "/en-construction", "/verifier-email", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"]
      },
      // Robots d'analyse SEO / collecte de données qui ne rapportent aucun visiteur : on leur demande de ne pas visiter le site.
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "PetalBot", "Bytespider", "BLEXBot", "DataForSeoBot"],
        disallow: "/"
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
