import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/actualites`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/comment-ca-marche`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/conditions`, changeFrequency: "yearly", priority: 0.2 }
  ];

  // Seuls les profils réellement visibles publiquement (abonnement actif) doivent apparaître :
  // les autres renvoient une 404, inutile de les proposer à l'indexation.
  const artists = await prisma.artist.findMany({
    select: { id: true, subscriptionStatus: true, currentPeriodEnd: true, updatedAt: true }
  });
  const artistRoutes: MetadataRoute.Sitemap = artists
    .filter((a) => isSubscriptionVisible(a))
    .map((a) => ({
      url: `${baseUrl}/profil/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8
    }));

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/actualites/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...staticRoutes, ...artistRoutes, ...articleRoutes];
}
