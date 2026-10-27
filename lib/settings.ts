import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

async function fetchSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });
}

// Mis en cache sans expiration automatique : la base de données n'est interrogée
// qu'une seule fois, puis à chaque modification dans l'admin
// (app/api/admin/settings/route.ts appelle revalidateTag("site-settings")).
// Avant, l'expiration à 60s réveillait la base Neon en permanence, même pour
// les robots qui visitent la page "en construction", et consommait le quota gratuit.
export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  revalidate: false,
  tags: ["site-settings"]
});
