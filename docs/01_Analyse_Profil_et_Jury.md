# Analyse du profil face au jury MEF

Rédigé le 9 novembre 2026. Documents lus en entier : le CV une page ([fichier personnel]), la version deux pages (`CV-2pages-French_Version/cv.tex`, différences seulement), la fiche `docs/INFORMATIONS_CANDIDATURE.md` du dossier CV, le README et le journal (`documentation/PROGRESS.md`) de ce dépôt, le guide MEF de la branche `concours-mef-2026` (chapitres méthodologie et fiches), la liste publique de tes dépôts GitHub. Le PDF compilé n'a pas été relu page par page : ses sources LaTeX l'ont été.

## 1. Le parcours, tel qu'il est écrit

| Période | Étape | Ce que le jury retiendra |
|---|---|---|
| 2018-2021 | Bac sciences mathématiques, lycée Ibn Soulaimane Roudani, Taroudant | Un élève de la province de Taroudant |
| 2021-2023 | CPGE, Agadir (MPSI) | Le concours national, la rigueur |
| 2023-2026 | EHTP, ingénieur d'État en génie informatique, mention Bien (14,14/20) | Une grande école publique, sous tutelle du ministère de l'Équipement et de l'Eau |
| juil-août 2024 | Marolet, Meknès : refonte du site WordPress Behost.ma | Premier contact avec un client réel |
| juil-sept 2025 | OHSE Capital, Laâyoune : application mobile de santé au travail (Spring Boot, Flutter, JWT, Docker) | Analyse du besoin avec RH, HSE, médecin |
| sept-nov 2025 | Optizaworks, Agadir : gestion de stock (Laravel, Vue.js, bons d'entrée et de sortie) | Logique de gestion, traçabilité des mouvements |
| fév-juin 2026 | PFE, CID Développement, Casablanca : SiteSafe AI, supervision HSE par vision par ordinateur (Spring Boot, Kafka, PostGIS, React, RT-DETR/YOLO, MinIO, Docker, Scrum) | Un projet complet, en microservices, avec de l'IA |
| 2024-2025 | Chef design du Club social de l'EHTP (Caravane, Forum social) | Engagement social |

## 2. Les points forts à mettre en avant

1. **Un ingénieur qui livre des applications complètes.** Quatre stages dans quatre villes, chaque fois une application de bout en bout : analyse du besoin, backend, frontend, conteneurs. C'est exactement le profil « génie logiciel et développement ».
2. **Des applications de gestion et de traçabilité.** Stock et bons d'entrée/sortie (Optizaworks), cycle de vie des non-conformités avec validation (PFE), rendez-vous et certificats (OHSE). Le MEF gère surtout des flux contrôlés : dépenses, recettes, déclarations. Le lien est direct.
3. **La sécurité intégrée.** JWT, authentification, rôles, notifications. Bon point d'appui pour parler de la loi 05-20.
4. **La donnée et l'IA.** Vision par ordinateur au PFE, PostGIS, Power BI dans les outils. Utile pour parler du ciblage du contrôle (DGI, ADII).
5. **L'origine.** Aoulouz, province de Taroudant : tu peux parler de l'accès aux services publics en milieu rural avec du vécu.
6. **Un travail visible.** Ton GitHub est public, ainsi que ton portfolio. Le jury peut le consulter.

## 3. Incohérences et détails que le jury peut relever

| Point | Pourquoi c'est un risque | Ce qu'il faut faire |
|---|---|---|
| « diplômé juin 2026 » | La délibération du jury est datée du 06/07/2026 (fiche candidature) | Corriger en « promotion 2026 » ou « juillet 2026 » |
| CPGE « MPSI » sur deux ans | La 2e année n'est pas MPSI. La fiche candidature dit « MPSI / MP ». | Écrire « MPSI puis MP » si c'est exact |
| « réduction du taux de rebond de 30 % » (Marolet) | Le jury peut demander comment ce chiffre a été mesuré | Savoir dire l'outil de mesure (Google Analytics ?) et la période, sinon retirer le chiffre |
| Longue liste de langages (C, C++, C#, ASP.NET, Java, Python…) | Chaque mot du CV peut devenir une question | Savoir dire en une phrase ce que tu as fait avec chacun, ou alléger la liste |
| « Blockchain » (Kit Commun Hospitalier) | Question probable : « pourquoi une blockchain et pas une base de données ? » | Préparer la réponse (fiche 05) |
| Anglais « intermédiaire » | Peut servir de « faiblesse » honnête | La transformer en plan de progrès concret |
| Profil tourné vers « une équipe dynamique » | Formulation de candidature privée | Proposition : « Ingénieur d'État en génie informatique (EHTP, 2026), je souhaite mettre mes compétences en développement d'applications sûres et fiables au service de la modernisation de l'administration financière. » |

### Le CV à imprimer pour l'oral (créé le 09/11/2026)

Un CV propre à l'oral MEF a été créé : source [fichier personnel], PDF copié dans [fichier personnel]. Il part de `CV_Job_Software_FR` (08/11/2026), dont les faits ont été vérifiés contre les relevés, l'attestation et le dossier du PFE. Toutes les incohérences ci-dessus y sont corrigées (juillet 2026, MPSI puis MP, mention Bien, pas de « -30 % », anglais C1). Une page, une colonne, aucune image, texte lisible dans l'ordre (contrôle ATS fait). Retirés pour ce poste : les projets commerciaux (agent-task-loop avec offre payante, agent Instagram), les jeux en C, la liste de langages non utilisés récemment. **Chaque mot de ce CV doit pouvoir être expliqué** : relis-le ligne par ligne avec la fiche 05.

L'ancien CV (`CV-1page-French_Version`) n'est plus à imprimer : il dit « anglais intermédiaire » alors que tu as un C1 (EF SET, octobre 2026).

### Relecture du PDF imprimé (`CV_Abdellatif_GOURRI.pdf`, 09/11/2026)

Le PDF d'une page a été relu en entier, texte et rendu visuel : il est identique à `cv.tex` (compilé le 15/07/2026). Petits détails à corriger avant d'imprimer les deux copies :
- « École Hassania des Travaux Publics –CASABLANCA, » : virgule finale en trop, espace manquante après le tiret (même chose pour « –AGADIR » et « –TAROUDANT »).
- « Baccalauréat en Sciences Mathématiques . » : espace avant le point.
- La mention « Bien » ne figure pas sur le CV ; tu peux l'ajouter à la ligne de l'EHTP.
- GESTINDEM n'est pas dans « Projets notables ». Si tu comptes en parler, l'ajouter avec son statut exact (fiche 09) évite que le jury le découvre seulement sur GitHub.

## 4. Lacunes à combler avant jeudi

- **Finances publiques** : aucun cours ni stage sur le sujet dans le CV. C'est normal pour un informaticien, mais il faut connaître les bases (fiche 03) et le dire avec humilité.
- **Aucune expérience dans l'administration.** Le jury le sait. Réponse prête dans la fiche 06.
- **Cybersécurité réglementaire** (loi 05-20, DGSSI) : non couverte par le CV (fiche 03).
- **Projet GESTINDEM** (`gestindem-chr-guelmim` sur ton GitHub public) : une application de gestion des indemnités pour un hôpital public, en .NET. Elle n'est pas sur le CV. Vérifié le 09/11/2026 (fiche 09) : c'est une réponse à l'avis d'achat 43/2026/CHRG du CHR de Guelmim, avec maquettes et moteurs de calcul faits, persistance et client non terminés ; rien n'indique une attribution. Bien présenté avec ce statut exact, c'est un argument très fort (calcul et contrôle d'une dépense publique).

## 5. Questions difficiles probables, liées à ton CV

1. « Vous avez fait quatre stages dans le privé. Pourquoi l'administration maintenant ? »
2. « Votre PFE parle de casques et de gilets sur un chantier. Quel rapport avec le ministère des Finances ? »
3. « Kafka dans un PFE : était-ce vraiment nécessaire ? »
4. « Qui a fait quoi dans votre PFE ? Quelle partie est vraiment la vôtre ? »
5. « Vous citez YOLO et RT-DETR. Quelle précision avez-vous obtenue, et sur quelles données ? »
6. « Comment avez-vous sécurisé vos API ? Où stockez-vous le token ? »
7. « Vous avez passé d'autres concours ? Si vous êtes admis ailleurs, que faites-vous ? »
8. « Vous êtes jeune (22 ans). Comment allez-vous vous imposer face à des collègues expérimentés ? »
9. « Un ingénieur d'État gagne plus dans le privé. Pourquoi resteriez-vous ? »
10. « Vous êtes d'Aoulouz. Qu'est-ce que le ministère fait concrètement pour votre commune ? »

Les réponses sont travaillées dans les fiches 02, 05 et 06.
