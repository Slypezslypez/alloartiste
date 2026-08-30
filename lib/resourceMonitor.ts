import { prisma } from "@/lib/prisma";

// Vérifie l'usage de trois ressources externes dont dépend le site, pour prévenir Silvio par
// email avant qu'un quota gratuit ne soit dépassé (ce qui déclencherait soit une facturation,
// soit un blocage du service selon le fournisseur). Chaque fournisseur a une façon différente
// d'exposer son usage :
// - Cloudflare R2 (stockage photos/vidéos) : GraphQL Analytics API de Cloudflare.
// - Neon (temps de calcul de la base de données) : API de gestion Neon (compute_time_seconds).
// - Neon (stockage de la base de données) : requête SQL directe (pg_database_size), plus fiable
//   qu'une API externe puisqu'elle ne dépend d'aucun jeton ni du plan tarifaire de Neon.
// Chaque fonction est volontairement tolérante aux erreurs (jeton absent, API indisponible,
// forme de réponse inattendue) : elle renvoie alors ok:false avec un message d'erreur plutôt que
// de faire échouer toute la vérification quotidienne.

export type ResourceStatus = {
  key: string;
  name: string;
  usedLabel: string;
  limitLabel: string;
  percent: number | null;
  ok: boolean;
  error?: string;
};

// Limites des paliers gratuits (à ajuster ici si Silvio change de forfait chez un fournisseur).
const R2_FREE_LIMIT_GB = 10;
const NEON_STORAGE_LIMIT_GB = 0.5;
const NEON_COMPUTE_LIMIT_HOURS = 100;

export async function checkR2Usage(): Promise<ResourceStatus> {
  const name = "Stockage R2 (photos & vidéos)";
  const key = "r2Storage";
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucket = process.env.S3_BUCKET;

  if (!token || !accountId || !bucket) {
    return {
      key,
      name,
      usedLabel: "?",
      limitLabel: `${R2_FREE_LIMIT_GB} Go`,
      percent: null,
      ok: false,
      error: "CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID ou S3_BUCKET manquant(e)."
    };
  }

  try {
    const now = new Date();
    const start = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const end = now.toISOString();
    const query = `
      query R2Storage($accountTag: string!, $start: Time, $end: Time, $bucketName: string) {
        viewer {
          accounts(filter: { accountTag: $accountTag }) {
            r2StorageAdaptiveGroups(
              limit: 1
              filter: { datetime_geq: $start, datetime_leq: $end, bucketName: $bucketName }
              orderBy: [datetime_DESC]
            ) {
              max { payloadSize metadataSize objectCount }
              dimensions { datetime }
            }
          }
        }
      }`;
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { accountTag: accountId, start, end, bucketName: bucket }
      })
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      return {
        key,
        name,
        usedLabel: "?",
        limitLabel: `${R2_FREE_LIMIT_GB} Go`,
        percent: null,
        ok: false,
        error: json?.errors?.[0]?.message || `Cloudflare a répondu ${res.status}.`
      };
    }
    const group = json?.data?.viewer?.accounts?.[0]?.r2StorageAdaptiveGroups?.[0];
    if (!group) {
      return {
        key,
        name,
        usedLabel: "0 Go",
        limitLabel: `${R2_FREE_LIMIT_GB} Go`,
        percent: 0,
        ok: true
      };
    }
    const bytes = Number(group.max?.payloadSize || 0) + Number(group.max?.metadataSize || 0);
    const gb = bytes / 1024 ** 3;
    return {
      key,
      name,
      usedLabel: `${gb.toFixed(2)} Go`,
      limitLabel: `${R2_FREE_LIMIT_GB} Go`,
      percent: (gb / R2_FREE_LIMIT_GB) * 100,
      ok: true
    };
  } catch (e) {
    return {
      key,
      name,
      usedLabel: "?",
      limitLabel: `${R2_FREE_LIMIT_GB} Go`,
      percent: null,
      ok: false,
      error: e instanceof Error ? e.message : "Erreur inconnue."
    };
  }
}

export async function checkNeonCompute(): Promise<ResourceStatus> {
  const name = "Temps de calcul de la base de données (Neon)";
  const key = "neonCompute";
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID;

  if (!apiKey || !projectId) {
    return {
      key,
      name,
      usedLabel: "?",
      limitLabel: `${NEON_COMPUTE_LIMIT_HOURS} h`,
      percent: null,
      ok: false,
      error: "NEON_API_KEY ou NEON_PROJECT_ID manquant(e)."
    };
  }

  try {
    const res = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        key,
        name,
        usedLabel: "?",
        limitLabel: `${NEON_COMPUTE_LIMIT_HOURS} h`,
        percent: null,
        ok: false,
        error: json?.message || `Neon a répondu ${res.status}.`
      };
    }
    const seconds = json?.project?.compute_time_seconds;
    if (typeof seconds !== "number") {
      return {
        key,
        name,
        usedLabel: "?",
        limitLabel: `${NEON_COMPUTE_LIMIT_HOURS} h`,
        percent: null,
        ok: false,
        error: "Le champ compute_time_seconds est absent de la réponse Neon (plan ou API modifiés ?)."
      };
    }
    const hours = seconds / 3600;
    return {
      key,
      name,
      usedLabel: `${hours.toFixed(1)} h`,
      limitLabel: `${NEON_COMPUTE_LIMIT_HOURS} h`,
      percent: (hours / NEON_COMPUTE_LIMIT_HOURS) * 100,
      ok: true
    };
  } catch (e) {
    return {
      key,
      name,
      usedLabel: "?",
      limitLabel: `${NEON_COMPUTE_LIMIT_HOURS} h`,
      percent: null,
      ok: false,
      error: e instanceof Error ? e.message : "Erreur inconnue."
    };
  }
}

export async function checkDatabaseStorage(): Promise<ResourceStatus> {
  const name = "Stockage de la base de données (Neon)";
  const key = "neonStorage";
  try {
    const rows = await prisma.$queryRawUnsafe<{ size: bigint | number }[]>(
      "SELECT pg_database_size(current_database()) AS size"
    );
    const bytes = Number(rows[0]?.size || 0);
    const gb = bytes / 1024 ** 3;
    return {
      key,
      name,
      usedLabel: `${gb.toFixed(3)} Go`,
      limitLabel: `${NEON_STORAGE_LIMIT_GB} Go`,
      percent: (gb / NEON_STORAGE_LIMIT_GB) * 100,
      ok: true
    };
  } catch (e) {
    return {
      key,
      name,
      usedLabel: "?",
      limitLabel: `${NEON_STORAGE_LIMIT_GB} Go`,
      percent: null,
      ok: false,
      error: e instanceof Error ? e.message : "Erreur inconnue."
    };
  }
}

export async function checkAllResources(): Promise<ResourceStatus[]> {
  return Promise.all([checkR2Usage(), checkNeonCompute(), checkDatabaseStorage()]);
}
