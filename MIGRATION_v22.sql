-- Permet à l'artiste de mettre en avant ses événements à venir (badge sur sa vignette dans
-- "Découvrir les artistes" + section "Prochains événements" sur sa fiche publique).
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Event_artistId_idx" ON "Event"("artistId");
CREATE INDEX "Event_date_idx" ON "Event"("date");

ALTER TABLE "Event" ADD CONSTRAINT "Event_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
