CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "eventLocation" TEXT,
    "amount" DOUBLE PRECISION,
    "note" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contract_artistId_idx" ON "Contract"("artistId");

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
