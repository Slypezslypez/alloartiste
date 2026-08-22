ALTER TABLE "Artist" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "Artist" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Artist_resetTokenHash_key" ON "Artist"("resetTokenHash");
