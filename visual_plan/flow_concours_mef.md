# Plan Visuel & Fiches de Production — Rapport Concours MEF (Ingénieurs d'État 1er Grade)

Ce plan visuel définit l'ensemble des spécifications et des prompts professionnels destinés à enrichir visuellement le **Guide de Préparation Intensive au Concours de Recrutement des Ingénieurs d'État du Ministère de l'Économie et des Finances**.

Chaque visuel a une fonction pédagogique précise : ancrage mémoriel, clarification de schémas institutionnels complexes, chronologie tactique d'épreuve, pipelines de données publiques et architecture des systèmes d'information étatiques.

> **Note linguistique :** Tous les prompts Flow sont rédigés intégralement en **français**, garantissant ainsi une parfaite fidélité terminologique à l'administration marocaine, aux textes de lois (LOF 130-13, lois-cadres) et aux acronymes officiels du MEF (DGI, TGR, ADII, GID, RSU, etc.).

---

## Tableau Général de Correspondance (Texte $\rightarrow$ Image)

| ID | Section | Passage associé | Objectif visuel | Nom fichier | Ratio | Type | Statut | Priorité |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **IMG-REPORT-001** | Chapitre 0 (Intro) | Rôle de l'Ingénieur d'État au MEF | Écosystème des SI financiers étatiques (GID, GIR, BADR, SIMPL) | `images/img_001_intro_ecosysteme_si_mef.png` | 16:9 | Architecture Isométrique | À générer | 🔴 |
| **IMG-REPORT-002** | Chapitre 1 (1.3) | Chrono 3h de l'épreuve écrite | Découpage tactique des 180 min (15m/30m/15m/105m/15m) | `images/img_002_methodo_chrono_3h.png` | 16:9 | Frise Chronologique Éditoriale | À générer | 🔴 |
| **IMG-REPORT-003** | Chapitre 1 (1.4) | Structure canonique de la dissertation | Matrice du plan binaire équilibré (I. Diagnostic / II. Stratégie) | `images/img_003_methodo_plan_binaire_structure.png` | 16:9 | Schéma Analytique Modulaire | À générer | 🔴 |
| **IMG-REPORT-004** | Chapitre 2 (2.1) | Maroc Digital 2030 (Sujet 2024) | Piliers et catalyseurs de la stratégie numérique 2030 | `images/img_004_digital_maroc_2030_pillars.png` | 16:9 | Schéma Stratégique Vectoriel | À générer | 🔴 |
| **IMG-REPORT-005** | Chapitre 2 (2.2) | Transition Énergétique (Sujet 2024) | Mix électrique 52% EnR et filière Hydrogène Vert | `images/img_005_energie_mix_hydrogene_maroc.png` | 16:9 | Flux Énergétique Technique | À générer | 🟠 |
| **IMG-REPORT-006** | Chapitre 2 (2.3) | Inflation et Politique Monétaire | Canal du taux directeur BAM et régulation des prix | `images/img_006_macro_inflation_bam_transmission.png` | 16:9 | Schéma Macroéconomique | À générer | 🟠 |
| **IMG-REPORT-007** | Chapitre 2 (2.4) | Dette Publique et Déficit Budgétaire | Trajectoire de consolidation vers 3% du PIB et leviers MEF | `images/img_007_budget_dette_deficit_trajectoire.png` | 16:9 | Tableau de Bord Budgétaire | À générer | 🟠 |
| **IMG-REPORT-008** | Chapitre 2 (2.5) | Protection Sociale & Ciblage RSU | Parcours de ciblage RNP $\rightarrow$ RSU $\rightarrow$ AMO / ASD | `images/img_008_social_rsu_ciblage_pipeline.png` | 16:9 | Pipeline de Données Publiques | À générer | 🔴 |
| **IMG-REPORT-009** | Chapitre 2 (2.6) | Nouvelle Charte de l'Investissement | Inversion du ratio 2/3 privé et régimes de primes | `images/img_009_investissement_charte_ratio.png` | 16:9 | Infographie Comparative | À générer | 🟠 |
| **IMG-REPORT-010** | Chapitre 4 (Fiche 1) | Organisation et Directions du MEF | Cartographie fonctionnelle des pôles opérationnels du MEF | `images/img_010_mef_poles_organigramme.png` | 16:9 | Organigramme Institutionnel | À générer | 🔴 |
| **IMG-REPORT-011** | Chapitre 4 (Fiche 3) | Calendrier Budgétaire LOF 130-13 | Frise des 4 jalons constitutionnels du PLF (20 oct.) | `images/img_011_lof_calendrier_budgetaire.png` | 16:9 | Frise Budgétaire Constitutionnelle | À générer | 🔴 |
| **IMG-REPORT-012** | Chapitre 5 | Planning Commando J-3 | Matrice d'urgence 72h heure par heure avant le 20 septembre | `images/img_012_planning_commando_j3_matrice.png` | 16:9 | Tableau de Bord Tactique | À générer | 🔴 |

---

# Fiches de Production Détaillées (Prompts Flow en Français)

---

## IMG-REPORT-001

**Section :**
Chapitre 0 : Introduction Générale — Rôle de l'Ingénieur d'État au MEF

**Texte associé :**
Paragraphes décrivant pourquoi le MEF recrute des Ingénieurs d'État : gestion des grands SI transactionnels et sensibles du Royaume (SIMPL à la DGI, GID/GIR à la TGR, BADR aux Douanes, modélisation budgétaire à la Direction du Budget, Big Data fiscal).

**Objectif visuel :**
Montrer visuellement que l'ingénieur d'État au MEF n'est pas un exécutant isolé, mais le garant de l'interconnexion sécurisée entre les directions, les bases de données souveraines et les services aux citoyens/entreprises.

**Type :**
Architecture Isométrique / Infographie Technique Moderne

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_001_intro_ecosysteme_si_mef.png`

**Prompt Flow :**
```text
SUJET : Écosystème technologique moderne et vue isométrique de l'infrastructure numérique du Ministère de l'Économie et des Finances (MEF) du Royaume du Maroc.

CONTEXTE : Guide officiel de préparation au concours des Ingénieurs d'État. Focus sur le traitement de transactions à haut volume, la gouvernance financière, l'intégration des données et l'administration publique souveraine.

ENVIRONNEMENT : Fond épuré blanc cassé technique (#FBFAF7), subtile grille de perspective architecturale avec de fines lignes de plan technique blueprint.

ACTION : Flux de données sécurisés circulant entre les plateformes institutionnelles interconnectées : fiscalité, trésor, douanes et budget.

COMPOSITION : Vue isométrique centrée. Au cœur de la scène, un noyau de données souverain lumineux avec typographie sobre. Quatre plateformes majeures rayonnent via des conduits de données illuminés :
1. Fiscalité (DGI - plateforme de télédéclaration SIMPL)
2. Trésorerie Générale du Royaume (TGR - gestion des dépenses publiques GID / recettes GIR)
3. Douanes et Impôts Indirects (ADII - réseau du commerce international BADR)
4. Direction du Budget (DB - modélisation et tableaux de bord de la performance budgétaire).
Des cartes d'interface utilisateur 2.5D flottent autour des nœuds avec graphiques financiers stylisés, connecteurs d'API sécurisées et badges de vérification cryptographique.

CAMÉRA : Vue isométrique plongeante à 30 degrés, perspective orthographique, netteté absolue de bord à bord, marges généreuses et espace négatif équilibré.

ÉCLAIRAGE : Éclairage de studio uniforme et diffus, ombres douces et précises, légers reflets cyan néon (#00B4D8) et touches dorées institutionnelles (#F2B705) le long des conduits de données.

COULEURS & PALETTE : Charte institutionnelle exécutive : Bleu marine souverain (#0F3C6E), ardoise corporate (#2B2D42), cyan technologique (#00B4D8), vert menthe sécurité (#2A9D8F), or subtil (#F2B705), fond blanc cassé épuré (#FBFAF7).

STYLE VISUEL : Illustration technique éditoriale haut de gamme, arêtes géométriques nettes, ombrage plat avec biseaux raffinés, précision vectorielle inspirée des rapports de transformation numérique de la Banque Mondiale et de McKinsey.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Présence sobre et élégante de l'étoile chérifienne du Royaume du Maroc en lignes vectorielles dorées au sommet du nœud central.

RÉALISME & QUALITÉ : Rendu vectoriel ultra-net, résolution 8K, zéro grain, alignement mathématique parfait, lisibilité typographique irréprochable en français.

CONTRAINTES NÉGATIVES : Éviter le câblage anarchique, l'esthétique cyberpunk sombre ou dystopique, les textes flous ou illisibles, le style pâte à modeler 3D, les photos corporate génériques, les néons agressifs et les artefacts basse résolution.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Installe dès le début du guide le positionnement stratégique de l'Ingénieur d'État au MEF, en rupture totale avec l'image réductrice d'un simple gestionnaire administratif.

---

## IMG-REPORT-002

**Section :**
Chapitre 1 : Structure de l'Épreuve Écrite et Méthodologie de Réussite — 1.3 Gestion Optimale du Temps sur 3 Heures

**Texte associé :**
Découpage chronométré des 180 minutes de l'épreuve : 15 min de choix de sujet et définition des termes, 30 min de brainstorming et plan détaillé, 15 min de rédaction intégrale intro/conclusion au brouillon, 1h45 de rédaction directe sur la copie, et 15 min de relecture impérative.

**Objectif visuel :**
Donner au candidat un repère visuel mémorisable instantanément pour ne jamais se faire dépasser par le temps le jour J (la première cause d'élimination au concours).

**Type :**
Frise Chronologique Éditoriale / Carte de Stratégie Chrono

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_002_methodo_chrono_3h.png`

**Prompt Flow :**
```text
SUJET : Feuille de route chronométrique et tactique de gestion du temps pour une épreuve écrite de concours de 3 heures (180 minutes).

CONTEXTE : Préparation au concours de recrutement des Ingénieurs d'État au Ministère de l'Économie et des Finances. Guide visuel méthodologique pour le découpage rigoureux des 180 minutes le jour de l'examen.

ENVIRONNEMENT : Bannière infographique horizontale moderne et aérée sur fond gris ardoise neutre très clair (#F8F9FA).

ACTION : Déroulé chronologique séquentiel d'un compte à rebours de 180 minutes découpé en cinq phases rigoureusement minutées, avec codes couleurs distincts, icônes précises et badges horaires.

COMPOSITION : Frise horizontale équilibrée progressant de gauche (00h00) vers la droite (03h00) :
- Phase 1 (00h00 - 00h15 / 15 min) : Bloc Bleu Marine (#0F3C6E) avec icône boussole/œil : « Choix du Sujet & Définition des Termes Clés ».
- Phase 2 (00h15 - 00h45 / 30 min) : Bloc Cyan (#00B4D8) avec icône arborescence : « Problématique & Plan Détaillé (Parties I et II) ».
- Phase 3 (00h45 - 01h00 / 15 min) : Bloc Or Accent (#F2B705) avec icône plume stylisée : « Rédaction Intégrale Intro & Conclusion au Brouillon ».
- Phase 4 (01h00 - 02h45 / 105 min - 1h45) : Grand bloc central vert menthe (#2A9D8F) avec icône livret d'examen : « Rédaction Directe sur la Copie (Corps du Devoir) ».
- Phase 5 (02h45 - 03h00 / 15 min) : Bloc Corail / Alerte (#E4572E) avec icône loupe/checklist : « Relecture Impérative & Chasse aux Coquilles ».
Au-dessus de chaque bloc, un badge numérique indique la durée exacte en minutes ; en dessous, une règle d'or concise en typographie nette.

CAMÉRA : Vue frontale directe en 2D orthographique, symétrie horizontale rigoureuse, marges blanches aérées.

ÉCLAIRAGE : Éclairage numérique plat à fort contraste, lisibilité maximale des textes sur cartes blanches.

COULEURS & PALETTE : Palette data-design professionnelle : Bleu marine (#0F3C6E), cyan tech (#00B4D8), or (#F2B705), vert menthe (#2A9D8F), corail alerte (#E4572E), cartes blanches (#FFFFFF).

STYLE VISUEL : Infographie moderne inspirée du design suisse, cartes aux coins arrondis (2.5px), icônes monoline épurées, hiérarchie typographique sans-serif parfaite.

IDENTITÉ INSTITUTIONNELLE / BRANDING : En-tête discret : « MEF — Concours Ingénieurs d'État : Stratégie Chrono 180 Min ».

RÉALISME & QUALITÉ : Clarté vectorielle SVG pure, absence totale de pixelation, indications horaires 100% lisibles en français.

CONTRAINTES NÉGATIVES : Éviter les bureaux réalistes désordonnés, papiers froissés, cadrans d'horloge analogique confus, dégradés criards, texte miniature illisible.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
La gestion du temps est le facteur d'élimination numéro un. Avoir ce schéma en tête permet au candidat d'automatiser son timing le 20 septembre.

---

## IMG-REPORT-003

**Section :**
Chapitre 1 : Structure de l'Épreuve Écrite et Méthodologie de Réussite — 1.4 La Règle d'Or du Plan en Deux Parties

**Texte associé :**
Architecture canonique d'une dissertation de concours pour ingénieur d'État : Partie I (Diagnostic, acquis et contraintes structurelles : I.A Réalisations / I.B Limites) reliée par une transition soignée à la Partie II (Stratégies nationales, leviers d'ingénierie et recommandations : II.A Cadre programmatique / II.B Recommandations opérationnelles).

**Objectif visuel :**
Schématiser l'équilibre architectural parfait d'une copie de concours et illustrer le rôle vital des chapeaux et des transitions logiques pour maximiser les points de rigueur académique (25% du barème).

**Type :**
Schéma Analytique Modulaire / Blueprint de Dissertation

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_003_methodo_plan_binaire_structure.png`

**Prompt Flow :**
```text
SUJET : Plan d'architecture analytique schématisant la structure canonique de la dissertation administrative en deux parties équilibrées (Plan Binaire I & II).

CONTEXTE : Épreuve de composition économique et générale pour les concours d'Ingénieurs d'État au MEF. Modèle formel garantissant les points de rigueur structurelle (25% du barème).

ENVIRONNEMENT : Carte blanche moderne (#FFFFFF) bordée d'un fin filet bleu nuit, grille géométrique épurée.

ACTION : Décomposition modulaire et visuelle d'une dissertation d'élite : Introduction, Partie I, Chapeaux et Transitions, Partie II, Conclusion, avec indicateur de balance équilibrée.

COMPOSITION : Architecture symétrique à deux colonnes centrales reliées par un nœud de transition :
1. Bannière Haute : « L'Introduction en 5 Paliers » (Accroche -> Définition -> Contexte Maroc -> Problématique -> Annonce du Plan).
2. Colonne de Gauche (Partie I : Diagnostic, État des Lieux & Contraintes) :
   - Cartouche I.A : « Réalisations, Cadre Institutionnel & Acquis » (Bleu Marine #0F3C6E).
   - Cartouche I.B : « Insuffisances, Contraintes & Défis Structurels » (Corail #E4572E).
3. Nœud Central : Passerelle stylisée étiquetée « Chapeau Synthétique & Phrase de Transition Logique ».
4. Colonne de Droite (Partie II : Orientations Stratégiques & Leviers de l'Ingénieur) :
   - Cartouche II.A : « Politiques Publiques & Feuilles de Route Nationales » (Cyan #00B4D8).
   - Cartouche II.B : « Solutions Opérationnelles, Modernisation & Rôle de l'Ingénieur » (Vert Menthe #2A9D8F).
5. Bannière Basse : « Conclusion Bipartite » (Bilan Réponse à la Problématique + Ouverture Prospective).
Icône d'équilibre parfait « 50% / 50% » au centre.

CAMÉRA : Vue frontale orthogonale, alignement millimétré des blocs, espacements harmonieux.

ÉCLAIRAGE : Éclairage de studio uniforme, micro-ombres douces sous les conteneurs.

COULEURS & PALETTE : Bleu marine souverain (#0F3C6E), ardoise (#334155), cyan (#00B4D8), vert menthe (#2A9D8F), corail (#E4572E), blanc pur (#FFFFFF).

STYLE VISUEL : Schéma d'ingénierie administrative moderne, typographie sans-serif lisible, icônes filaires précises.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre : « Méthodologie MEF — Architecture du Plan Binaire Idéal ».

RÉALISME & QUALITÉ : Rendu vectoriel parfait, netteté typographique absolue en français.

CONTRAINTES NÉGATIVES : Éviter les cartes mentales chaotiques, textes manuscrits brouillons, perspectives déformées, polices gothiques ou avec empattements illisibles.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
La structure du plan représente 25% de la note finale. Ce schéma ancre le réflexe binaire indispensable pour éviter le plan tiroir ou le hors-sujet.

---

## IMG-REPORT-004

**Section :**
Chapitre 2 : Annales Réelles et Décorticage des Sujets — 2.1 Sujet 1 (28 Avril 2024) : Maroc Digital 2030

**Texte associé :**
Analyse du sujet réel de 2024 sur la transition numérique. Présentation des 2 piliers majeurs de la stratégie « Maroc Digital 2030 » (Pilier 1 : Services publics 100% digitalisés ; Pilier 2 : Économie numérique et offshoring) et des 4 catalyseurs (Infrastructures 5G, Cloud souverain, formation de 100 000 talents par an, IA appliquée).

**Objectif visuel :**
Permettre au candidat de visualiser et restituer sans hésitation l'architecture exacte de la stratégie nationale Maroc Digital 2030 lors de la dissertation.

**Type :**
Schéma Stratégique Vectoriel / Matrice Décisionnelle

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_004_digital_maroc_2030_pillars.png`

**Prompt Flow :**
```text
SUJET : Schéma architectural officiel représentant la stratégie nationale « Maroc Digital 2030 ».

CONTEXTE : Dissertation sur la transition numérique au concours du MEF (sujet réel de la session du 28 avril 2024). Cadrage sur les 2 piliers et les 4 catalyseurs gouvernementaux.

ENVIRONNEMENT : Toile technique blanche (#FFFFFF) avec trame de fond grise ultra-légère.

ACTION : Présentation structurelle sous forme de temple moderne : les 4 catalyseurs socles supportent les 2 piliers stratégiques, convergeant vers la souveraineté numérique.

COMPOSITION :
1. Fronton Supérieur (Sommet) : « Souveraineté Numérique & Hub Régional Africain ».
2. Deux Colonnes Majeures (Piliers Stratégiques) :
   - Colonne Gauche (Pilier 1) : « Digitalisation des Services Publics » (Parcours usager 100% digitalisé, Zéro Papier, Interopérabilité des SI).
   - Colonne Droite (Pilier 2) : « Dynamisation de l'Économie Numérique » (Écosystème Startups, Export de solutions IT, 2e pôle d'Offshoring en Afrique).
3. Socle Fondateur (Les 4 Catalyseurs) :
   - Catalyseur 1 : « Déploiement 5G & Connectivité Haut Débit » (Icône antenne télécom).
   - Catalyseur 2 : « Cloud Souverain National & Datacenters Sécurisés » (Icône serveur sécurisé).
   - Catalyseur 3 : « Capital Humain : Formation de 100 000 Talents/An » (Icône chapeau académique & réseau).
   - Catalyseur 4 : « Intelligence Artificielle & Confiance Numérique CNDP » (Icône puce neuronale & cadenas de protection des données).

CAMÉRA : Prise de vue frontale directe, proportions équilibrées, marges aérées.

ÉCLAIRAGE : Éclairage numérique homogène, contrastes nets sans ombres dures.

COULEURS & PALETTE : Bleu royal marocain (#0F3C6E), cyan vif (#00B4D8), or impérial (#D4AF37), gris technique (#CFD8DC).

STYLE VISUEL : Schéma vectoriel épuré, style cabinet de conseil en stratégie (Bain & Company / Roland Berger), icônes géométriques précises.

IDENTITÉ INSTITUTIONNELLE / BRANDING : En-tête : « Royaume du Maroc — Stratégie Nationale Maroc Digital 2030 ».

RÉALISME & QUALITÉ : Précision vectorielle 2D, typographie française ultra-nette, zéro flou.

CONTRAINTES NÉGATIVES : Éviter les poignées de main avec des robots, fonds matrix avec code vert fluorescent, clichés de science-fiction, piliers antiques gréco-romains déformés.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Ce sujet est tombé au concours le 28 avril 2024. Le schéma fournit directement la structure clé en main pour rédiger la Partie II de la dissertation.

---

## IMG-REPORT-005

**Section :**
Chapitre 2 : Annales Réelles et Décorticage des Sujets — 2.2 Sujet 2 (28 Avril 2024) : Transition Énergétique

**Texte associé :**
Enjeux de la sécurité énergétique au Maroc : réduction de la facture d'importation, mix électrique visant plus de 52% d'énergies renouvelables d'ici 2030 (Solaire Noor, Éolien, STEP Abdelmoumen) et déploiement de « l'Offre Maroc » pour l'Hydrogène Vert (1 million d'hectares fonciers).

**Objectif visuel :**
Illustrer le mix énergétique national et la chaîne de valeur intégrée (Soleil + Vent $\rightarrow$ Électricité verte $\rightarrow$ Dessalement \& Électrolyse $\rightarrow$ Hydrogène Vert / Ammoniac vert pour les phosphates OCP).

**Type :**
Flux Énergétique Technique / Chaîne de Valeur Industrielle

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_005_energie_mix_hydrogene_maroc.png`

**Prompt Flow :**
```text
SUJET : Schéma technique de la chaîne de valeur intégrée de la transition énergétique et de l'« Offre Maroc » pour l'Hydrogène Vert.

CONTEXTE : Sujet réel du 28 avril 2024 au MEF. Démonstration des synergies entre énergies renouvelables (solaire, éolien, STEP), dessalement d'eau de mer et production d'hydrogène/ammoniac vert pour l'industrie des phosphates (OCP).

ENVIRONNEMENT : Toile blanche épurée avec courbes de niveau topographiques ultra-fines en filigrane gris clair.

ACTION : Flux de transformation énergétique continu de gauche à droite, de la production verte jusqu'à la décarbonation industrielle et l'exportation.

COMPOSITION : Flux technique horizontal en 4 étapes interconnectées :
- Étape 1 (Mix Électrique Renouvelable >52% à l'horizon 2030) : Icônes vectorielles du Complexe Solaire Noor (miroirs thermodynamiques et PV), parcs éoliens côtiers, et STEP hydraulique d'Abdelmoumen.
- Étape 2 (Réseau Électrique Intelligent & Dessalement) : Nœud de distribution alimentant les stations de dessalement d'eau de mer à l'énergie solaire.
- Étape 3 (Électrolyse & « Offre Maroc » Hydrogène Vert) : Unités industrielles d'électrolyseurs scindant l'eau purifiée en H2 vert et ammoniac vert (NH3).
- Étape 4 (Valorisation Industrielle & Export) : Alimentation des engrais verts OCP, décarbonation des transports lourds, et export vers l'Union Européenne en conformité avec le MACF (Mécanisme d'Ajustement Carbone aux Frontières).
Badges de données : « Objectif >52% Capacité EnR 2030 » et « Foncier Public : 1 Million d'Hectares Mobilisés ».

CAMÉRA : Vue orthogonale d'ingénierie des procédés, lecture séquentielle limpide de gauche à droite.

ÉCLAIRAGE : Lumière du jour claire et naturelle, légers dégradés fluides sur les flèches de circulation.

COULEURS & PALETTE : Palette éco-industrielle : Or solaire (#F39C12), cyan éolien (#2980B9), vert émeraude hydrogène (#27AE60), bleu marine étatique (#0F3C6E).

STYLE VISUEL : Infographie d'ingénierie moderne de haut niveau, tuyaux et flux vectoriels nets, icônes précises et étiquettes techniques en français.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre : « Transition Énergétique & Offre Maroc pour l'Hydrogène Vert ».

RÉALISME & QUALITÉ : Dessin technique clair, netteté mathématique, absence totale d'encombrement visuel.

CONTRAINTES NÉGATIVES : Éviter les fumées, cheminées de charbon, usines polluantes, dessins enfantins, tuyauterie confuse et surchargée.
```

**Priorité :**
🟠 PRIORITÉ 2 — IMPORTANTE

**Justification :**
Permet au candidat d'illustrer concrètement la dimension ingénierie de la transition énergétique, en faisant le lien avec le groupe OCP et le foncier public géré par le MEF.

---

## IMG-REPORT-006

**Section :**
Chapitre 2 : Annales Réelles — 2.3 Sujet 3 (Sessions Réelles 2022-2023) : L'Inflation et la Préservation du Pouvoir d'Achat

**Texte associé :**
Analyse des moteurs de l'inflation au Maroc (inflation importée et choc climatique/agricole), mécanisme de transmission de la politique monétaire par Bank Al-Maghrib (hausse du taux directeur de 1,50% à 3,00% puis détente à 2,75% en juin 2024), et mesures budgétaires du MEF (subventions transport, suspension des droits de douane/TVA sur produits essentiels, soutien Caisse de Compensation).

**Objectif visuel :**
Visualiser l'action coordonnée entre la politique monétaire (BAM) et la politique budgétaire (MEF) pour stabiliser les prix sans étouffer la croissance économique.

**Type :**
Schéma Macroéconomique / Mécanisme de Transmission

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_006_macro_inflation_bam_transmission.png`

**Prompt Flow :**
```text
SUJET : Schéma macroéconomique de coordination des politiques publiques face à l'inflation entre Bank Al-Maghrib et le Ministère de l'Économie et des Finances.

CONTEXTE : Annales réelles 2022-2023 du MEF. Analyse du canal de transmission du taux directeur de Bank Al-Maghrib et des mesures budgétaires de protection du pouvoir d'achat.

ENVIRONNEMENT : Carte analytique blanche (#FFFFFF) avec encadrement institutionnel rigoureux.

ACTION : Cartographie visuelle d'un choc inflationniste déclenchant une double riposte coordonnée (monétaire + budgétaire) pour rétablir la stabilité des prix.

COMPOSITION : Trajectoire en 3 volets de gauche à droite :
1. Volet Gauche (Le Double Choc) : Cartes d'alerte rouge décrivant l'« Inflation Importée (Énergie & Fret) » et le « Choc Agricole (Sécheresse & Flambée des Produits Alimentaires : pic à +15%) ».
2. Volet Central (La Riposte Institutionnelle Coordonnée) :
   - Canal Supérieur : « Bank Al-Maghrib (Politique Monétaire) » -> Graphique d'ajustement du taux directeur (1,50% -> 3,00% -> détente à 2,75%) pour ancrer les anticipations et freiner le crédit spéculatif.
   - Canal Inférieur : « MEF (Politique Budgétaire) » -> Subventions directes aux transporteurs routiers, exonérations douanières et de TVA sur le bétail et l'huile, dotations à la Caisse de Compensation.
3. Volet Droit (Stabilisation Finale) : Jauge de performance verte montrant l'inflation contenue dans la zone cible (1,5% - 2,0% en 2024).

CAMÉRA : Vue infographique frontale à plat, flèches de transmission fluides, lisibilité immédiate.

ÉCLAIRAGE : Éclairage numérique homogène mettant en valeur les contrastes entre signaux d'alerte et leviers d'action.

COULEURS & PALETTE : Rouge bordeaux d'alerte (#C0392B), or monétaire (#D4AF37), bleu souverain MEF (#0F3C6E), vert émeraude de stabilité (#27AE60), fond blanc et gris doux (#F8F9FA).

STYLE VISUEL : Infographie de presse économique de référence (type Financial Times / Les Échos), typographie soignée, pictogrammes minimaux.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre : « Macroéconomie Marocaine — Mécanismes de Lutte Contre l'Inflation (BAM & MEF) ».

RÉALISME & QUALITÉ : Précision vectorielle absolue, graphiques nets, terminologie économique française exacte.

CONTRAINTES NÉGATIVES : Éviter les billets de banque en feu, visages de panique, chariots de supermarché déformés, formules d'économétrie illisibles.
```

**Priorité :**
🟠 PRIORITÉ 2 — IMPORTANTE

**Justification :**
L'articulation entre le taux directeur de BAM et les subventions du MEF est la réponse clé attendue dans toute copie touchant à la macroéconomie et au pouvoir d'achat.

---

## IMG-REPORT-007

**Section :**
Chapitre 2 : Annales Réelles — 2.4 Sujet 4 (Session Réelle 2021-2022) : Maîtrise du Déficit Budgétaire et Dette Publique

**Texte associé :**
Trajectoire de consolidation budgétaire du Maroc : réduction du déficit de plus de 7% (crise 2020) à 4,3% en 2023, avec cible 4% en 2024 et 3,5% à terme ; niveau de la dette du Trésor stabilisé autour de 69,5%-70% du PIB (75% intérieure) ; et leviers de redressement (élargissement de l'assiette fiscale, optimisation de la dépense, financements innovants et Règle d'or de l'Art. 20 LOF 130-13).

**Objectif visuel :**
Présenter la trajectoire de soutenabilité des finances publiques marocaines et synthétiser les 4 leviers d'action budgétaire du MEF pour allier assainissement des comptes et financement des investissements.

**Type :**
Tableau de Bord Budgétaire / Matrice de Consolidation Fiscale

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_007_budget_dette_deficit_trajectoire.png`

**Prompt Flow :**
```text
SUJET : Tableau de bord institutionnel illustrant la trajectoire de consolidation du déficit budgétaire et la gestion de la dette publique du Trésor marocain.

CONTEXTE : Épreuve de finances publiques au concours du MEF (sujet réel 2021-2022). Maîtrise des cibles budgétaires et de la règle d'or de la LOF 130-13.

ENVIRONNEMENT : Canevas financier exécutif moderne sur fond blanc (#FFFFFF) avec séparateurs bleu ardoise.

ACTION : Visualisation conjointe de la courbe descendante du déficit et des 4 grands leviers d'action budgétaire déployés par le MEF.

COMPOSITION : Tableau de bord structuré en deux zones équilibrées :
1. Zone Gauche (Trajectoire du Déficit & Profil de la Dette) :
   - Graphique en escalier descendant du Déficit Budgétaire (% du PIB) : 7,1% (crise Covid 2020) -> 4,3% (2023) -> 4,0% (PLF 2024) -> Cible 3,5% (2026).
   - Cadran circulaire indiquant le ratio de la Dette du Trésor : « ~69,5% du PIB », avec un badge clé mettant en avant : « 75% Dette Intérieure (Faible exposition au risque de change) ».
2. Zone Droite (Les 4 Leviers Budgétaires du MEF) :
   - Levier 1 : « Élargissement de l'Assiette Fiscale » (Intégration du secteur informel, Loi-cadre 69-19).
   - Levier 2 : « Rationalisation de la Dépense » (Budgétisation axée sur la performance selon la LOF 130-13).
   - Levier 3 : « Financements Innovants » (Monétisation d'actifs publics par les Domaines de l'État & PPP Loi 86-12).
   - Levier 4 : « Règle d'Or (Art. 20 LOF 130-13) » (Affectation exclusive de la dette au financement des investissements et non au fonctionnement).

CAMÉRA : Vue frontale directe de type tableau de bord de direction générale, marges équilibrées.

ÉCLAIRAGE : Éclairage numérique à haute définition, excellente lisibilité des valeurs chiffrées.

COULEURS & PALETTE : Bleu marine souverain (#0F3C6E), cyan fiscal (#00B4D8), vert de consolidation (#2A9D8F), or institutionnel (#F39C12), blanc pur (#FFFFFF).

STYLE VISUEL : Infographie financière internationale de haut vol (style FMI / Banque Mondiale), chiffres clés en gras, typographie d'une précision chirurgicale.

IDENTITÉ INSTITUTIONNELLE / BRANDING : En-tête : « Finances Publiques du Maroc — Trajectoire Budgétaire & Soutenabilité de la Dette ».

RÉALISME & QUALITÉ : Perfection graphique 2D, lisibilité totale des données chiffrées en français.

CONTRAINTES NÉGATIVES : Éviter les flèches de krach boursier rouge criard, tirelires cassées, effets 3D brillants désuets, surcharges graphiques.
```

**Priorité :**
🟠 PRIORITÉ 2 — IMPORTANTE

**Justification :**
La maîtrise de la dette et la règle d'or de l'Art. 20 de la LOF sont des points cardinaux systématiquement testés pour vérifier la culture financière du candidat ingénieur.

---

## IMG-REPORT-008

**Section :**
Chapitre 2 : Annales Réelles — 2.5 Sujet Phare : Généralisation de la Protection Sociale

**Texte associé :**
Fonctionnement du ciblage social au Maroc : enregistrement biométrique via le Registre National de la Population (RNP), calcul du score de vulnérabilité par le Registre Social Unifié (RSU), et ouverture des droits à l'Assurance Maladie Obligatoire (AMO Tadamon) et aux versements de l'Aide Sociale Directe (ASD).

**Objectif visuel :**
Démystifier le pipeline technologique du RSU, en montrant comment l'ingénierie des données et les algorithmes de scoring transforment les politiques de redistribution de l'État.

**Type :**
Pipeline de Données Publiques / Architecture Décisionnelle

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_008_social_rsu_ciblage_pipeline.png`

**Prompt Flow :**
```text
SUJET : Schéma architectural du pipeline de ciblage social au Maroc, de l'immatriculation biométrique jusqu'aux versements de l'Aide Sociale Directe.

CONTEXTE : Chantier Royal de généralisation de la protection sociale (Loi-cadre 09-21). Démonstration de l'architecture technologique combinant le Registre National de la Population (RNP) et le Registre Social Unifié (RSU).

ENVIRONNEMENT : Espace de présentation blanc exécutif (#FFFFFF), net et rassurant.

ACTION : Déroulement séquentiel en 4 étapes de traitement de données, illustrant l'objectivation des critères d'aide publique par le numérique.

COMPOSITION : Pipeline horizontal linéaire en 4 étapes reliées par des flèches lumineuses :
- Étape 1 — Identification du Citoyen (RNP) : Enregistrement biométrique (iris, visage) générant l'Identifiant Digital Civil et Social unique (IDCS).
- Étape 2 — Profilage Socio-Économique du Foyer (RSU) : Base de données fédérée intégrant les caractéristiques du ménage (dépenses d'eau/électricité, patrimoine, localisation).
- Étape 3 — Moteur Algorithmique de Scoring : Formule prédictive et objective calculant le score de précarité du ménage par rapport au seuil d'éligibilité légal.
- Étape 4 — Octroi Ciblé des Prestations Sociales :
  * Branche A : AMO Tadamon (Couverture médicale universelle prise en charge par l'État).
  * Branche B : Aide Sociale Directe (ASD — Allocations familiales mensuelles versées directement sur comptes bancaires ou paiements mobiles).
Chaque étape comporte un badge distinct, un intitulé explicite et un indicateur de validation vert.

CAMÉRA : Vue de face orthogonale, lecture naturelle de gauche à droite, grande clarté didactique.

ÉCLAIRAGE : Éclairage clair et positif, cartes légèrement contrastées avec ombres subtiles.

COULEURS & PALETTE : Bleu souverain (#0F3C6E), cyan numérique (#00B4D8), vert santé Tadamon (#2A9D8F), ambre social (#E67E22), gris clair (#F1F3F5).

STYLE VISUEL : Infographie de rapport institutionnel international (style OCDE / Banque Mondiale), lignes géométriques précises, pictogrammes universels et élégants.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre : « Chantier Royal de la Protection Sociale — Architecture de Ciblage RNP / RSU ».

RÉALISME & QUALITÉ : Finesse vectorielle 2D irréprochable, alignement millimétré, typographie française parfaite.

CONTRAINTES NÉGATIVES : Éviter les portraits misérabilistes ou stigmatisants, schémas de bases de données avec fragments de code SQL désordonnés, ambiance sombre ou froide.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
La protection sociale et le RSU représentent la réforme sociétale la plus emblématique du gouvernement actuel. Le jury teste systématiquement la maîtrise de ce mécanisme.

---

## IMG-REPORT-009

**Section :**
Chapitre 2 : Annales Réelles — 2.6 Sujet Phare : La Nouvelle Charte de l'Investissement

**Texte associé :**
Loi-cadre n° 03-22 : Objectif d'inversion du ratio de l'investissement global à l'horizon 2035 (passer de 1/3 privé et 2/3 public à 2/3 privé et 1/3 public) et architecture des 3 primes d'investissement (prime principale territoriale/emploi/genre, prime sectorielle, et prime pour les projets stratégiques).

**Objectif visuel :**
Montrer de façon percutante la bascule de l'investissement public vers le secteur privé et la grille d'incitations financières gérée conjointement avec le MEF.

**Type :**
Infographie Comparative / Visualisation de Politique Économique

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_009_investissement_charte_ratio.png`

**Prompt Flow :**
```text
SUJET : Infographie comparative illustrant le basculement historique du ratio de l'investissement au Maroc à l'horizon 2035 et l'architecture de la Nouvelle Charte de l'Investissement.

CONTEXTE : Loi-cadre 03-22 relative à la Charte de l'Investissement. Objectif national de relance de l'investissement privé domestique et étranger.

ENVIRONNEMENT : Carte exécutive blanche (#FFFFFF) avec bordure sobre gris ardoise.

ACTION : Comparaison visuelle entre la situation actuelle et la cible 2035, complétée par la grille des primes de soutien financier à l'investissement.

COMPOSITION : Composition étagée en deux niveaux :
- Niveau Supérieur (L'Inversion du Ratio) :
  * À gauche, graphique circulaire « Situation Actuelle » : 67% d'Investissement Public (Bleu Marine #0F3C6E) contre 33% d'Investissement Privé (Cyan #00B4D8).
  * Au centre, flèche de transition dynamique étiquetée « Trajectoire Vision 2035 ».
  * À droite, graphique circulaire « Cible Charte 2035 » : 33% d'Investissement Public (Bleu Marine #0F3C6E) contre 67% d'Investissement Privé (Or #F2B705 / Vert #2A9D8F).
- Niveau Inférieur (Le Dispositif de Soutien — Les 3 Primes d'Investissement) :
  * Cartouche 1 : « Prime Commune » (Création d'emplois pérennes, mixité de genre, métiers d'avenir, intégration locale).
  * Cartouche 2 : « Prime Territoriale » (Réduction des disparités provinciales et développement des régions moins favorisées).
  * Cartouche 3 : « Prime Sectorielle » (Secteurs d'activité stratégiques et à haute valeur ajoutée).

CAMÉRA : Présentation graphique frontale et symétrique, pourcentages chiffrés en grand format, proportions mathématiquement exactes.

ÉCLAIRAGE : Éclairage de studio net, lisibilité immédiate des contrastes.

COULEURS & PALETTE : Bleu marine souverain (#0F3C6E), or investissement (#F2B705), cyan secteur privé (#00B4D8), vert croissance (#2A9D8F), blanc pur (#FFFFFF).

STYLE VISUEL : Graphisme de cabinet de conseil économique stratégique (style McKinsey Global Institute / BCG), géométrie rigoureuse, pourcentages clairs.

IDENTITÉ INSTITUTIONNELLE / BRANDING : En-tête : « Nouvelle Charte de l'Investissement (Loi-cadre 03-22) — Inversion du Ratio Public / Privé ».

RÉALISME & QUALITÉ : Précision vectorielle, étiquettes 100% lisibles en français, camemberts parfaitement dosés.

CONTRAINTES NÉGATIVES : Éviter les camemberts 3D biseautés illisibles, effets de verre brillants, cours boursiers désordonnés, surcharge textuelle.
```

**Priorité :**
🟠 PRIORITÉ 2 — IMPORTANTE

**Justification :**
Ce ratio (2/3 privé - 1/3 public) est la donnée chiffrée numéro un à sortir dans toute dissertation portant sur l'économie, le budget ou l'attractivité du Maroc.

---

## IMG-REPORT-010

**Section :**
Chapitre 4 : Fiches Mémotechniques « Haute Rentabilité » — Fiche 1 : Organisation et Directions du MEF

**Texte associé :**
Organigramme et missions des directions du MEF : Pôle Recettes \& Douanes (DGI, ADII), Pôle Dépenses \& Comptabilité (TGR, Direction du Budget), Pôle Financement \& Trésor (DTFE, DDE), et Pôle Participations Publiques \& Contrôle (DEPP, ANGSPE, IGF, DEPF).

**Objectif visuel :**
Offrir une vue synoptique claire des directions du ministère pour réussir sans hésiter les QCM d'organisation administrative et l'entretien oral.

**Type :**
Organigramme Institutionnel / Carte Topologique des Pôles

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_010_mef_poles_organigramme.png`

**Prompt Flow :**
```text
SUJET : Cartographie fonctionnelle et organigramme synoptique des pôles opérationnels du Ministère de l'Économie et des Finances du Royaume du Maroc.

CONTEXTE : Préparation aux questions d'organisation administrative du MEF (QCM écrit et grand oral). Taxonomie claire des directions clés et de leurs compétences.

ENVIRONNEMENT : Fond blanc épuré structuré par des conteneurs modulaires arrondis.

ACTION : Regroupement méthodique des directions du ministère en quatre grands pôles opérationnels sous la tutelle du Ministre et du Secrétariat Général.

COMPOSITION : Arborescence institutionnelle hiérarchique :
- Sommet : Cartouche Exécutif « Ministre de l'Économie et des Finances », articulé avec l'« Inspection Générale des Finances (IGF) » et le « Secrétariat Général ».
- Base divisée en 4 colonnes opérationnelles aux liserés colorés distincts :
  1. Pôle Fiscalité & Douanes :
     * Direction Générale des Impôts (DGI — collecte de l'impôt, numérisation fiscale SIMPL).
     * Administration des Douanes et Impôts Indirects (ADII — contrôle douanier, plateforme BADR).
  2. Pôle Trésor & Dépenses Publiques :
     * Trésorerie Générale du Royaume (TGR — comptabilité publique, système GID/GIR).
     * Direction du Budget (DB — préparation et suivi de la Loi de Finances).
  3. Pôle Financement & Études Économiques :
     * Direction du Trésor et des Finances Extérieures (DTFE — levées de fonds, dette publique).
     * Direction des Études et des Prévisions Financières (DEPF — modélisation et prospective).
  4. Pôle Entreprises Publiques & Domaine de l'État :
     * Direction des Domaines de l'État (DDE — gestion et valorisation du patrimoine foncier).
     * Direction des Entreprises Publiques et de la Privatisation (DEPP) & Agence ANGSPE.
Chaque direction possède son acronyme officiel, une icône dédiée et une ligne de mission clé en français.

CAMÉRA : Vue frontale en arbre hiérarchique, lignes de connexion nettes aux coudes arrondis, espacements harmonieux.

ÉCLAIRAGE : Éclairage diffus homogène, contrastes nets.

COULEURS & PALETTE : Identité étatique marocaine : Bleu marine (#0F3C6E), ardoise (#37474F), or discret (#D4AF37), bordures de cartes colorées.

STYLE VISUEL : Schéma d'organigramme administratif de prestige, cartes aux coins arrondis (2.5px), hiérarchie typographique fluide et sobre.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre officiel : « Ministère de l'Économie et des Finances — Cartographie des Pôles et Directions Clés ».

RÉALISME & QUALITÉ : Clarté vectorielle pure, alignement typographique parfait, zéro bruit visuel.

CONTRAINTES NÉGATIVES : Éviter les toiles d'araignées bureaucratiques enchevêtrées, textes minuscules, portraits photographiques de responsables politiques, personnages de bande dessinée.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Connaître l'organisation interne du MEF est une condition sine qua non pour l'écrit et pour l'épreuve orale devant le jury.

---

## IMG-REPORT-011

**Section :**
Chapitre 4 : Fiches Mémotechniques « Haute Rentabilité » — Fiche 3 : La Loi Organique de Finances (LOF 130-13)

**Texte associé :**
Le calendrier budgétaire constitutionnel de confection du Projet de Loi de Finances (PLF) : circulaire du Chef du Gouvernement avant le 15 mars, exposé conjoint d'exécution avant le 15 juillet, dépôt impératif au Parlement au plus tard le 20 octobre, et examen/vote en 60 jours avant publication au Bulletin Officiel le 31 décembre.

**Objectif visuel :**
Fixer visuellement dans la mémoire du candidat la chronologie absolue et les dates constitutionnelles obligatoires de la loi de finances (questions QCM récurrentes).

**Type :**
Frise Budgétaire Constitutionnelle / Roue du Cycle Budgétaire

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_011_lof_calendrier_budgetaire.png`

**Prompt Flow :**
```text
SUJET : Frise chronologique et calendrier constitutionnel de préparation et d'adoption de la Loi de Finances annuelle selon la LOF 130-13.

CONTEXTE : Examen de droit budgétaire et de finances publiques du MEF. Maîtrise infaillible des 4 grandes dates constitutionnelles et des délais parlementaires.

ENVIRONNEMENT : Carte de gestion exécutive sur fond blanc avec jalons temporels mensuels bien distincts.

ACTION : Parcours chronologique marquant les étapes obligatoires de la fabrication du Projet de Loi de Finances (PLF).

COMPOSITION : Frise dynamique linéaire mettant en relief les quatre dates constitutionnelles incontournables :
- Jalon 1 (Avant le 15 Mars) : Circulaire du Chef du Gouvernement fixant les priorités budgétaires aux ministères (Icône circulaire officielle).
- Jalon 2 (Avant le 15 Juillet) : Exposé conjoint du Ministre de l'Économie et des Finances devant les commissions des finances du Parlement sur l'exécution du budget et la programmation triennale (Icône tribune parlementaire).
- Jalon 3 (🔴 Au plus tard le 20 Octobre — DATE CLÉ ABSOLUE) : Dépôt constitutionnel obligatoire du Projet de Loi de Finances (PLF) sur le Bureau de la Chambre des Représentants (Icône dépôt du texte de loi avec sceau officiel).
- Jalon 4 (Octobre - Décembre / 60 Jours d'Examen) : Navette parlementaire (30 jours Chambre des Représentants, 22 jours Chambre des Conseillers, 6 jours lecture finale) aboutissant à la promulgation au Bulletin Officiel avant le 31 décembre (Icône sceau royal et date du 31 décembre).
Chaque jalon est encadré dans un cartouche avec la date exacte en typographie grasse et imposante.

CAMÉRA : Vue frontale directe, lecture chronologique fluide de gauche à droite, espacement équilibré.

ÉCLAIRAGE : Éclairage net à fort contraste, mise en exergue par la couleur du jalon critique du 20 octobre.

COULEURS & PALETTE : Bleu marine souverain (#0F3C6E), pourpre constitutionnel (#C0392B pour l'échéance du 20 octobre), or légal (#D4AF37), vert validation (#16A085).

STYLE VISUEL : Infographie de haute gouvernance étatique, repères temporels ronds, pictogrammes filaires épurés, hiérarchie typographique exemplaire.

IDENTITÉ INSTITUTIONNELLE / BRANDING : En-tête : « LOF 130-13 — Le Calendrier Budgétaire Constitutionnel de la Loi de Finances ».

RÉALISME & QUALITÉ : Finesse vectorielle, dates 100% lisibles en français, géométrie rigoureuse.

CONTRAINTES NÉGATIVES : Éviter les lignes en zigzag confuses, polices de caractères fantaisistes, cliparts de calendriers de bureau désuets, enjolivures baroques.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
La date du « 20 octobre » et le calendrier de la LOF 130-13 sont des questions pièges systématiques des QCM du MEF. Ce visuel ancre définitivement ces 4 jalons.

---

## IMG-REPORT-012

**Section :**
Chapitre 5 : Planning d'Urgence Commando — J-3 jusqu'au 20 Septembre

**Texte associé :**
Programme commando 72h heure par heure précédant l'épreuve écrite du 20 septembre : Jour 1 (Méthodologie, structure d'intro et LOF 130-13), Jour 2 (Directions du MEF, simulation rédactionnelle 2h30 en conditions réelles et QCM prioritaires 🔴), Jour 3 (Protection sociale, Charte de l'investissement, chiffres clés et coupure impérative à 21h00).

**Objectif visuel :**
Offrir au candidat un tableau de bord tactique synthétique et motivant, garantissant une discipline d'exécution sans dispersion jusqu'à la veille du concours.

**Type :**
Tableau de Bord Tactique / Matrice de Sprint Commando

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_012_planning_commando_j3_matrice.png`

**Prompt Flow :**
```text
SUJET : Tableau de bord matriciel de révision commando pour le sprint final des 72 heures précédant le concours d'Ingénieurs d'État du MEF.

CONTEXTE : Guide de préparation intensive pour le concours du 20 septembre au Ministère de l'Économie et des Finances. Organisation rigoureuse heure par heure.

ENVIRONNEMENT : Interface de pilotage moderne et claire sur fond blanc pur (#FFFFFF) avec bordures ardoise élégantes.

ACTION : Structuration visuelle des 3 derniers jours de révision en blocs d'apprentissage opérationnels à haute rentabilité, avec codes couleurs distincts.

COMPOSITION : Trois colonnes verticales correspondant aux 3 jours clés, surmontées de badges de date et d'objectifs :
- Colonne 1 (Jour 1 - 17 Septembre : « Fondations & Règles d'Or ») :
  * Bloc A (14h-18h) : Méthodologie & Décorticage des Annales Réelles (Maroc Digital 2030 / Énergie).
  * Bloc B (19h-23h) : Finances Publiques & LOF 130-13 (Les 4 principes modernes, Calendrier, Règle d'or Art. 20).
- Colonne 2 (Jour 2 - 18 Septembre : « Intensité & Simulation Réelle ») :
  * Bloc C (08h30-12h30) : Organisation du MEF & SI Étatiques (DGI, TGR, Douanes, GID, SIMPL).
  * Bloc D (14h-18h) : Épreuve Blanche Rédactionnelle en 2h30 Chrono (Sujet au choix : Digitalisation ou Inflation).
  * Bloc E (19h-22h30) : Forage de la Banque de Questions QCM (Focus Priorité Rouge 🔴).
- Colonne 3 (Jour 3 - 19 Septembre : « Chiffres Clés & Sérénité ») :
  * Bloc F (09h-12h30) : Chantiers Stratégiques (Protection Sociale RSU, Charte de l'Investissement).
  * Bloc G (14h30-17h30) : Fiches Mémotechniques des Chiffres Clés & Vocabulaire d'Impact.
  * Bloc H (18h30-21h00) : Vérification Logistique & Coupure Totale des Révisions à 21h00 pour Sommeil Réparateur.
Au pied du tableau, bannière de réussite : « Objectif Jour J (20 Septembre) : Maîtrise, Sérénité & Réussite ».

CAMÉRA : Vue frontale orthogonale de type tableau de bord de productivité, parfait alignement des colonnes et des blocs.

ÉCLAIRAGE : Éclairage numérique homogène, contrastes reposants pour les yeux.

COULEURS & PALETTE : Bleu nuit profond (#0F3C6E), cyan concentration (#00B4D8), orange simulation (#E67E22), vert sérénité (#2A9D8F), conteneurs blancs (#FFFFFF).

STYLE VISUEL : Tableau de bord moderne, pictogrammes de statut épurés, étiquettes horaires nettes, typographie suisse rigoureuse.

IDENTITÉ INSTITUTIONNELLE / BRANDING : Titre : « Concours MEF Ingénieurs d'État — Matrice de Révision Commando J-3 ».

RÉALISME & QUALITÉ : Graphisme vectoriel de précision, horaires et intitulés 100% lisibles en français.

CONTRAINTES NÉGATIVES : Éviter les visuels anxiogènes ou chaotiques, post-its désordonnés, textes gribouillés, ambiances sombres, typographies déformées.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Ce planning est le fil conducteur opérationnel du candidat pour les dernières 72 heures avant le 20 septembre, évitant le piège de la panique et de la dispersion.
