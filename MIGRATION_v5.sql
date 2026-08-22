CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'AlloArtiste',
    "logoPart1" TEXT NOT NULL DEFAULT 'ALLO',
    "logoPart2" TEXT NOT NULL DEFAULT 'ARTISTE',
    "tagline" TEXT NOT NULL DEFAULT 'Plateforme de mise en relation entre artistes et organisateurs en Belgique',
    "heroLine1" TEXT NOT NULL DEFAULT 'TROUVEZ',
    "heroEmphasis" TEXT NOT NULL DEFAULT 'L''ARTISTE',
    "heroLine2" TEXT NOT NULL DEFAULT 'QU''IL VOUS FAUT',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Musiciens, danseurs, comédiens, DJs, plasticiens... chaque profil présente jusqu''à 5 photos et 5 vidéos pour se montrer sous son meilleur jour. Contactez directement l''artiste pour un devis.',
    "statCommissionValue" TEXT NOT NULL DEFAULT '0%',
    "statCommissionLabel" TEXT NOT NULL DEFAULT 'Commission',
    "statDirectValue" TEXT NOT NULL DEFAULT 'Direct',
    "statDirectLabel" TEXT NOT NULL DEFAULT 'Organisateur → Artiste',
    "spotlightArtistId1" TEXT,
    "spotlightArtistId2" TEXT,
    "contactReceiverEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id") VALUES ('singleton');
