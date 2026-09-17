# Plan Visuel & Fiches de Production — Rapport Concours MEF (Ingénieurs d'État 1er Grade)

Ce plan visuel définit l'ensemble des spécifications et des prompts professionnels destinés à enrichir visuellement le **Guide de Préparation Intensive au Concours de Recrutement des Ingénieurs d'État du Ministère de l'Économie et des Finances**.

Chaque visuel a une fonction pédagogique précise : ancrage mémoriel, clarification de schémas institutionnels complexes, chronologie tactique d'épreuve, pipelines de données publiques et architecture des systèmes d'information étatiques.

---

## Tableau Général de Correspondance (Texte $\rightarrow$ Image)

| ID | Section | Passage associé | Objectif visuel | Nom fichier | Ratio | Type | Statut | Priorité |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **IMG-REPORT-001** | Chapitre 0 (Intro) | Rôle de l'Ingénieur d'État au MEF | Écosystème des SI financiers étatiques (GID, GIR, BADR, SIMPL) | `images/img_001_intro_ecosysteme_si_mef.png` | 16:9 | Isometric Architecture | À générer | 🔴 |
| **IMG-REPORT-002** | Chapitre 1 (1.3) | Chrono 3h de l'épreuve écrite | Découpage tactique des 180 min (15m/30m/15m/105m/15m) | `images/img_002_methodo_chrono_3h.png` | 16:9 | Editorial Timeline Infographic | À générer | 🔴 |
| **IMG-REPORT-003** | Chapitre 1 (1.4) | Structure canonique de la dissertation | Matrice du plan binaire équilibré (I. Diagnostic / II. Stratégie) | `images/img_003_methodo_plan_binaire_structure.png` | 16:9 | Modular Analytical Card | À générer | 🔴 |
| **IMG-REPORT-004** | Chapitre 2 (2.1) | Maroc Digital 2030 (Sujet 2024) | Piliers et catalyseurs de la stratégie numérique 2030 | `images/img_004_digital_maroc_2030_pillars.png` | 16:9 | Pedagogical Flat Diagram | À générer | 🔴 |
| **IMG-REPORT-005** | Chapitre 2 (2.2) | Transition Énergétique (Sujet 2024) | Mix électrique 52% EnR et filière Hydrogène Vert | `images/img_005_energie_mix_hydrogene_maroc.png` | 16:9 | Technical Energy Flow | À générer | 🟠 |
| **IMG-REPORT-006** | Chapitre 2 (2.3) | Inflation et Politique Monétaire | Canal du taux directeur BAM et mécanismes de régulation des prix | `images/img_006_macro_inflation_bam_transmission.png` | 16:9 | Macroeconomic Flow Diagram | À générer | 🟠 |
| **IMG-REPORT-007** | Chapitre 2 (2.4) | Dette Publique et Déficit Budgétaire | Trajectoire de consolidation vers 3% du PIB et leviers MEF | `images/img_007_budget_dette_deficit_trajectoire.png` | 16:9 | Financial Dashboard Infographic | À générer | 🟠 |
| **IMG-REPORT-008** | Chapitre 2 (2.5) | Protection Sociale & Ciblage RSU | Parcours de ciblage RNP $\rightarrow$ RSU $\rightarrow$ AMO / ASD | `images/img_008_social_rsu_ciblage_pipeline.png` | 16:9 | Data Journey Architecture | À générer | 🔴 |
| **IMG-REPORT-009** | Chapitre 2 (2.6) | Nouvelle Charte de l'Investissement | Inversion du ratio 2/3 privé et régimes de primes | `images/img_009_investissement_charte_ratio.png` | 16:9 | Comparative Infographic | À générer | 🟠 |
| **IMG-REPORT-010** | Chapitre 4 (Fiche 1) | Organisation et Directions du MEF | Cartographie fonctionnelle des pôles opérationnels du MEF | `images/img_010_mef_poles_organigramme.png` | 16:9 | Ecosystem Topology Map | À générer | 🔴 |
| **IMG-REPORT-011** | Chapitre 4 (Fiche 3) | Calendrier Budgétaire LOF 130-13 | Frise des 4 jalons constitutionnels du PLF (20 oct.) | `images/img_011_lof_calendrier_budgetaire.png` | 16:9 | Milestone Roadmap Infographic | À générer | 🔴 |
| **IMG-REPORT-012** | Chapitre 5 | Planning Commando J-3 | Matrice d'urgence 72h heure par heure avant le 20 septembre | `images/img_012_planning_commando_j3_matrice.png` | 16:9 | Tactical Schedule Dashboard | À générer | 🔴 |

---

# Fiches de Production Détaillées (Format Flow Standardisé)

---

## IMG-REPORT-001

**Section :**
Chapitre 0 : Introduction Générale — Rôle de l'Ingénieur d'État au MEF

**Texte associé :**
Paragraphes décrivant pourquoi le MEF recrute des Ingénieurs d'État : gestion des grands SI transactionnels et sensibles du Royaume (SIMPL à la DGI, GID/GIR à la TGR, BADR aux Douanes, modélisation budgétaire à la Direction du Budget, Big Data fiscal).

**Objectif visuel :**
Montrer visuellement que l'ingénieur d'État au MEF n'est pas un exécutant isolé, mais le garant de l'interconnexion sécurisée entre les directions, les bases de données souveraines et les services aux citoyens/entreprises.

**Type :**
Isometric Enterprise Architecture / Modern Technical Infographic

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_001_intro_ecosysteme_si_mef.png`

**Prompt Flow :**
```text
SUBJECT: Isometric modern technological ecosystem representing the Moroccan Ministry of Economy and Finance (MEF) digital infrastructure.

CONTEXT: Official engineering recruitment guide for State Engineers in Morocco. Focus on high-volume transaction processing, financial governance, data integration, and sovereign public administration.

ENVIRONMENT: Ultra-clean technical digital canvas on a crisp, pure off-white (#FBFAF7) background, subtle architectural perspective grid with faint blueprint lines.

ACTION: Data flows circulating between interconnected institutional nodes representing tax, treasury, customs, and budget management.

COMPOSITION: Centered isometric composition. In the center, a luminous sovereign data core container labeled with clean typography. Radiating outward via illuminated data pipelines are four primary functional platforms:
1. Tax Administration (DGI - SIMPL e-tax filing)
2. National Treasury (TGR - GID expenditure management)
3. Customs & Indirect Taxes (ADII - BADR international trade network)
4. State Budget Directorate (DB - performance analytics)
Clean 2.5D rounded UI cards float alongside each node showing stylized financial performance graphs, secure API connectors, and security verification badges.

CAMERA: Isometric 30-degree high-angle view, orthographic perspective, crisp focus from edge to edge, ample breathing room and balanced negative space on all sides.

LIGHTING: Clean studio ambient lighting, sharp soft shadows, selective soft neon rim lighting in cyan (#00B4D8) and subtle institutional gold (#F2B705) on the data conduits.

COLOR LANGUAGE: Strict executive institutional palette: Deep sovereign navy (#0F3C6E), corporate slate (#2B2D42), electric tech cyan (#00B4D8), secure mint green (#2A9D8F), subtle gold accent (#F2B705), clean off-white canvas (#FBFAF7).

VISUAL STYLE: High-end editorial technical illustration with crisp geometric edges, flat shading with refined bevels, vector-precision linework, inspired by McKinsey and World Bank digital transformation executive reports.

BRANDING: Subtle, elegant presence of the official Moroccan Kingdom star emblem in clean geometric vector lines at the central apex node.

REALISM / QUALITY: Ultra-sharp vector rendering quality, crisp 8k output, zero noise, mathematically aligned angles, pristine typographic readability.

NEGATIVE CONSTRAINTS: Avoid messy wiring, dark dystopian cyberpunk aesthetics, unreadable text gibberish, 3D clay render look, generic smiling corporate stock photography, neon clutter, low resolution artifacts.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Installe immédiatement dès le début du guide le positionnement stratégique de l'Ingénieur d'État au MEF, en rupture totale avec l'image réductrice d'un simple gestionnaire administratif.

---

## IMG-REPORT-002

**Section :**
Chapitre 1 : Structure de l'Épreuve Écrite et Méthodologie de Réussite — 1.3 Gestion Optimale du Temps sur 3 Heures

**Texte associé :**
Découpage chronométré des 180 minutes de l'épreuve : 15 min de choix de sujet et définition des termes, 30 min de brainstorming et plan détaillé, 15 min de rédaction intégrale de l'intro/conclusion au brouillon, 1h45 de rédaction directe sur la copie, et 15 min de relecture impérative.

**Objectif visuel :**
Donner au candidat un repère visuel mémorisable instantanément pour ne jamais se faire dépasser par le temps le jour J (la première cause d'échec au concours).

**Type :**
Editorial Timeline Infographic / Chrono Strategy Card

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_002_methodo_chrono_3h.png`

**Prompt Flow :**
```text
SUBJECT: A precision tactical time-management roadmap representing a 3-hour (180-minute) competitive written examination strategy.

CONTEXT: Moroccan Ministry of Economy and Finance State Engineer recruitment exam preparation. A high-yield pedagogical visual guide for exam day time allocation.

ENVIRONMENT: Clean, structured horizontal infographic banner on a light modern neutral slate background (#F8F9FA).

ACTION: Chronological breakdown of a 180-minute countdown timeline divided into five clearly bounded, color-coded phases with exact time indicators and icons.

COMPOSITION: Balanced horizontal progress track running from left (00h00) to right (03h00).
- Phase 1 (00:00 - 00:15 / 15 min): Deep Navy block (#0F3C6E) with an eye/compass icon representing "Subject Selection & Term Definition".
- Phase 2 (00:15 - 00:45 / 30 min): Cyan block (#00B4D8) with a branching tree/schematic icon representing "Problematic & Detailed Outline (I & II)".
- Phase 3 (00:45 - 01:00 / 15 min): Gold accent block (#F2B705) with a fountain pen icon representing "Drafting Introduction & Conclusion".
- Phase 4 (01:00 - 02:45 / 105 min): Large prominent central Mint Green block (#2A9D8F) with an open exam notebook icon representing "Full Copy Writing (Part I & Part II)".
- Phase 5 (02:45 - 03:00 / 15 min): Coral Red warning block (#E4572E) with a magnifying glass/checklist icon representing "Mandatory Proofreading & Quality Check".
Above each phase, an elegant numeric badge displays the exact duration; below each phase, a concise bullet point highlights the golden rule.

CAMERA: Straight-on flat graphic camera, orthographic 2D view, perfect horizontal symmetry, generous white borders.

LIGHTING: Crisp flat digital lighting, high contrast between text badges and background cards, no glare.

COLOR LANGUAGE: Professional data-design palette: Navy blue (#0F3C6E), tech cyan (#00B4D8), achievement gold (#F2B705), focused mint (#2A9D8F), alert coral (#E4572E), pure white card surfaces (#FFFFFF).

VISUAL STYLE: Modern minimalist UI card infographic with 2.5px rounded corners, sharp monoline iconography, clean typographic hierarchy, inspired by Swiss international typographical style.

BRANDING: Discrete institutional header text reading "MEF — Concours Ingénieurs d'État: Gestion Chrono 180 Min".

REALISM / QUALITY: Vector clarity, crisp SVG-like edges, zero pixelation, perfectly legible time markers.

NEGATIVE CONSTRAINTS: Avoid realistic messy desks, crumpled papers, analog clock faces with confusing hands, 3D photorealism, cluttered gradients, illegible micro-text.
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
Architecture canonique d'une dissertation de concours administratif pour ingénieur d'État : Partie I (Diagnostic, état des lieux, acquis et contraintes structurelles : I.A Réalisations / I.B Limites) reliée par une transition soignée à la Partie II (Orientations stratégiques, leviers d'ingénierie et recommandations : II.A Feuilles de route nationales / II.B Solutions opérationnelles et modernisation).

**Objectif visuel :**
Schématiser l'équilibre architectural parfait d'une copie de concours et illustrer le rôle vital des chapeaux et des transitions logiques pour obtenir la note maximale en rigueur académique (25% du barème).

**Type :**
Modular Analytical Card / Essay Architecture Blueprint

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_003_methodo_plan_binaire_structure.png`

**Prompt Flow :**
```text
SUBJECT: Architectural blueprint infographic representing the canonical two-part essay structure (Plan Bipartite Équilibré) for high-level civil service examinations.

CONTEXT: State Engineer examination at the Moroccan Ministry of Economy and Finance. Pedagogical visualization of rigorous administrative essay design.

ENVIRONMENT: Crisp white card surface (#FFFFFF) with a light executive navy border, clear structural grid.

ACTION: Structural decomposition of an essay into Introduction, Part I, Intermediary Transition, Part II, and Conclusion with visual balancing indicators.

COMPOSITION: Symmetrical two-column central layout flanked by top and bottom header blocks:
1. Top Banner: "Introduction en 5 Piliers" (Accroche -> Définition -> Contexte Marocain -> Problématique -> Annonce du Plan).
2. Left Pillar (Partie I: Le Constat & Diagnostic):
   - Box I.A: "Acquis, Réalisations & Cadre Légal" (Solid Blue #0F3C6E).
   - Box I.B: "Contraintes Structurelles & Défis" (Coral Accent #E4572E).
3. Central Connector: A stylized bridge node labeled "Chapeau & Transition Logique".
4. Right Pillar (Partie II: La Vision & L'Action):
   - Box II.A: "Feuilles de Route Stratégiques Nationales" (Cyan #00B4D8).
   - Box II.B: "Leviers Opérationnels de l'Ingénieur & Recommandations" (Mint Green #2A9D8F).
5. Bottom Banner: "Conclusion Bipartite" (Bilan Réponse Problématique + Ouverture prospective).
Clean scale balance icon at the apex indicating "50% / 50% Équilibre Parfait".

CAMERA: Frontal flat diagram view, clean modular card alignment, generous margins.

LIGHTING: Clear diffuse studio lighting, subtle soft drop shadows under cards.

COLOR LANGUAGE: Executive academic palette: Sovereign Navy (#0F3C6E), Slate (#334155), Tech Cyan (#00B4D8), Growth Mint (#2A9D8F), Caution Coral (#E4572E), Pure White (#FFFFFF).

VISUAL STYLE: Modern structural blueprint, rounded rectangular containers, crisp linear icons, authoritative typography.

BRANDING: Header label: "Méthodologie MEF — Architecture du Plan Binaire Idéal".

REALISM / QUALITY: Vector perfection, 100% typographic clarity, mathematically balanced blocks.

NEGATIVE CONSTRAINTS: Avoid handwritten messy text, chaotic mind maps, skewed angles, complex decorative textures, unreadable serif fonts.
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
Pedagogical Flat Diagram / Strategic Framework Visualization

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_004_digital_maroc_2030_pillars.png`

**Prompt Flow :**
```text
SUBJECT: A clear, authoritative architectural framework diagram illustrating the "Maroc Digital 2030" National Strategy.

CONTEXT: Economic policy essay preparation for the Moroccan Ministry of Economy and Finance state engineer competition. Grounded in actual 2024 government roadmap documents.

ENVIRONMENT: Pristine white (#FFFFFF) technical canvas with subtle grey baseline grid.

ACTION: Structural presentation showing foundational enablers supporting two towering strategic pillars, culminating in a national sovereignty apex.

COMPOSITION: Classical architectural temple/pillar hierarchy:
1. Top Apex Roof: "Souveraineté Numérique & Rayonnement Africain" (National Digital Sovereignty & African Hub).
2. Two Massive Central Columns:
   - Left Column (Pillar 1): "Digitalisation des Services Publics" (100% User-Centric e-Government, Interoperability, Zero Paper).
   - Right Column (Pillar 2): "Dynamisation de l'Économie Numérique" (Startup Ecosystem, IT Export, 2nd African Outsourcing Hub).
3. Foundation Base (4 Enablers / Catalysts):
   - Icon 1: "Déploiement 5G & Connectivité Haut Débit" (5G Tower).
   - Icon 2: "Cloud National Souverain & Datacenters" (Secure Server Cloud).
   - Icon 3: "Capital Humain: 100 000 Talents/An" (Graduation cap with digital nodes).
   - Icon 4: "Intelligence Artificielle & Confiance Numérique" (AI neural badge + CNDP data privacy lock).
Each section is housed in clean rounded rectangular cards with subtle outline borders.

CAMERA: Frontal straight-on view, balanced architectural layout, high negative space margins.

LIGHTING: Pure diffuse digital illumination, no harsh drop shadows.

COLOR LANGUAGE: Official Moroccan modernization theme: Royal navy blue (#0F3C6E), vibrant teal/cyan (#009688 / #00B4D8), soft gold (#D4AF37), neutral grey outlines (#CFD8DC).

VISUAL STYLE: Clean monoline vector diagram, flat tinted fills, crisp geometric icons, modern executive presentation style (Bain / Roland Berger layout quality).

BRANDING: Clean emblem header "Royaume du Maroc — Stratégie Maroc Digital 2030".

REALISM / QUALITY: Pristine 2D vector graphic precision, sharp vector font labels, zero artifacts.

NEGATIVE CONSTRAINTS: Avoid generic robot handshakes, abstract glowing matrix codes, dark sci-fi background, cluttered circuit boards, distorted architectural pillars.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Ce sujet est tombé au concours du 28 avril 2024. Le schéma fournit directement la structure clé en main pour rédiger la Partie II de la dissertation.

---

## IMG-REPORT-005

**Section :**
Chapitre 2 : Annales Réelles et Décorticage des Sujets — 2.2 Sujet 2 (28 Avril 2024) : Transition Énergétique

**Texte associé :**
Enjeux de la sécurité énergétique au Maroc : réduction de la facture d'importation, mix électrique visant plus de 52% d'énergies renouvelables d'ici 2030 (Solaire Noor, Éolien, STEP Abdelmoumen) et déploiement de « l'Offre Maroc » pour l'Hydrogène Vert (1 million d'hectares fonciers).

**Objectif visuel :**
Illustrer le mix énergétique national et la chaîne de valeur intégrée (Soleil + Vent $\rightarrow$ Électricité verte $\rightarrow$ Dessalement \& Électrolyse $\rightarrow$ Hydrogène Vert / Ammoniac vert pour les phosphates OCP).

**Type :**
Technical Energy Flow Infographic / Value Chain Diagram

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_005_energie_mix_hydrogene_maroc.png`

**Prompt Flow :**
```text
SUBJECT: Modern integrated green energy value chain and renewable mix diagram for Morocco.

CONTEXT: State Engineer competition essay on energy security and ecological transition. Demonstrates technical mastery of renewable power integration and green hydrogen production.

ENVIRONMENT: Clean white background with faint topo-contour map curves in ultra-light grey.

ACTION: Flow diagram showing green energy generation feeding into industrial decarbonization and export.

COMPOSITION: Left-to-right technical process flow:
- Section 1 (Renewable Generation Mix >52% by 2030): Crisp vector icons of Noor Solar CSP/PV mirror arrays, coastal wind turbines, and pumped-storage hydroelectric dam (STEP).
- Section 2 (Smart Grid & Desalination): Central power distribution node connecting to solar-powered seawater desalination plants.
- Section 3 ("Offre Maroc" Green Hydrogen Electrolysis): Industrial electrolyzer splitting desalinated water into Green H2 and Green Ammonia.
- Section 4 (Domestic Decarbonization & Global Export): Feeding green fertilizers (OCP phosphate synergy), clean heavy transport, and green molecule exports to European markets under CBAM compliance.
Data callout badges indicate "52% Capacité EnR 2030" and "1 Million d'Hectares Mobilisés".

CAMERA: Orthographic technical process overview, horizontal sequencing, spacious card containers.

LIGHTING: Clear daytime illumination, subtle fresh gradients on energy flow arrows.

COLOR LANGUAGE: Eco-industrial palette: Solar amber gold (#F39C12), wind turbine cyan (#2980B9), hydrogen emerald green (#27AE60), sovereign navy blue (#0F3C6E).

VISUAL STYLE: High-end engineering infographic with monoline icons, flow pipes, clean rounded nodes, and exact data labels.

BRANDING: Title bar: "Transition Énergétique & Offre Maroc Hydrogène Vert".

REALISM / QUALITY: Technical drawing clarity, precise geometric iconography, zero clutter.

NEGATIVE CONSTRAINTS: Avoid smoke, pollution, realistic coal plants, messy sketch lines, cartoon fantasy look, chaotic piping.
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
Analyse des moteurs de l'inflation au Maroc (inflation importée et choc climatique/alimentaire), mécanisme de transmission de la politique monétaire par Bank Al-Maghrib (hausse du taux directeur de 1,50% à 3,00% puis détente à 2,75% en juin 2024), et mesures budgétaires du MEF (subventions transport, suspension des droits de douane/TVA sur produits essentiels, soutien Caisse de Compensation).

**Objectif visuel :**
Visualiser l'action coordonnée entre la politique monétaire (BAM) et la politique budgétaire (MEF) pour stabiliser les prix sans étouffer la croissance économique.

**Type :**
Macroeconomic Flow Diagram / Policy Transmission Schema

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_006_macro_inflation_bam_transmission.png`

**Prompt Flow :**
```text
SUBJECT: Clear macroeconomic policy diagram illustrating the coordinated policy response to inflation in Morocco between Bank Al-Maghrib and the Ministry of Economy and Finance.

CONTEXT: Recruitment exam preparation for state engineers on public economics and macroeconomic stabilization.

ENVIRONMENT: Crisp white card canvas (#FFFFFF) with structured institutional framing.

ACTION: Visual mapping of inflationary shocks on the left triggering a dual institutional defense mechanism (Monetary + Fiscal) to restore price stability on the right.

COMPOSITION: Three-stage horizontal flow:
1. Left Block (The Dual Shock): Red-accented cards showing "Inflation Importée (Énergie & Matières Premières)" and "Choc Agricole (Sécheresse & Prix Alimentaires: pic +15%)".
2. Center Stage (Coordinated Institutional Response):
   - Top Channel: "Bank Al-Maghrib (Politique Monétaire)" -> Taux directeur adjustment chart (1.50% -> 3.00% -> 2.75%) tightening credit and anchoring inflation expectations.
   - Bottom Channel: "MEF (Politique Budgétaire)" -> Subsidies for road transport, suspension of import duties/VAT on livestock/oil, and targeted compensatory cushions.
3. Right Target (Stabilization Outcome): Green-accented gauge showing inflation decelerating back towards the target corridor (1.5% - 2.0% in 2024).

CAMERA: Straight-on flat graphic view, clear directional connectors, high visual legibility.

LIGHTING: Clean digital diffuse lighting with distinct contrast between shock indicators and solution badges.

COLOR LANGUAGE: Economic governance palette: Alert crimson (#C0392B), central bank gold (#D4AF37), MEF sovereign navy (#0F3C6E), stability emerald (#27AE60), clean light grey containers (#F8F9FA).

VISUAL STYLE: Premium financial editorial infographic (Financial Times / The Economist visual quality), sharp typography, clean minimal icons.

BRANDING: Header title: "Macroéconomie Marocaine — Mécanismes de Lutte Contre l'Inflation (BAM & MEF)".

REALISM / QUALITY: Vector perfection, 100% sharp text badges, mathematically clean curves.

NEGATIVE CONSTRAINTS: Avoid burning cash banknotes, cartoon coins, distressed faces, chaotic market charts, complex academic formulas.
```

**Priorité :**
🟠 PRIORITÉ 2 — IMPORTANTE

**Justification :**
L'articulation entre le taux directeur de BAM et les subventions du MEF est la réponse clé attendue dans toute dissertation touchant à la macroéconomie et au pouvoir d'achat.

---

## IMG-REPORT-007

**Section :**
Chapitre 2 : Annales Réelles — 2.4 Sujet 4 (Session Réelle 2021-2022) : Maîtrise du Déficit Budgétaire et Dette Publique

**Texte associé :**
Trajectoire de consolidation budgétaire du Maroc : réduction du déficit de plus de 7% (crise 2020) à 4,3% en 2023, avec cible 4% en 2024 et 3,5% à terme ; niveau de la dette du Trésor stabilisé autour de 69,5%-70% du PIB (75% intérieure) ; et leviers de redressement (élargissement de l'assiette fiscale, optimisation de la dépense, financements innovants et Règle d'or de l'Art. 20 LOF 130-13).

**Objectif visuel :**
Présenter la trajectoire de soutenabilité des finances publiques marocaines et synthétiser les 4 leviers d'action budgétaire du MEF pour allier assainissement des comptes et financement des investissements.

**Type :**
Financial Dashboard Infographic / Fiscal Trajectory Matrix

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_007_budget_dette_deficit_trajectoire.png`

**Prompt Flow :**
```text
SUBJECT: Institutional fiscal sustainability dashboard depicting Morocco's budget deficit reduction trajectory and public debt management.

CONTEXT: Public finance examination preparation for the Moroccan Ministry of Economy and Finance. Demonstrates rigorous grasp of fiscal consolidation targets and debt thresholds.

ENVIRONMENT: Clean modern financial executive canvas on white (#FFFFFF) with refined slate blue structural dividers.

ACTION: Visual progression tracking the downward slope of the fiscal deficit alongside the key strategic levers of public finance optimization.

COMPOSITION: Symmetrical split dashboard:
1. Left Half (Fiscal Deficit & Debt Trajectory):
   - A descending step graph showing Deficit Budgétaire (% of GDP): 7.1% (2020 Covid peak) -> 4.3% (2023) -> 4.0% (PLF 2024) -> 3.5% (Target 2026).
   - A callout meter card displaying "Dette du Trésor: ~69.5% du PIB" with a breakdown badge highlighting "75% Dette Intérieure (Faible risque de change)".
2. Right Half (The 4 MEF Fiscal Levers):
   - Lever 1: "Élargissement de l'Assiette Fiscale" (Integration of informal sector, Loi-cadre 69-19).
   - Lever 2: "Rationalisation de la Dépense" (LOF 130-13 performance-based budgeting).
   - Lever 3: "Financements Innovants" (Active state asset monetization & PPP Law 86-12).
   - Lever 4: "Règle d'Or (Art. 20 LOF)" (Borrowing strictly restricted to financing capital investment, not operational costs).

CAMERA: Straight-on executive dashboard view, clean borders, balanced negative space.

LIGHTING: High-clarity digital lighting, professional data visualization contrast.

COLOR LANGUAGE: Sovereign fiscal palette: Navy blue (#0F3C6E), fiscal trajectory cyan (#00B4D8), success mint green (#2A9D8F), warning amber (#F39C12), pure white card surfaces (#FFFFFF).

VISUAL STYLE: High-level financial reporting infographic (World Bank / IMF country review style), clean lines, sharp metrics, elegant typography.

BRANDING: Header badge: "Finances Publiques du Maroc — Trajectoire Budgétaire & Soutenabilité de la Dette".

REALISM / QUALITY: Vector graphic perfection, clean typography, 8k sharp resolution.

NEGATIVE CONSTRAINTS: Avoid bankruptcy graphics, declining red crash arrows, stock market tickers, 3D glossy effects, clutter.
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
Data Journey Architecture / Public Tech Pipeline

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_008_social_rsu_ciblage_pipeline.png`

**Prompt Flow :**
```text
SUBJECT: Architectural data journey infographic of Morocco's unified social targeting pipeline (RNP to RSU to Direct Social Aid).

CONTEXT: Public policy reform under Royal Vision. Demonstrates how civil identification and predictive scoring enable equitable direct cash transfers and healthcare coverage.

ENVIRONMENT: Clean executive white background (#FFFFFF) with high-legibility layout.

ACTION: Linear data processing stages from citizen registration to secure benefit delivery.

COMPOSITION: Step-by-step 4-stage pipeline linked with illuminated directional arrows:
1. Stage 1 — Citizen Identification (RNP): Digital ID card and biometric digital verification generating a unique civil identifier (Identifiant Digital Civil et Social).
2. Stage 2 — Household Socio-Economic Profiling (RSU): Integrated database ingesting household living standards, water/electricity indices, assets, and geographic indicators.
3. Stage 3 — Algorithmic Scoring Engine: Automated objective formula calculating the household socio-economic threshold score (Seuil d'éligibilité).
4. Stage 4 — Targeted Delivery:
   - Branch A: AMO Tadamon (Fully subsidized universal health insurance coverage).
   - Branch B: Aide Sociale Directe (ASD monthly direct family stipends via interoperable bank/mobile payment accounts).
Each stage features a clean icon badge, clear descriptive title, and status checkmark.

CAMERA: Frontal flat diagram view, sequential reading flow from left to right.

LIGHTING: Crisp high-key lighting, bright transparent cards with subtle blue-grey shadows.

COLOR LANGUAGE: Social state governance palette: Royal navy (#0F3C6E), trust cyan (#00B4D8), healthcare emerald (#2A9D8F), warm amber (#E67E22), neutral light grey (#F1F3F5).

VISUAL STYLE: World Bank / OECD technical report infographic style, sharp geometric lines, clean sans-serif typography, accessible icons.

BRANDING: Header: "Chantier Royal de la Protection Sociale — Architecture de Ciblage RNP / RSU".

REALISM / QUALITY: Vector perfection, 2D monoline precision, flawless alignment.

NEGATIVE CONSTRAINTS: Avoid impoverished human portraits, stigmatizing depictions, messy database schemas with code snippets, dark mood.
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
Comparative Data Visualization / Strategic Policy Infographic

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_009_investissement_charte_ratio.png`

**Prompt Flow :**
```text
SUBJECT: Comparative visual infographic showing the paradigm shift of investment ratio in Morocco from current state to Vision 2035.

CONTEXT: National Investment Charter (Loi-cadre 03-22). Focus on mobilizing private domestic and foreign investment to drive sustainable economic growth.

ENVIRONMENT: Clean, elegant white card canvas with subtle executive slate border.

ACTION: Visual comparison between two proportional donut charts and a structured incentive prime matrix below.

COMPOSITION:
Top Half (The Ratio Inversion):
- Left Circular Chart labeled "Situation Actuelle": 67% Public Investment (solid Navy #0F3C6E) vs 33% Private Investment (light Cyan #00B4D8).
- Center: Dynamic transformational arrow labeled "Objectif Horizon 2035".
- Right Circular Chart labeled "Cible Charte 2035": 33% Public Investment (Navy #0F3C6E) vs 67% Private Investment (vibrant Gold #F2B705 / Mint #2A9D8F).
Bottom Half (The Support Mechanism):
- Three horizontal reward cards detailing:
  1. "Prime Commune": employment creation, gender parity, local integration.
  2. "Prime Territoriale": reducing regional disparities across provinces.
  3. "Prime Sectorielle": high value-added industries and future sectors.

CAMERA: Frontal symmetrical graphic display, distinct data labels, clean mathematical proportions.

LIGHTING: Studio balanced lighting, crisp readable contrast.

COLOR LANGUAGE: Financial executive theme: Deep navy (#0F3C6E), investment gold (#F2B705), private sector cyan (#00B4D8), growth mint (#2A9D8F), white card background (#FFFFFF).

VISUAL STYLE: High-end financial consulting graphic (McKinsey / BCG annual outlook style), clean geometric lines, clear numeric percentages.

BRANDING: Header: "Nouvelle Charte de l'Investissement (Loi-cadre 03-22) — Inversion du Ratio Public / Privé".

REALISM / QUALITY: Vector perfection, 100% sharp typography, accurate pie segments.

NEGATIVE CONSTRAINTS: Avoid 3D tilted pies, glossy glass effects, confusing financial tickers, cluttered stock market charts.
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
Ecosystem Topology Map / Institutional Hierarchy Diagram

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_010_mef_poles_organigramme.png`

**Prompt Flow :**
```text
SUBJECT: A pristine functional ecosystem organigram map of the Ministry of Economy and Finance of the Kingdom of Morocco.

CONTEXT: Recruitment competition preparation. Essential administrative taxonomy showing directorates and operational responsibilities.

ENVIRONMENT: Clean white background with subtle rounded modular card containers.

ACTION: Structural grouping of MEF directorates into four operational poles under the Minister and General Secretariat.

COMPOSITION:
Top Apex: Executive Head badge: "Ministre de l'Économie et des Finances" linked to the "Inspection Générale des Finances (IGF)" and "Secrétariat Général".
Below, four clearly defined vertical clusters with distinctive accent color tags:
1. Pôle Fiscalité & Douanes:
   - Direction Générale des Impôts (DGI)
   - Administration des Douanes et Impôts Indirects (ADII)
2. Pôle Trésor & Dépenses Publiques:
   - Trésorerie Générale du Royaume (TGR)
   - Direction du Budget (DB)
3. Pôle Financement & Politique Économique:
   - Direction du Trésor et des Finances Extérieures (DTFE)
   - Direction des Études et des Prévisions Financières (DEPF)
4. Pôle Patrimoine & Entreprises Publiques:
   - Direction des Domaines de l'État (DDE)
   - Direction des Entreprises Publiques (DEPP) & ANGSPE
Each card features a crisp official icon, standard French acronym, and a one-line mission summary.

CAMERA: Frontal orthographic tree diagram, clean connector lines with rounded elbows, harmonious spacing.

LIGHTING: Uniform diffuse digital lighting, high contrast.

COLOR LANGUAGE: Institutional Moroccan identity: Navy blue (#0F3C6E), slate grey (#37474F), accent gold (#D4AF37), card border tints.

VISUAL STYLE: Corporate administrative governance chart, sharp 2.5px rounded rectangles, elegant hierarchy, clean typography.

BRANDING: Official label: "Ministère de l'Économie et des Finances — Cartographie des Directions Clés".

REALISM / QUALITY: Vector perfection, impeccable text alignment, zero visual noise.

NEGATIVE CONSTRAINTS: Avoid bureaucratic complex spiderwebs, overlapping connectors, blurry text, cartoon characters, photographic portraits of politicians.
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
Milestone Roadmap Infographic / Constitutional Calendar Wheel

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_011_lof_calendrier_budgetaire.png`

**Prompt Flow :**
```text
SUBJECT: An authoritative circular/horizontal milestone roadmap of the Moroccan annual budget cycle under the Organic Law of Finance (LOF 130-13).

CONTEXT: Public finance law examination training. Clear visual encoding of constitutional deadlines and parliamentary scrutiny periods.

ENVIRONMENT: Clean white executive card layout with clear monthly time markers.

ACTION: Progressive chronological milestones tracking the preparation, presentation, vote, and publication of the Finance Bill (Projet de Loi de Finances - PLF).

COMPOSITION: Dynamic timeline progression highlighting four statutory critical dates:
- Milestone 1 (Avant le 15 Mars): Circular of the Head of Government setting spending priorities (Icon: Official Circular).
- Milestone 2 (Avant le 15 Juillet): Joint Parliamentary presentation by the Minister of Economy and Finance on budget execution and 3-year multi-year programming (PBT) (Icon: Parliamentary Podium).
- Milestone 3 (🔴 Au plus tard le 20 Octobre — DATE CLÉ): Mandatory constitutional deposit of the PLF on the Bureau of the House of Representatives (Chambre des Représentants) (Icon: Official Bill Deposit).
- Milestone 4 (Octobre - Décembre / 60 Jours): Parliamentary vote sequence (30 days 1st chamber, 22 days 2nd chamber, 6 days final reading) ending with promulgation in the Bulletin Officiel before Dec 31 (Icon: Royal Seal).
Each milestone is housed in an executive card with exact calendar date badges in bold typography.

CAMERA: Direct frontal view, clear directional progression, perfectly balanced spacing.

LIGHTING: High-contrast crisp digital lighting, distinct color-coded milestone badges.

COLOR LANGUAGE: Legal and financial theme: Sovereign navy (#0F3C6E), constitutional crimson (#C0392B for the 20 Oct deadline), legal gold (#D4AF37), verification teal (#16A085).

VISUAL STYLE: Elite institutional infographic, rounded timeline pins, crisp monoline icons, clear font hierarchy.

BRANDING: Prominent header: "LOF 130-13 — Le Calendrier Budgétaire Constitutionnel de la Loi de Finances".

REALISM / QUALITY: Vector perfection, 100% readable dates, clean graphic geometry.

NEGATIVE CONSTRAINTS: Avoid confusing zigzag lines, unreadable date fonts, generic calendar cliparts, complex decorative flourishes.
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
Tactical Schedule Dashboard / High-Yield Study Sprint Matrix

**Ratio :**
16:9

**Orientation :**
Landscape

**Nom du fichier :**
`images/img_012_planning_commando_j3_matrice.png`

**Prompt Flow :**
```text
SUBJECT: High-yield tactical revision sprint dashboard matrix for the final 72 hours before the Moroccan State Engineer competitive exam.

CONTEXT: Intensive preparation guide for the Ministry of Economy and Finance recruitment on September 20. Structured commando study plan.

ENVIRONMENT: Modern executive dashboard layout on pure white background (#FFFFFF) with clean slate borders.

ACTION: Visual scheduling matrix organizing the final three preparation days into distinct color-coded operational learning blocks.

COMPOSITION: Three vertical day columns topped by clear date and objective badges:
1. Column 1 (Jour 1 - 17 Sept: "Fondations & Règles d'Or"):
   - Block A (14h-18h): Méthodologie & Décorticage Sujets Réels (Maroc Digital 2030 / Énergie).
   - Block B (19h-23h): Finances Publiques & LOF 130-13 (4 Principes, Calendrier, Art. 20).
2. Column 2 (Jour 2 - 18 Sept: "Intensité & Simulation Réelle"):
   - Block C (08h30-12h30): Organisation MEF & SI Étatiques (DGI, TGR, Douanes, GID, SIMPL).
   - Block D (14h-18h): Épreuve Blanche Rédactionnelle 2h30 Chrono.
   - Block E (19h-22h30): Sprint Banque QCM (Focus Priorité Rouge 🔴).
3. Column 3 (Jour 3 - 19 Sept: "Chiffres Clés & Sérénité"):
   - Block F (09h-12h30): Chantiers Stratégiques (Protection Sociale RSU, Charte Investissement).
   - Block G (14h30-17h30): Fiches Chiffres Clés & Vocabulaire d'Impact.
   - Block H (18h30-21h00): Contrôle Logistique & Coupure Totale à 21h00 pour Sommeil Réparateur.
At the bottom, an achievement tracker indicates "Objectif 20 Septembre: Maîtrise & Réussite".

CAMERA: Frontal orthogonal dashboard perspective, perfectly aligned columns and cards, sharp readability.

LIGHTING: High-contrast ambient digital light, crisp card shadows.

COLOR LANGUAGE: Operational motivation palette: Deep navy (#0F3C6E), focus cyan (#00B4D8), simulation amber (#E67E22), rest/serenity green (#2A9D8F), white card containers (#FFFFFF).

VISUAL STYLE: Modern productivity dashboard, monoline status icons, clean badges, Swiss typography.

BRANDING: Header: "Concours MEF Ingénieurs d'État — Matrice de Révision Commando J-3".

REALISM / QUALITY: Vector perfection, 100% legible time badges and task labels, zero visual distortion.

NEGATIVE CONSTRAINTS: Avoid anxious or chaotic imagery, messy handwritten sticky notes, blurry text, dark depressing mood, low resolution artifacts.
```

**Priorité :**
🔴 PRIORITÉ 1 — ESSENTIELLE

**Justification :**
Ce planning est le fil conducteur opérationnel du candidat pour les dernières 72 heures avant le 20 septembre, évitant le piège de la panique et de la surcharge cognitive.
