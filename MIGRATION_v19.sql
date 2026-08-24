-- Calendrier de disponibilité : chaque artiste peut bloquer des dates où il n'est pas disponible.
CREATE TABLE "UnavailableDate" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UnavailableDate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UnavailableDate_artistId_date_key" ON "UnavailableDate"("artistId", "date");
CREATE INDEX "UnavailableDate_artistId_idx" ON "UnavailableDate"("artistId");

ALTER TABLE "UnavailableDate"
  ADD CONSTRAINT "UnavailableDate_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
