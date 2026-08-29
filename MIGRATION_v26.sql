-- Fourchette de prix indicative (facultative), en euros.
ALTER TABLE "Artist" ADD COLUMN "priceMin" INTEGER;
ALTER TABLE "Artist" ADD COLUMN "priceMax" INTEGER;
