# Spécialité : génie logiciel et développement

Rédigé le 9 novembre 2026. L'avis dit que l'oral porte sur la spécialité et les missions du ministère, et qu'une épreuve pratique est possible. Chaque réponse est courte et reliée, quand c'est possible, à un système du MEF. Ne cite jamais un chiffre de ton PFE que tu ne peux pas prouver : les crochets sont à remplir par toi.

## 1. Ton PFE, SiteSafe AI

Faits vérifiés (source : [fichier personnel], dossier construit à partir du code Git, des rapports et de l'attestation ; relu le 09/11/2026). Ils remplacent les crochets de la première version de cette fiche.

En une minute :
- Le cadre : CID Développement, bureaux de Casablanca, du 02/02/2026 à juin 2026, soutenance le 22/06/2026, **projet en binôme, noté 15,50/20**. L'entreprise a noté « Excellent » sur 6 critères sur 9.
- Le problème : sur les chantiers, l'absence de casque, de gilet, de gants ou de chaussures de sécurité cause des accidents ; le contrôle humain ne peut pas tout voir.
- La solution : une plateforme qui analyse des **vidéos de chantier enregistrées** (aucune vraie caméra ni drone), détecte l'absence d'équipement, et transforme chaque détection en dossier à valider : le responsable HSE confirme ou rejette, affecte avec un délai, l'animateur envoie une photo de correction, le responsable clôture ou renvoie.
- **Qui a fait quoi** : mon binôme a préparé les données et entraîné trois modèles (YOLOv8s, YOLOv10l, RT-DETR-l). Moi, j'ai fait l'analyse du processus en 8 phases de CID, les spécifications, UML et BPMN ; presque tout le back-end (74 des 76 commits) ; le service d'IA en Python/FastAPI qui fait tourner le modèle RT-DETR ; l'intégration du front-end (53 des 60 commits) ; Docker Compose (8 conteneurs). L'encadrant de CID a créé le squelette des dépôts et la base de l'interface.
- La validation humaine vient du processus de CID (« l'IA propose des constats à vérifier ») : je l'ai modélisée et programmée comme une machine à 5 états.
- Les chiffres que tu peux citer : dans le banc d'essai de ton binôme, le meilleur modèle (YOLOv8s) atteint 81,4 % de mAP@0,5. La plateforme fait tourner un RT-DETR-l (78,0 %), pas le YOLOv8s.

À ne pas dire (faux ou non mesuré) : « j'ai entraîné le modèle » ; « YOLOv8 déployé » ; « temps réel en moins de 100 ms » ; « vraies caméras » ; « tests automatisés » (les tests étaient manuels, avec Postman) ; « journal d'audit complet » ; « neuf conteneurs ».

Les limites que tu connais (le jury aime l'honnêteté) : le jeton d'accès était gardé dans le localStorage (le jeton de rafraîchissement, lui, dans un cookie HttpOnly) ; le service d'IA n'avait pas d'authentification ; les images étaient dans des espaces de stockage lisibles publiquement ; aucun test de charge. « Pour un système de l'État, je corrigerais d'abord ces trois points. »

Le lien avec le MEF (question presque certaine) : « Le métier change, la logique reste : détecter une anomalie, la tracer, la faire valider et en garder la preuve. C'est ce que font les systèmes de contrôle de la dépense ou de ciblage du risque à la douane. »

**Les 8 phases du processus de CID** (source : [fichier personnel], document remis par le Product Manager de CID en semaine 1, le 05/02/2026 ; relu le 09/11/2026). Ce processus est la cible ; il n'a pas été entièrement réalisé.
1. Préparation : on décrit le chantier, ses zones (circulation, travail en hauteur, zones interdites…) et les règles HSE de chaque zone (EPI obligatoires).
2. Déclenchement : l'inspection part de caméras fixes ou de missions de drone (dans le projet réalisé : des vidéos enregistrées).
3. Collecte : images et vidéos datées et rattachées à une zone.
4. Pré-qualification par l'IA : le modèle détecte l'absence d'EPI, avec un niveau de confiance. « L'IA n'émet pas une sanction, elle propose des constats à vérifier. »
5. Validation humaine : l'inspecteur valide, rejette ou corrige chaque détection ; une détection validée devient un constat officiel.
6. Non-conformités : le constat devient un incident, affecté à un responsable avec une action, un délai et une priorité, jusqu'à la preuve de correction.
7. Avancement du chantier : comparer l'état réel au planning (non réalisé dans le projet).
8. Reporting : un rapport d'inspection et un historique (rapports PDF non réalisés).

À dire : « L'entreprise nous a donné son processus cible en huit phases. Je l'ai analysé et traduit en UML et en BPMN. Dans le temps du stage, nous avons réalisé surtout le cœur : la détection, la validation humaine et le suivi des non-conformités. » Ne dis pas « j'ai conçu les huit phases ».

**BPMN** (Business Process Model and Notation) : une notation standard pour dessiner un processus métier, pour que le métier et les développeurs lisent le même schéma. Cercles pour les événements (début, fin), rectangles pour les tâches, losanges pour les décisions, et un couloir par acteur. Dans le PFE : le cycle d'un incident, de la détection à la clôture. **Lien MEF** : le circuit d'une dépense (engagement, visa, ordonnancement, paiement) se dessine aussi en BPMN.

Relances probables :
- Pourquoi des microservices ? Le service d'IA (Python) et le métier (Java) évoluent et montent en charge différemment ; chaque service se déploie seul. Le prix : plus de complexité (réseau, supervision, cohérence des données). Pour une petite application, un monolithe bien découpé suffit.
- Pourquoi Kafka ? Pour ne perdre aucune alerte si le service métier tombe : les messages sont conservés et rejoués, avec deux réessais automatiques. Réponse honnête si on insiste : RabbitMQ avait été recommandé en semaine 4 et aurait pu suffire à cette échelle.
- Pourquoi MinIO ? Stockage objet compatible S3, hébergeable chez soi : utile quand les données doivent rester sur le territoire.
- Données personnelles : ce sont des images de travailleurs. Il faut informer, limiter la durée de conservation et l'accès (loi 09-08, CNDP).

## 2. Les autres projets du CV

| Projet | Réponse prête |
|---|---|
| OHSE Capital (OSHApp) | Application Flutter et API Spring Boot ; rôles différents (RH, HSE, infirmier, médecin) ; analyse du besoin et maquettes Figma validées par le métier avant de coder. |
| Optizaworks (stock) | Laravel et Vue.js ; chaque mouvement produit un bon d'entrée ou de sortie : c'est la traçabilité, comme une pièce justificative en comptabilité publique. |
| Marolet | Refonte WordPress, mise à jour des plugins pour la sécurité. Savoir d'où vient le « -30 % de taux de rebond ». |
| GESTINDEM (sur le CV MEF) | Ce que dit le CV : application de liquidation des indemnités de garde, d'astreinte, de permanence et de déplacement, d'après le cahier des charges d'un avis d'achat du CHR de Guelmim ; maquettes, puis moteurs de calcul et circuit de validation en C#/.NET écrits après leurs cas de test ; base de données et interface non terminées. Vérifié sur le dépôt public le 09/11/2026 : 30 commits, tous à ton nom (31/08 au 10/09/2026). **Lien MEF** : c'est la liquidation d'une dépense publique (barèmes, plafonds, validation, journal des annulations). **Prépare** : pourquoi l'ADR-001 cite « [prénom retiré] » comme décideur (l'ADR-004 te cite toi) ; si tu as déposé une offre ou non ; corrige si possible le README, qui dit « Projet réalisé … pour le CHR » et cite un ADR-007 qui n'existe pas. |
| Kit Commun Hospitalier (blockchain) | La blockchain prouve qu'un dossier n'a pas été modifié. Limite honnête : souvent, une base de données avec un journal d'audit signé suffit et coûte moins cher. |
| Supervision photovoltaïque (`pv-mpp-monitor`, **retiré du CV MEF le 11/11/2026** : ne pas le citer de toi-même) | Projet académique de 2025 repris en novembre 2026 « comme le dépôt d'un client » : 4 défauts trouvés (tests qui ne démarraient pas, import de texte rejeté, dates perdues à l'import CSV, PostgreSQL jamais utilisé par Docker Compose), chacun prouvé par un test avant la correction ; 6 tests sur 6 passent ; intégration continue GitHub Actions. Données simulées. **Lien MEF** : « reprendre un système existant sans tout casser : reproduire, prouver, corriger, documenter ». Le README dit que Claude Code a servi pour le travail de routine : si on te le demande, dis-le simplement. |
| Recommandation FP-Growth (sur le CV MEF) | Projet académique EHTP (2025) : Flask, PostgreSQL, Docker, jeu de données public Online Retail. Support (fréquence d'un ensemble de produits), confiance (probabilité d'acheter B quand on achète A), lift (supérieur à 1 si A et B vont vraiment ensemble). **Lien MEF** : chercher des associations dans des transactions ressemble à la recherche de schémas suspects dans des déclarations. **À préciser par toi : ta part dans ce projet** (le dépôt indique des auteurs « Student A / Student Y »). |
| Serveur Linux (HTTP, SMTP, LDAP) | LDAP centralise les comptes et les droits des utilisateurs, comme l'annuaire d'une administration. |

## 3. Questions techniques probables, réponses courtes

Architecture et conception :
- API REST : des ressources identifiées par des URL, manipulées avec les verbes HTTP (GET, POST, PUT, DELETE), sans état côté serveur.
- SOLID : une responsabilité par classe ; ouvert à l'extension, fermé à la modification ; substitution de Liskov ; interfaces ciblées ; dépendre des abstractions.
- Patrons : MVC, Repository, Singleton, Observer (notifications), Factory.
- UML pour le logiciel (cas d'utilisation, classes, séquences) ; Merise pour les données (MCD, MLD).

Bases de données :
- ACID : atomicité, cohérence, isolation, durabilité. Indispensable pour un paiement : fait en entier ou pas du tout.
- SQL pour des données structurées et des transactions (comptabilité, dépense) ; NoSQL pour des données volumineuses ou peu structurées (journaux, documents).
- Un index accélère la lecture et ralentit un peu l'écriture.
- Normalisation : éviter doublons et incohérences (1re, 2e, 3e forme normale).
- Injection SQL : la parade est la requête paramétrée.

Sécurité des applications :
- OWASP Top 10 : contrôle d'accès défaillant, failles cryptographiques, injection, conception non sûre, mauvaise configuration, composants vulnérables, authentification défaillante, intégrité des données, journalisation insuffisante, SSRF.
- JWT : jeton signé qui porte l'identité et les droits ; durée courte, renouvellement, jamais de données sensibles dedans ; dans le navigateur, préférer un cookie HttpOnly et Secure.
- Mots de passe : jamais en clair ; hachage lent avec sel (bcrypt, Argon2).
- HTTPS/TLS chiffre et authentifie l'échange.
- Moindre privilège, défense en profondeur, journalisation.
- Lien MEF : ces règles rejoignent les obligations de la loi 05-20 et les directives de la DGSSI.

DevOps et qualité :
- Le conteneur partage le noyau du système : léger, rapide. La machine virtuelle embarque un système complet : plus isolée.
- CI/CD : chaque modification est compilée, testée et déployée automatiquement.
- Tests unitaires, d'intégration, de bout en bout, de charge.
- Git : une branche par fonctionnalité, revue de code avant fusion.
- Haute disponibilité : redondance, sauvegardes testées, plan de reprise, site de secours (le MEF en prépare un).

Méthode :
- Scrum : sprints courts, backlog priorisé, réunion quotidienne, revue et rétrospective.
- Dans l'administration, les marchés publics imposent un cahier des charges ; on peut quand même livrer par lots et valider avec les utilisateurs à chaque étape.

## 4. Mises en situation possibles

1. « Concevez en 5 minutes une application de télépaiement d'une taxe. » Acteurs (contribuable, agent, banque), étapes (identification, calcul, paiement, reçu), sécurité (authentification forte, HTTPS, journalisation), données (base relationnelle, transactions), disponibilité (pics en fin d'échéance), accessibilité (mobile, arabe et français).
2. « Le système tombe en panne le dernier jour des déclarations. » Rétablir le service (bascule, site de secours), informer les usagers, proposer à la hiérarchie de prolonger le délai, puis analyser la cause et corriger.
3. « Un collègue vous demande votre mot de passe pour aller plus vite. » Refuser poliment, expliquer la traçabilité, l'aider à demander ses propres droits.
4. « Comment repérer une fraude à la TVA avec les données ? » Croiser les factures déclarées par le vendeur et par l'acheteur, repérer les écarts et les comportements atypiques, prioriser les contrôles ; l'agent décide toujours.
5. Épreuve pratique : requête SQL (jointure, GROUP BY, HAVING), petit algorithme, critique d'un schéma. Lire l'énoncé à voix haute, expliquer avant d'écrire.
