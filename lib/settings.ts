import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

async function fetchSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });
}

// Mis en cache 60s : évite une requête (upsert) à la base de données à chaque
// changement de page — c'était la cause du léger décalage ressenti sur le menu.
// L'admin (app/api/admin/settings/route.ts) invalide ce cache immédiatement après
// une modification via revalidateTag("site-settings").
export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  revalidate: 60,
  tags: ["site-settings"]
});
