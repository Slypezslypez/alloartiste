-- Fil de conversation sur les demandes de contact (Lead) : réponses de l'artiste ET du producteur,
-- accessibles depuis une page dédiée (artiste : espace connecté / producteur : lien secret par email).

-- 1) Jeton public par demande, pour la page de suivi du producteur (pas de connexion requise).
ALTER TABLE "Lead" ADD COLUMN "followupToken" TEXT;

-- Génère un jeton aléatoire pour toutes les demandes déjà existantes (sinon la colonne ne peut pas
-- devenir UNIQUE + NOT NULL).
UPDATE "Lead" SET "followupToken" = md5(random()::text || clock_timestamp()::text) WHERE "followupToken" IS NULL;

ALTER TABLE "Lead" ALTER COLUMN "followupToken" SET NOT NULL;
CREATE UNIQUE INDEX "Lead_followupToken_key" ON "Lead"("followupToken");

-- 2) Table des messages du fil (une ligne par réponse, artiste ou producteur).
CREATE TABLE "LeadMessage" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadMessage_leadId_idx" ON "LeadMessage"("leadId");

ALTER TABLE "LeadMessage"
  ADD CONSTRAINT "LeadMessage_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
