-- Passage de "specialty" (une seule spécialité, texte) à "specialties" (jusqu'à 3, liste de textes).
-- 1) On crée la nouvelle colonne.
-- 2) On reprend automatiquement l'ancienne valeur de chaque artiste dans la nouvelle liste.
-- 3) On supprime l'ancienne colonne, devenue inutile.

ALTER TABLE "Artist" ADD COLUMN "specialties" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "Artist"
SET "specialties" = ARRAY["specialty"]
WHERE "specialty" IS NOT NULL AND "specialty" <> '';

ALTER TABLE "Artist" DROP COLUMN "specialty";
