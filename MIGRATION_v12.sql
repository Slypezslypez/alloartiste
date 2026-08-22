-- Ajoute les champs permettant d'illustrer la page "Comment ça marche" via l'admin
ALTER TABLE "SiteSettings" ADD COLUMN "howArtistsImageUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "howArtistsImagePositionX" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "SiteSettings" ADD COLUMN "howArtistsImagePositionY" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "SiteSettings" ADD COLUMN "howOrganizersImageUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "howOrganizersImagePositionX" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "SiteSettings" ADD COLUMN "howOrganizersImagePositionY" INTEGER NOT NULL DEFAULT 50;
