CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Conseils',
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📰',
    "gradient" TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #d4af37, #8b6b1f)',
    "readTime" TEXT NOT NULL DEFAULT '4 min',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

INSERT INTO "Article" ("id", "slug", "title", "excerpt", "category", "body", "icon", "gradient", "readTime", "createdAt")
VALUES (
  'seed-article-1',
  'reussir-sa-fiche-artiste',
  $title$5 conseils pour une fiche artiste qui donne envie de réserver$title$,
  $excerpt$Vos photos, votre bio, vos vidéos : chaque détail compte pour convaincre un organisateur en quelques secondes.$excerpt$,
  'Conseils carrière',
  $body$Un organisateur passe en moyenne moins de 30 secondes sur un profil avant de décider s'il vous contacte ou passe au suivant. Voici ce qui fait vraiment la différence sur cette courte fenêtre d'attention.

1. La photo principale doit vous montrer en action, pas en portrait statique. Une image de scène, d'atelier ou de performance transmet immédiatement votre univers, bien plus qu'une photo de profil classique.

2. Variez vos photos : évitez cinq versions du même angle. Montrez différentes facettes de votre pratique — un gros plan sur votre matériel, une vue d'ensemble de votre installation, un moment de public.

3. Une bio courte et concrète bat toujours un texte long et vague. Mentionnez votre style, votre expérience (nombre d'événements, types de lieux), et ce qui vous distingue.

4. Ajoutez au moins une vidéo, même courte. C'est souvent l'élément qui transforme une visite en demande de contact — les organisateurs veulent voir avant d'imaginer.

5. Complétez votre ville et vos disciplines précisément : c'est ce qui vous fait apparaître dans les bonnes recherches, au bon moment.$body$,
  '🎨',
  'linear-gradient(135deg, #d4af37, #8b6b1f)',
  '4 min',
  '2026-06-08 00:00:00'
);

INSERT INTO "Article" ("id", "slug", "title", "excerpt", "category", "body", "icon", "gradient", "readTime", "createdAt")
VALUES (
  'seed-article-2',
  'bien-briefer-un-artiste',
  $title$Organisateurs : comment bien briefer un artiste avant l'événement$title$,
  $excerpt$Lieu, horaires, matériel technique, public attendu... un bon brief évite la plupart des malentendus le jour J.$excerpt$,
  'Conseils organisateurs',
  $body$La majorité des incidents le jour d'un événement viennent d'un détail non communiqué à l'avance, pas d'un manque de professionnalisme. Voici les informations à transmettre systématiquement.

Le lieu et l'accès : adresse précise, étage, ascenseur ou escaliers, zone de déchargement, horaires d'accès au bâtiment. Un artiste qui doit porter du matériel lourd sur trois étages sans ascenseur a besoin de le savoir avant.

Le matériel technique disponible sur place : sonorisation, éclairage, prises électriques, et ce que l'artiste doit apporter lui-même. Ne présumez jamais que « le lieu est équipé » sans vérifier précisément.

Le public et le format : nombre de personnes attendues, tranche d'âge, ambiance recherchée (cocktail, concert assis, animation de rue). Ces éléments influencent directement la prestation.

Le timing exact : heure d'arrivée pour l'installation, heure de début, durée de la prestation, heure de démontage. Prévoyez toujours une marge, les imprévus font partie du métier.

Enfin, un contact sur place joignable le jour même évite bien des stress si un détail doit être ajusté en dernière minute.$body$,
  '📋',
  'linear-gradient(135deg, #6b7280, #374151)',
  '5 min',
  '2026-05-24 00:00:00'
);

INSERT INTO "Article" ("id", "slug", "title", "excerpt", "category", "body", "icon", "gradient", "readTime", "createdAt")
VALUES (
  'seed-article-3',
  'tarifer-sa-prestation',
  $title$Comment fixer le prix de sa prestation artistique$title$,
  $excerpt$Entre le temps de préparation, le déplacement et le matériel, voici une méthode simple pour arriver à un tarif juste.$excerpt$,
  'Conseils carrière',
  $body$Fixer son tarif est souvent l'exercice le plus inconfortable pour un artiste indépendant. Une méthode simple : décomposer le prix en quatre blocs plutôt que de sortir un chiffre au feeling.

1. Le temps de prestation réel — ce que dure votre passage sur scène ou votre intervention.

2. Le temps invisible — préparation, répétition, trajet, installation et démontage. C'est souvent sous-évalué alors qu'il représente parfois plus de temps que la prestation elle-même.

3. Le matériel et son usure — instruments, matériel technique, costumes, consommables. Un tarif qui ne couvre pas l'entretien du matériel n'est pas viable sur la durée.

4. La rareté et l'expérience — un savoir-faire spécifique ou une forte demande justifient un tarif plus élevé que la moyenne du secteur.

Une fois ces quatre blocs additionnés, comparez avec ce que pratiquent d'autres artistes de votre discipline dans votre région pour ajuster si besoin. N'hésitez pas non plus à prévoir un tarif différent pour un particulier et pour une entreprise ou une collectivité — le budget disponible n'est généralement pas le même.$body$,
  '💰',
  'linear-gradient(135deg, #16a34a, #065f46)',
  '6 min',
  '2026-05-12 00:00:00'
);

INSERT INTO "Article" ("id", "slug", "title", "excerpt", "category", "body", "icon", "gradient", "readTime", "createdAt")
VALUES (
  'seed-article-4',
  'checklist-avant-evenement',
  $title$La checklist à cocher avant chaque événement$title$,
  $excerpt$Contrat, acompte, plan d'accès, contact sur place... la liste qui évite le stress de dernière minute.$excerpt$,
  'Conseils organisateurs',
  $body$Un événement réussi se prépare autant en amont que le jour même. Voici la liste minimale à cocher, que vous soyez organisateur ou artiste.

Au moins deux semaines avant : confirmation écrite (email suffit) de la date, de l'heure, du lieu et du tarif convenu. Un acompte, même symbolique, sécurise l'engagement des deux côtés.

Une semaine avant : partage du plan d'accès, des contraintes techniques du lieu, et du programme précis de la journée.

La veille : un message de confirmation rapide, avec le numéro de téléphone du contact sur place le jour J.

Le jour même : prévoir un créneau d'installation avec une marge, et garder une bouteille d'eau et un espace calme à disposition de l'artiste avant sa prestation.

Après l'événement : un petit mot de remerciement ou un retour rapide fait souvent la différence pour une future collaboration.$body$,
  '✅',
  'linear-gradient(135deg, #d4af37, #b8860b)',
  '3 min',
  '2026-05-02 00:00:00'
);
