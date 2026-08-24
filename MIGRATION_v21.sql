-- L'artiste peut choisir d'afficher ou de masquer son calendrier de disponibilité sur son profil public.
ALTER TABLE "Artist" ADD COLUMN "calendarVisible" BOOLEAN NOT NULL DEFAULT true;
