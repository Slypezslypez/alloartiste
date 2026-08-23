ALTER TABLE "Artist" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Artist" ADD COLUMN "emailVerificationTokenHash" TEXT;
ALTER TABLE "Artist" ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Artist_emailVerificationTokenHash_key" ON "Artist"("emailVerificationTokenHash");
