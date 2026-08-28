// Arborescence fermée métier (famille) -> spécialités. Remplace l'ancien système de texte libre
// avec suggestions : la spécialité se choisit désormais dans une liste fixe, propre à chaque
// famille, avec "Autre" en dernier recours (champ à compléter). Voir aussi lib/categories.ts
// pour la liste des familles elles-mêmes (dérivée des clés ci-dessous, plus "Autre").

export const SPECIALTY_TREE: Record<string, string[]> = {
  "Musicien": [
    "Accordéoniste", "Bassiste", "Batteur", "Claviériste", "Contrebassiste", "Guitariste",
    "Harmoniciste", "Harpiste", "Organiste", "Percussionniste", "Pianiste", "Saxophoniste",
    "Trompettiste", "Violoncelliste", "Violoniste", "Multi-instrumentiste", "Musicien de studio",
    "Musicien de rue"
  ],
  "Chanteur": [
    "Chanteur solo", "Chanteuse solo", "Auteur-compositeur-interprète", "Chanteur lyrique",
    "Chanteur de variété", "Chanteur pop", "Chanteur rock", "Chanteur jazz", "Chanteur folk",
    "Chanteur rap", "Chanteur soul ou gospel", "Chanteur de reprises", "Choriste", "Imitateur vocal"
  ],
  "Groupe musical": [
    "Groupe de reprises", "Groupe pop", "Groupe rock", "Groupe jazz", "Groupe folk",
    "Groupe de musique traditionnelle", "Groupe de bal", "Groupe acoustique", "Groupe vocal",
    "Chorale", "Orchestre", "Big band", "Fanfare", "Quatuor à cordes", "Tribute band"
  ],
  "DJ et musique électronique": [
    "DJ généraliste", "DJ de mariage", "DJ de soirée", "DJ de club", "DJ animateur",
    "Producteur de musique électronique", "Beatmaker", "VJ – artiste vidéo", "Live performer électronique"
  ],
  "Compositeur et créateur musical": [
    "Compositeur", "Auteur de chansons", "Parolier", "Arrangeur musical", "Orchestrateur",
    "Producteur musical", "Réalisateur artistique", "Ingénieur du son", "Sound designer",
    "Créateur de musique de film", "Créateur de jingles", "Musicien de studio"
  ],
  "Comédien": [
    "Comédien de théâtre", "Acteur de cinéma", "Acteur de télévision", "Comédien publicitaire",
    "Comédien d’improvisation", "Comédien humoristique", "Figurante ou figurant", "Silhouette",
    "Doublure", "Cascadeur", "Modèle vivant"
  ],
  "Voix": [
    "Comédien voix off", "Doubleur", "Narrateur", "Voix publicitaire", "Voix de documentaire",
    "Voix de livre audio", "Présentateur radio", "Podcasteur", "Imitateur"
  ],
  "Humoriste et artiste de scène": [
    "Humoriste", "Stand-upper", "Imitateur", "Chroniqueur humoristique", "Artiste de café-théâtre",
    "Clown", "Mime", "Ventriloque", "Crieur public"
  ],
  "Magicien et arts de l’illusion": [
    "Magicien de scène", "Magicien close-up", "Mentaliste", "Illusionniste",
    "Hypnotiseur de spectacle", "Prestidigitateur", "Pickpocket de spectacle",
    "Artiste de magie pour enfants", "Sculpteur de ballons", "Artiste de bulles"
  ],
  "Danseur": [
    "Danse classique", "Danse contemporaine", "Danse moderne", "Danse jazz", "Hip-hop",
    "Breakdance", "Danse de salon", "Salsa", "Tango", "Flamenco", "Danse orientale",
    "Danse africaine", "Danse folklorique", "Claquettes", "Pole dance", "Chorégraphe",
    "Professeur de danse", "Compagnie de danse"
  ],
  "Artiste de cirque": [
    "Acrobate", "Aérien", "Contorsionniste", "Équilibriste", "Funambule", "Jongleur",
    "Trapéziste", "Monocycliste", "Clown", "Cracheur de feu", "Échassier", "Artiste LED",
    "Artiste de rue"
  ],
  "Arts visuels": [
    "Peintre", "Dessinateur", "Illustrateur", "Portraitiste", "Caricaturiste", "Aquarelliste",
    "Pastelliste", "Artiste numérique", "Plasticien", "Graffeur", "Muraliste", "Calligraphe",
    "Collagiste", "Créateur de bandes dessinées", "Concept artist"
  ],
  "Sculpteur": [
    "Sculpture sur pierre", "Sculpture sur bois", "Sculpture sur métal", "Sculpture en argile",
    "Sculpture contemporaine", "Sculpture monumentale", "Modelage", "Moulage", "Statuaire",
    "Installation artistique"
  ],
  "Photographe": [
    "Photographe artistique", "Photographe portraitiste", "Photographe de mariage",
    "Photographe événementiel", "Photographe de spectacle", "Photographe de mode",
    "Photographe animalier", "Photographe culinaire", "Photographe immobilier",
    "Photographe de produits", "Photographe de presse", "Photographe scolaire", "Retoucheur photo"
  ],
  "Cinéma et vidéo": [
    "Réalisateur", "Vidéaste", "Cadreur", "Monteur vidéo", "Scénariste",
    "Directeur de la photographie", "Opérateur drone", "Documentariste", "Créateur de clips",
    "Créateur de vidéos publicitaires", "Créateur de contenu", "Animateur 2D", "Animateur 3D",
    "Artiste d’effets spéciaux"
  ],
  "Écrivain et littérature": [
    "Écrivain", "Romancier", "Poète", "Auteur jeunesse", "Auteur de théâtre", "Scénariste",
    "Biographe", "Conteur", "Slameur", "Parolier", "Correcteur", "Traducteur littéraire",
    "Illustrateur de livres"
  ],
  "Mode et création textile": [
    "Styliste", "Couturier", "Créateur de costumes", "Costumier de spectacle", "Modéliste",
    "Brodeur", "Chapelier", "Créateur textile", "Tisserand", "Dentellier",
    "Créateur d’accessoires", "Designer de mode"
  ],
  "Métiers d’art et artisanat": [
    "Céramiste", "Potier", "Verrier", "Souffleur de verre", "Vitrailliste", "Ébéniste",
    "Marqueteur", "Sculpteur sur bois", "Ferronnier d’art", "Forgeron d’art", "Graveur", "Doreur",
    "Relieur", "Restaurateur d’œuvres d’art", "Tapissier", "Mosaïste", "Luthier",
    "Facteur d’instruments", "Créateur de bijoux", "Orfèvre", "Joaillier", "Horloger",
    "Créateur de bougies", "Artisan du cuir"
  ],
  "Animation et événementiel": [
    "Animateur de soirée", "Maître de cérémonie", "Présentateur", "Animateur pour enfants",
    "Animateur musical", "Karaoké", "Quiz interactif", "Spectacle pour enfants", "Mascotte",
    "Père Noël", "Artiste de rue", "Organisateur d’événements", "Wedding planner",
    "Décorateur événementiel"
  ],
  "Technique du spectacle": [
    "Sonorisateur", "Ingénieur du son", "Technicien lumière", "Éclairagiste", "Régisseur",
    "Régisseur de scène", "Roadie", "Scénographe", "Décorateur de scène", "Accessoiriste",
    "Costumier", "Maquilleur artistique", "Coiffeur de spectacle", "Technicien vidéo"
  ]
};

// "Autre" est ajouté à la fin de chaque liste de spécialités (champ à compléter si choisi),
// pour ne jamais bloquer un artiste dont le talent précis ne figure pas encore dans la liste.
for (const key of Object.keys(SPECIALTY_TREE)) {
  SPECIALTY_TREE[key] = [...SPECIALTY_TREE[key], "Autre"];
}

export const FAMILIES = [...Object.keys(SPECIALTY_TREE), "Autre"];
