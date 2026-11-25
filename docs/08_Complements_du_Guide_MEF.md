# Compléments tirés du guide MEF de septembre, et ce qui a changé depuis

Rédigé le 9 novembre 2026. Le guide `Preparation_Concours_MEF_Ingenieur_Etat.pdf` (identique à `main.pdf`, compilé depuis les chapitres de la branche `concours-mef-2026`, commit 709b471) a été relu en entier ce jour, ainsi que le chapitre d'oral du guide SRM et la section orale du guide MAECAME. Cette fiche reprend ce qui sert à l'oral et manquait dans les fiches 00 à 07. Les numéros de ligne renvoient aux fichiers `chapters/*.tex`.

## 1. Méthode d'entretien

**La méthode STAR** (guide MEF, 1_methodologie l.155 ; guide SRM l.57-63). Pour toute question sur une expérience :
- **S**ituation : où, quand, quel contexte.
- **T**âche : ce qu'on t'a demandé.
- **A**ction : ce que **tu** as fait. Dire « j'ai », pas « nous avons ».
- **R**ésultat : ce qui a changé, un chiffre si tu l'as.

Exemple sur le PFE : « Chez CID Développement (S), je devais concevoir la plateforme de supervision HSE (T). J'ai [ta partie exacte] (A). Résultat : [ce qui marche, ce qui a été validé] (R). »

**Les questions à poser au jury en fin d'entretien** (guide SRM l.52 et l.141) : ne jamais répondre « non, merci ». En préparer deux :
- « Dans quelle direction les nouveaux ingénieurs en génie logiciel sont-ils le plus attendus cette année ? »
- « Comment se passe l'intégration et la formation des nouveaux ingénieurs au ministère ? »

**Le pitch en arabe** (guide MAECAME l.136). Une version simple, tirée du CV, à relire et à dire avec tes mots :

> السلام عليكم. اسمي عبد اللطيف كوري، عمري 22 سنة، من مدينة أولوز بإقليم تارودانت. حصلت على باكالوريا العلوم الرياضية بثانوية ابن سليمان الروداني بتارودانت، ثم درست في الأقسام التحضيرية بأكادير، وتخرجت سنة 2026 مهندس دولة في هندسة الإعلاميات من المدرسة الحسنية للأشغال العمومية بميزة حسن. أنجزت أربعة تداريب في مدن مختلفة، طورت خلالها تطبيقات كاملة، آخرها مشروع نهاية الدراسة: منصة ذكية لرصد احترام معدات السلامة في الأوراش بالاعتماد على الرؤية الحاسوبية. تعلمت من هذه التجارب تصميم تطبيقات آمنة وموثوقة وقابلة للتتبع، وهي الصفات المطلوبة في أنظمة وزارة تدبر المال العام. لذلك أترشح اليوم لمنصب مهندس دولة للمالية في تخصص هندسة البرمجيات والتطوير.

## 2. Mises en situation du « pilier 10 » (1_methodologie l.190-191)

| Question | Structure de réponse |
|---|---|
| « Accepteriez-vous d'être affecté hors de Rabat ? » | Oui, sans hésiter : j'ai déjà travaillé à Meknès, Laâyoune, Agadir et Casablanca. Ne le dire que si c'est vrai. |
| « Quelle direction souhaitez-vous ? » | Une préférence avec une raison, puis l'ouverture : « La TGR m'intéresse parce que ses systèmes (dépense, marchés publics) touchent toute l'administration ; mais j'irai là où le ministère a besoin de moi. » Choisis la direction que tu préfères vraiment. |
| « Deux chefs vous donnent deux urgences contradictoires. » | Ne pas choisir seul : exposer les deux demandes à son responsable, proposer un ordre selon l'impact, informer l'autre personne. |
| « Que pensez-vous de publier sur votre travail sur les réseaux sociaux ? » | Devoir de réserve et secret professionnel : rien sur les dossiers, les données ou les débats internes. Prudence sur les publications personnelles. |

## 3. Finances publiques : notions qui manquaient

- **La performance publique et les « 3E »** (2_annales l.684-689) : économie (dépenser moins pour le même moyen), efficience (le meilleur résultat pour chaque dirham), efficacité (atteindre l'objectif fixé). C'est la meilleure explication du nouveau nom du ministère.
- **La composition de la loi de finances** : le budget général ; les services de l'État gérés de manière autonome (SEGMA), par exemple certains centres hospitaliers ; les comptes spéciaux du Trésor (CST), dont les comptes d'affectation spéciale, qui relient une recette à une dépense précise.
- **La règle d'or** : le produit des emprunts finance seulement l'investissement et le remboursement du principal de la dette, pas le fonctionnement (LOF 130-13, article 20 selon le guide, QCM l.52-57).
- **La hiérarchie des normes** : Constitution, lois organiques (comme la LOF 130-13), lois, décrets, arrêtés.
- **Les régulateurs financiers** : Bank Al-Maghrib (monnaie, banques), AMMC (marché des capitaux), ACAPS (assurances et prévoyance sociale).
- **Un SI au service d'une politique publique** : le Registre national de la population (RNP) et le Registre social unifié (RSU), créés par la loi 72-18, servent à cibler l'aide sociale directe et l'AMO. Limites à citer : qualité des données déclarées, risque d'exclusion, protection des données (CNDP).

## 4. Numérique et cybersécurité : compléments

- **Loi 55-19** sur la simplification des procédures administratives : l'usager n'a pas à fournir un document que l'administration possède déjà.
- **Loi 43-20** sur les services de confiance (signature et cachet électroniques) : base juridique de la signature électronique, utile pour la dématérialisation.
- **Loi 07-03** : sanctionne les atteintes aux systèmes de traitement automatisé des données (Code pénal).
- **DNSSI** : la directive nationale de la sécurité des systèmes d'information, publiée par la DGSSI, fixe les règles minimales.
- **Normes** : ISO/IEC 27001 (système de management de la sécurité de l'information, SMSI) ; EBIOS (méthode d'analyse de risque).
- **Continuité** : RTO (durée maximale d'interruption acceptable) et RPO (perte de données maximale acceptable) ; sauvegardes selon la règle 3-2-1 (trois copies, deux supports, une hors site).
- **Un exemple réel** : la fuite de données de la CNSS en avril 2025 (examen blanc l.247) montre pourquoi les données des citoyens doivent être protégées par conception.
- **Stratégie nationale de cybersécurité 2030** (citée dans le guide MAECAME, 4_fiches l.184) : **à vérifier** avant de la citer.

## 5. Génie logiciel : bases à revoir (3_banque_questions_qcm l.253-282 et l.377-406)

- **POO** : encapsulation, héritage, polymorphisme, abstraction ; surcharge (même nom, paramètres différents) et redéfinition (la classe fille réécrit la méthode) ; interface (contrat sans code) et classe abstraite (peut contenir du code).
- **Complexité** : recherche dichotomique O(log n), tri fusion O(n log n), recherche linéaire O(n).
- **Cycle en V et agile** : dans l'administration, le marché public et le cahier des prescriptions spéciales (CPS) poussent souvent vers un cycle en V ; on peut découper le projet en lots pour garder des livraisons fréquentes.
- **Théorème CAP** : un système distribué ne peut garantir à la fois cohérence, disponibilité et tolérance au partitionnement. Pour un paiement, on privilégie la cohérence.
- **Kubernetes** : orchestre des conteneurs (déploiement, montée en charge, redémarrage automatique).
- **Gouvernance des SI publics** :
  - MOA (le métier qui exprime le besoin) et MOE (l'équipe qui réalise) ;
  - TCO, le coût total sur toute la durée de vie : un critère clé pour l'argent public ;
  - SLA (niveau de service promis), ITIL (gestion des services), COBIT (gouvernance), TOGAF (architecture), schéma directeur, matrice RACI (qui réalise, qui décide, qui est consulté, qui est informé).
- **Mesurer un modèle d'IA** : précision, rappel, F1, matrice de confusion. Quand la fraude est rare, l'exactitude trompe : un modèle qui dit toujours « pas de fraude » a 99 % d'exactitude et ne sert à rien. Prépare la même réponse pour YOLO/RT-DETR dans ton PFE.
- **L'IA au MEF, usages et limites** : analyse de risque (DGI, ADII), prévisions (DEPF), détection d'anomalies dans la dépense (doublons, fractionnement des marchés). Risques : biais, manque d'explication des décisions, dépendance à un fournisseur. L'agent garde la décision.
- **Deux questions du guide SRM à transposer** : « Comment intégrer un système ancien ? » (cartographier, migrer par étapes, garder le service en marche) ; « Comment garantir la qualité d'une application critique ? » (tests, déploiement progressif, plan de retour en arrière).

## 6. Ce qui a changé depuis le guide de septembre

| Sujet | Guide (septembre 2026) | À dire maintenant | Source |
|---|---|---|---|
| Ministre | Mme Nadia Fettah ; M. Lekjaa ministre délégué au Budget | M. Fouzi Lekjaa, ministre de l'Économie, des Finances et de la Performance publique | Presse, 16-17/10/2026 (fiche 03) |
| Ministre délégué au Budget | M. Lekjaa | Ne nommer personne : non confirmé | |
| Croissance 2026 | 5,3 % | 4,7 % (Note PLF 2027) ; 3,7 % prévus en 2027 | finances.gov.ma |
| Inflation | ≈ 1,5 % prévus en 2026 | 0,8 % en 2025 ; 0,5 % sur un an en septembre 2026 | HCP |
| Chômage | ≈ 13 % | 10,5 % au T3 2026, nouvelle méthode du HCP | HCP via FNH |
| Taux directeur | 2,75 % dans le tableau des chiffres de l'oral | 2,25 %, maintenu le 22/09/2026 | BAM |
| Budget | LF 2026 : investissement 380 MMDH, éducation 97,1, santé 42,4 | PLF 2027 (projet) : 400, 106,9 et 45,4 MMDH | Note PLF 2027 |
| Statut du corps | Décret 2-05-1367 (introduction) | Décret 2-23-698 du 16/07/2024 | adala.justice.gov.ma |
| Directeur du Trésor | « avril 2026 » | Installé le 12/05/2026 | finances.gov.ma |
| IR | Taux marginal 37 % depuis la LF 2025 | 37 % aujourd'hui ; le PLF 2027 propose une baisse progressive jusqu'en 2031 (trois tranches, taux marginal 30 %) | Note PLF 2027 |
| Faiblesse | « Perfectionnisme cadré par l'agile » | Une vraie faiblesse avec un plan de progrès (fiche 02) | |

## 7. À ne pas répéter à l'oral (non sourcé ou douteux dans le guide)

- Le sigle « GIR » : aucune source trouvée.
- « Quatre grands pôles opérationnels » du MEF : absents de l'organigramme officiel.
- « BADR fait la sélectivité automatique par l'IA », « la DGI fait du data mining » : dire seulement « analyse de risque » ou « ciblage ».
- Les chiffres du numérique sans source (« 2e hub d'outsourcing d'Afrique », « 130 000 emplois », « 100 000 talents par an »).
- Le projet de loi-cadre sur l'IA « Digital X.0 » : non confirmé. Citer plutôt « AI Made in Morocco 2030 », mentionné dans la Note PLF 2027.
- La date « 15 mars » du calendrier budgétaire : la LOF ne la fixe pas. La date « 15 juillet » est fausse : l'article 47 dit **avant le 31 juillet** (vérifié le 11/11/2026). Dates sûres : 31 juillet (article 47) et 20 octobre (article 48).

**Le guide PDF a été corrigé le 11/11/2026** : tous les points du tableau 6 et de cette liste y sont repris (voir `docs/JOURNAL.md`).
- La grille de notation chiffrée et « l'expérience des lauréats démontre » : aucune source.
