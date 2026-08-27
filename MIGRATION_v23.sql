-- Ajoute une sous-spécialité libre au sein de la famille (ex. "Bassiste" ou "Trompettiste"
-- sous "Musicien·ne", "Cracheur de feu" sous "Artiste de rue"). Visible immédiatement dans
-- les suggestions et les filtres du catalogue, corrigeable en masse depuis Admin.
ALTER TABLE "Artist" ADD COLUMN "specialty" TEXT;
