-- Nouveaux champs sur Artist : ville, téléphone, réseaux sociaux, note, vues, vérifié
ALTER TABLE "Artist" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Artist" ADD COLUMN "phone" TEXT;
ALTER TABLE "Artist" ADD COLUMN "website" TEXT;
ALTER TABLE "Artist" ADD COLUMN "facebook" TEXT;
ALTER TABLE "Artist" ADD COLUMN "instagram" TEXT;
ALTER TABLE "Artist" ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Artist" ADD COLUMN "reviewsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Artist" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Artist" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Artist_city_idx" ON "Artist"("city");

-- Nouvelle table : demandes de contact ("leads")
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderPhone" TEXT,
    "eventDate" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_artistId_idx" ON "Lead"("artistId");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
