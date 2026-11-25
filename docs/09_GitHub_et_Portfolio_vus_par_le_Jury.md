# Ton GitHub et ton portfolio, vus par le jury

Relevé du 9 novembre 2026 (un agent a lu avec `gh` les 21 dépôts publics du compte Abdellatif444, leurs README, et le portfolio gourri-abdellatif-portfolio.netlify.app ; rapport relu). Aucune modification n'a été faite sur GitHub. Le CV donne le lien GitHub : le jury peut tout voir.

## 1. Urgent avant le 12/11

1. **Les fiches de l'oral sont publiques.** Le dépôt `Preparation-Concours-Ingenieur-Etat-Maroc` est public, avec la branche `concours-mef-oral-2026` : analyse des faiblesses, pièges, numéro de candidat, réponses préparées. Les branches SRM et MAECAME montrent aussi tes autres concours. Solution la plus simple : **rendre le dépôt privé** jusqu'après les résultats (Settings du dépôt, Danger Zone, Change visibility). C'est ta décision ; rien n'a été changé.
2. **GESTINDEM** (`gestindem-chr-guelmim`) : le README dit « Projet réalisé … pour le CHR de Guelmim », et ton profil dit « engineered for the Regional Hospital Center ». Les ADR montrent que c'est une **réponse à l'avis d'achat 43/2026/CHRG** (démonstration sous 48 h, livraison en 5 jours), avec des maquettes et des moteurs de calcul faits, mais sans persistance ni client terminé, et rien n'indique que le marché a été attribué. L'ADR-001 cite aussi « [prénom retiré] » comme décideur. Le README cite un ADR-007 qui n'existe pas. À faire : corriger la première phrase du README (« Réponse à l'avis d'achat 43/2026/CHRG : maquettes et moteur de calcul ; persistance et client non terminés »), retirer la phrase du profil, ou rendre le dépôt privé.
3. **Données de tiers** : `WhatsAutoFX-WhatsApp-Automation-JavaFX/groupe_info.txt` contient de vrais numéros de téléphone. À retirer ou rendre le dépôt privé.

## 2. À corriger si tu as le temps

- Dépôt du portfolio : description « Élève Ingénieur EHTP », README « à la recherche d'un stage PFE », téléphone affiché, lien Replit. Le site, lui, est à jour.
- Portfolio en ligne : « 3 Stages » alors que 4 sont listés ; « 10+ Projets » ; deux adresses e-mail différentes ; superlatifs (« Excellence Technique », « Construisons Quelque Chose d'Incroyable »). Le site affiche aussi « diplômé juin 2026 », comme le CV (la délibération est du 06/07/2026).
- Dépôts sans lien avec le poste ou commerciaux (pins Etsy, médias Instagram ServiceNow, `agent-task-loop` avec un « paid pack », `moroccoai-concierge`) : les rendre privés, ou préparer une phrase simple pour en parler.
- Dépôts négligés : `IHSTE` (README vide, fichiers parasites, une archive zip) ; `fpgrowth` (auteurs « Student A / Student Y ») ; `KitCommun-Hospital` (README de « squelette pour étudiants », alors que le profil le présente comme complet).
- Emojis dans presque tous les README ; profil GitHub seulement en anglais avec « Actively looking for full-time… ».
- SiteSafe AI : aucun dépôt (ni public ni privé). Le profil dit « Architected and deployed » et donne un lien Google Drive vers une vidéo. Vérifier que la vidéo ne montre rien de confidentiel sur CID, et que « deployed » est exact.

## 3. Ce qui peut servir d'argument à l'oral

| Projet | Comment en parler (honnêtement) |
|---|---|
| GESTINDEM | « J'ai préparé une réponse à un avis d'achat d'un hôpital public : calcul des indemnités de garde et de déplacement, barèmes versionnés, plafonds, validation hiérarchique, motif obligatoire en cas de rejet, journal d'audit. J'ai fait les maquettes et les moteurs de calcul avec leurs tests ; la suite n'est pas terminée. » C'est très proche de la liquidation d'une dépense publique. Prépare la réponse sur « [prénom retiré] » : qui est-ce, quel rôle ? |
| KitCommun-Hospital | Données de santé sensibles, authentification centralisée, mots de passe hachés (BCrypt), piste d'audit infalsifiable : parler d'intégrité et de traçabilité. |
| pv-mpp-monitor | Tests, intégration continue, « quatre défauts trouvés et corrigés, chacun prouvé par un test » ; le README dit honnêtement que les données sont simulées. Bon exemple de qualité logicielle. |
| IHSTE, gestion de stock Jakarta EE | Traçabilité des mouvements, logique de gestion. |
| fpgrowth-recommender-system | Exploitation de données (règles d'association). |
| Guide de préparation (branche main) | Montre un travail sérieux sur la LOF, les directions du MEF, la GID, la DGSSI. |

## 4. Question probable

« J'ai vu sur votre GitHub des projets de boutique en ligne et de réseaux sociaux. Comment comptez-vous concilier cela avec la fonction publique ? » Réponse simple : ce sont des projets personnels d'apprentissage ; un fonctionnaire doit respecter les règles sur le cumul d'activités, et tu t'y conformeras. Ne le dis que si tu y es prêt.
