# Questions du jury et réponses modèles

Rédigé le 9 novembre 2026, à la demande de l'utilisateur : chaque question avec une réponse complète, naturelle et prête à dire. Toutes les réponses reposent sur des faits vérifiés (CV final, dossier du PFE, dépôts GitHub, sources officielles des fiches 03 et 04). Lis-les à voix haute, puis redis-les avec tes mots : le jury sent tout de suite un texte récité.

Deux réponses dépendent d'un fait que toi seul connais. Elles sont marquées **[à confirmer]**.

---

## Priorité 1 : les questions presque certaines

### 1. Présentez-vous.

« Je m'appelle Abdellatif Gourri, j'ai 22 ans et je suis originaire d'Aoulouz, dans la province de Taroudant. J'ai eu mon bac sciences mathématiques à Taroudant, puis j'ai fait deux ans de classes préparatoires à Agadir. Je suis entré à l'École Hassania des Travaux Publics, et j'en suis sorti en juillet 2026 ingénieur d'État en génie informatique, avec la mention Bien.

Pendant ma formation, j'ai fait quatre stages, à Meknès, Laâyoune, Agadir et Casablanca. À chaque fois, j'ai réalisé une application en partant des besoins des utilisateurs. Mon projet de fin d'études, chez CID Développement, portait sur la sécurité des chantiers. J'ai développé l'essentiel d'une plateforme où chaque détection d'un modèle d'intelligence artificielle est vérifiée par un responsable avant de devenir un incident, puis suivie jusqu'à sa clôture avec une preuve.

Ce que j'ai appris, c'est à construire des applications sûres et traçables. C'est exactement ce qu'on attend des systèmes d'un ministère qui gère l'argent public. C'est pour cela que je suis candidat aujourd'hui au poste d'ingénieur d'État des finances en génie logiciel. »

### 2. Pourquoi le ministère de l'Économie et des Finances ?

« Parce que c'est le ministère où le logiciel a le plus d'impact sur la vie des gens. Le MEF prépare le budget, collecte les impôts et les droits de douane, et paie les dépenses de l'État et des collectivités. Tout cela passe par de grands systèmes d'information : la gestion de la dépense et le portail des marchés publics à la Trésorerie générale, la télédéclaration SIMPL à la DGI, le dédouanement BADR à la douane.

Ces systèmes demandent de la sécurité, de la traçabilité et une grande fiabilité. C'est ce que j'ai travaillé dans mes projets. Et quand on améliore un de ces systèmes, ce sont des millions de citoyens et d'entreprises qui en profitent. Je veux mettre mes compétences là où elles servent le plus. »

### 3. Pourquoi la fonction publique et pas le privé ?

« D'abord parce que c'est l'État qui m'a formé, du lycée public jusqu'à l'EHTP. J'ai envie de rendre une partie de ce que j'ai reçu. Ensuite parce que je viens d'une petite commune, Aoulouz, et je sais ce que représente un service public qui fonctionne bien pour une famille. Enfin, l'administration est en pleine transformation numérique. C'est le bon moment pour un ingénieur logiciel d'y entrer et d'y construire une carrière dans la durée. »

### 4. Parlez-nous de votre projet de fin d'études.

« Mon PFE s'est déroulé chez CID Développement, à Casablanca, de février à juin 2026, en binôme. Il a été noté 15,50 sur 20.

Le problème de départ : sur un chantier, un ouvrier sans casque ou sans gilet est en danger, et un contrôleur ne peut pas tout voir. L'entreprise voulait une plateforme qui aide à repérer ces manquements.

Le travail était partagé. Ma binôme a préparé les données et entraîné les modèles de détection. Moi, j'ai analysé le processus d'inspection en huit phases que l'entreprise nous avait donné, et je l'ai traduit en spécifications, en diagrammes UML et en BPMN. Ensuite j'ai développé presque tout le back-end en microservices Spring Boot, le service Python qui fait tourner le modèle sur des vidéos de chantier enregistrées, et l'intégration avec l'interface React. Le tout tourne avec Docker Compose.

Le point central, c'est le circuit de validation. Une détection de l'IA ne devient jamais un incident toute seule : un responsable HSE la confirme ou la rejette. Si elle est confirmée, elle est affectée avec un délai, corrigée avec une photo comme preuve, puis clôturée ou renvoyée. »

### 5. Quel rapport entre votre PFE et le ministère des Finances ?

« Le domaine est différent, mais la logique est la même. Dans mon projet, on détecte une anomalie, on la vérifie, on la fait traiter et on garde la preuve de chaque étape. Dans les finances publiques, c'est la même chose : une dépense est engagée, vérifiée, validée, puis payée, et chaque étape laisse une trace. À la douane ou aux impôts, un outil peut signaler un dossier à risque, mais c'est l'agent qui décide. C'est ce principe que j'ai appliqué : l'outil propose, l'humain décide. »

### 6. Qu'est-ce que vous pouvez apporter à notre administration ?

« Je peux être utile tout de suite sur le développement : des API sécurisées, des bases de données, des interfaces web, le déploiement avec Docker. J'ai aussi l'habitude de commencer par écouter les utilisateurs. Dans mes stages, j'ai travaillé avec des médecins, des responsables RH et des responsables sécurité avant d'écrire la moindre ligne de code. Et j'ai appris à tester avant de livrer : dans GESTINDEM, mon projet de calcul des indemnités, chaque moteur de calcul a été écrit après ses cas de test. Pour des montants d'argent public, c'est indispensable. »

### 7. Quelles sont vos qualités ?

« Je dirais d'abord l'adaptation : j'ai fait quatre stages dans quatre villes et quatre métiers différents, et à chaque fois j'ai dû comprendre un domaine nouveau rapidement. Ensuite, l'esprit d'équipe : mon PFE était en binôme, avec des sprints Scrum, et j'ai été chef design du club social de l'EHTP. Enfin, le souci de la trace : je documente ce que je fais et je versionne tout mon code. »

### 8. Et vos défauts ?

« Le premier, c'est que les finances publiques sont un domaine nouveau pour moi. Je ne viens pas d'une école de gestion. Pour le combler, j'ai commencé par la loi organique des finances et la note de présentation du projet de loi de finances 2027, et je compte continuer avec la formation proposée aux nouveaux ingénieurs.

Le second, je l'ai découvert pendant mon PFE : nos tests étaient manuels, faits avec Postman. J'ai compris que ce n'était pas suffisant. Depuis, j'écris les tests avant le code dans mes projets, par exemple dans GESTINDEM, où chaque moteur de calcul a été écrit après ses cas de test. »

### 9. Où vous voyez-vous dans cinq ans ?

« Toujours au ministère, avec la confiance de mon équipe. J'aimerais d'ici là bien connaître les systèmes et les règles métier de ma direction, et avoir conduit au moins un projet du besoin jusqu'à la mise en production. Le statut des ingénieurs des finances prévoit une progression, du premier grade vers le grade principal puis ingénieur en chef. Je veux y avancer par le travail et par la formation. »

### 10. Pourquoi devrions-nous vous choisir ?

« Je ne vais pas dire que je suis meilleur que les autres candidats. Ce que je peux montrer, ce sont des applications réalisées pour de vrais utilisateurs et un projet de fin d'études validé par l'entreprise. Je sais aussi expliquer honnêtement ce qui a marché et ce qui manquait. Je relie la technique aux besoins du métier, et je veux m'engager dans la durée au service de l'administration. »

### 11. Présentez le ministère en une minute.

« Depuis octobre 2026, le ministère s'appelle ministère de l'Économie, des Finances et de la Performance publique. Le ministre est M. Fouzi Lekjaa.

Le ministère a trois grands rôles. D'abord, il prépare le budget de l'État : c'est la Direction du Budget. Ensuite, il trouve les ressources pour le financer : les impôts avec la DGI, les droits de douane et la TVA à l'importation avec l'ADII, et l'emprunt avec la Direction du Trésor et des Finances extérieures. Enfin, il exécute et contrôle la dépense : la Trésorerie générale du Royaume paie les dépenses de l'État et des collectivités, et l'Inspection générale des finances fait les audits. La DEPF, elle, fait les études et les prévisions économiques. »

### 12. Comment l'informatique peut-elle moderniser l'administration ?

« Pour moi, le numérique n'est pas un but en soi. Il sert à rendre un meilleur service aux citoyens et à mieux gérer l'argent public.

Il apporte d'abord de la simplicité : le contribuable déclare et paie en ligne avec SIMPL, l'entreprise répond aux marchés publics sur un portail unique. Moi-même, j'ai postulé à ce concours sur la plateforme e-recrutement du ministère. Il apporte ensuite de meilleures décisions : avec les données, on suit l'exécution du budget en temps réel et on cible mieux les contrôles. Enfin, il impose de la sécurité : ces systèmes contiennent des données sensibles, et la loi 05-20 fixe les règles de leur protection.

Mais il y a une condition : former les agents, et ne pas oublier les citoyens qui ne sont pas à l'aise avec Internet, comme beaucoup de personnes dans les communes rurales. »

---

## Priorité 2 : le ministère, les finances publiques, la technique

### 13. Comment le budget de l'État est-il préparé ?

« C'est la Direction du Budget qui pilote la préparation. Elle travaille avec chaque ministère sur ses besoins, dans le cadre d'une programmation sur trois ans. Le projet de loi de finances doit être déposé au Parlement au plus tard le 20 octobre : c'est l'article 48 de la loi organique. Cette année, le PLF 2027 a été adopté en Conseil de gouvernement le 20 octobre 2026. Ensuite, les deux chambres l'examinent et le votent, et la loi est publiée avant le 31 décembre. »

### 14. Comment une dépense publique est-elle exécutée ?

« Il y a deux acteurs bien séparés. L'ordonnateur, par exemple un ministre ou un directeur, engage la dépense, vérifie que le service a été fait et calcule le montant : c'est la liquidation. Puis il donne l'ordre de payer : c'est l'ordonnancement. Le comptable public, c'est-à-dire la Trésorerie générale du Royaume, contrôle la régularité de la dépense et paie. On sépare ces deux rôles pour qu'une même personne ne puisse pas à la fois décider et payer. »

### 15. Qu'est-ce que la LOF 130-13 ?

« C'est la loi organique relative à la loi de finances, adoptée en 2015 et appliquée progressivement jusqu'en 2020. On l'appelle souvent la constitution financière de l'État. Elle a apporté trois changements. Le premier, c'est la performance : chaque ministère a des programmes avec des objectifs et des indicateurs, on regarde les résultats et pas seulement l'argent dépensé. Le deuxième, c'est la programmation sur trois ans, qui donne de la visibilité. Le troisième, c'est la transparence : une comptabilité générale de l'État, des comptes certifiés par la Cour des comptes et plus d'informations pour le Parlement. Un projet de réforme de cette loi est en cours ; d'après la note du PLF 2027, son adoption est prévue en 2027. »

### 16. Que veut dire « Performance publique » dans le nouveau nom du ministère ?

« C'est l'idée qu'on juge l'action publique sur ses résultats, pas seulement sur les moyens dépensés. On la résume souvent par trois mots : l'économie, c'est dépenser moins pour le même moyen ; l'efficience, c'est obtenir le meilleur résultat pour chaque dirham ; l'efficacité, c'est atteindre l'objectif fixé. C'est la suite logique de la LOF 130-13. Pour un ingénieur, cela veut dire construire des outils qui mesurent ces résultats de façon fiable. »

### 17. Quelles sont les recettes et les dépenses de l'État ?

« Les recettes viennent surtout des impôts. Dans le PLF 2027, l'impôt sur les sociétés est prévu à 126 milliards de dirhams, l'impôt sur le revenu à 71,5 milliards, et la TVA à environ 137 milliards en comptant la TVA intérieure et la TVA à l'importation. S'y ajoutent les recettes non fiscales et l'emprunt.

Côté dépenses, les salaires représentent près de 196 milliards. L'investissement public global est prévu à 400 milliards de dirhams, en comptant l'État, les établissements publics et les collectivités. L'éducation reçoit environ 107 milliards et la santé environ 45 milliards. Le projet prévoit une croissance de 3,7 % et un déficit de 3 % du PIB. »

Si on te demande seulement trois chiffres : croissance 3,7 %, déficit 3 %, investissement public 400 milliards de dirhams.

### 18. Comment fonctionne la TVA ?

« La TVA est un impôt sur la consommation. L'entreprise ajoute la TVA sur ses ventes, déduit celle qu'elle a payée sur ses achats, et reverse la différence à l'État. Au final, c'est le consommateur qui la paie. Le taux normal est de 20 %. La TVA intérieure est gérée par la DGI, la TVA à l'importation par la douane. Et une part de la TVA, 32 % depuis la loi de finances 2025, va aux collectivités territoriales. C'est même leur première ressource. »

### 19. Quelle différence entre la TGR et la Direction du Trésor ?

« On les confond souvent, mais leurs rôles sont différents. La Trésorerie générale du Royaume, c'est le comptable public : elle paie les dépenses de l'État et des collectivités, contrôle leur régularité, recouvre certaines recettes et tient les comptes. La Direction du Trésor et des Finances extérieures, c'est le financier de l'État : elle gère la dette, émet les bons du Trésor et négocie avec les bailleurs comme la Banque mondiale. »

### 20. Donnez des exemples de digitalisation au MEF.

« À la TGR, il y a la gestion intégrée de la dépense, dématérialisée depuis 2021, et le portail des marchés publics. À la DGI, il y a SIMPL pour déclarer et payer les impôts en ligne. À la douane, il y a BADR pour le dédouanement, avec une analyse de risque pour cibler les contrôles. Et pour les candidats, il y a la plateforme e-recrutement, que j'ai utilisée moi-même. »

### 21. Comment l'État protège-t-il ses systèmes d'information ?

« Le cadre, c'est la loi 05-20 sur la cybersécurité, de 2020, et son décret d'application de 2021. L'autorité nationale est la DGSSI, rattachée à l'Administration de la Défense nationale. Chaque administration doit classer ses systèmes et ses données selon leur sensibilité, déclarer ses systèmes sensibles et nommer un responsable de la sécurité. Les infrastructures d'importance vitale ont des obligations renforcées : audits, déclaration des incidents, et certaines données hébergées au Maroc. Pour les données personnelles, c'est la loi 09-08, contrôlée par la CNDP.

Un exemple concret : la fuite de données de la CNSS en avril 2025 a montré à quel point ces données doivent être protégées dès la conception. »

### 22. Quels sont les grands enjeux économiques du Maroc ?

« J'en vois trois. Le premier, c'est l'emploi des jeunes : selon le HCP, le chômage était de 10,5 % au troisième trimestre 2026, mais il dépasse 30 % chez les 15-24 ans. Le deuxième, c'est l'eau, avec les sécheresses répétées : l'État investit dans les barrages et le dessalement. Le troisième, ce sont des finances publiques solides : le déficit est passé de 3,5 % du PIB en 2025 à un objectif de 3 %, et la dette tourne autour de 67 % du PIB. Il faut aussi citer la protection sociale, la Coupe du monde 2030 et la régionalisation. »

### 23. Que connaissez-vous d'Aoulouz ?

« Aoulouz est une commune urbaine de la province de Taroudant, dans la région Souss-Massa. Elle comptait environ 21 500 habitants au recensement de 2024. Elle vit surtout de l'agriculture irriguée, notamment des agrumes.

Elle est connue pour son barrage, mis en service en 1991, qui sert à l'irrigation, à l'eau potable de Taroudant et à la recharge de la nappe du Souss. En amont, le barrage Mokhtar Soussi est en train d'être agrandi. Le grand enjeu, c'est l'eau : en 2024, avec la sécheresse, des vergers d'agrumes entiers ont été arrachés dans le bassin de Taroudant. L'autre enjeu, c'est l'emploi des jeunes. »

### 24. Que fait le ministère des Finances pour votre commune ?

« Le ministère ne construit pas lui-même les barrages ni les routes, ce sont d'autres ministères. Mais il intervient à trois niveaux. D'abord, il prépare la loi de finances qui donne les crédits pour ces projets. Ensuite, une part de la TVA, 32 %, est transférée aux collectivités, dont les communes. Enfin, la Trésorerie générale tient les comptes des collectivités, contrôle leurs dépenses et les paie. Depuis 2025, la DGI gère aussi plusieurs taxes locales. L'Intérieur, lui, exerce la tutelle des collectivités. »

### 25. Comment sont financées les collectivités territoriales ?

« Leur première ressource est la part de TVA, 32 % depuis 2025, qui représentait plus de 40 % de leurs recettes à la mi-2026 selon la TGR. Les régions reçoivent aussi 5 % de l'impôt sur les sociétés et 5 % de l'impôt sur le revenu, et l'État leur verse au moins 12 milliards de dirhams par an à partir de 2027. Il y a enfin les impôts locaux et des fonds de l'État, comme le fonds pour le développement territorial intégré. »

### 26. Quel projet proposeriez-vous pour votre région ?

« Je proposerais un service simple pour payer les taxes locales en ligne et par téléphone, avec un guichet d'aide pour ceux qui ne sont pas connectés. Je proposerais aussi un tableau de bord public sur l'exécution des budgets des communes, à partir des données de la TGR. Ce serait plus transparent pour les citoyens, et plus facile à suivre pour les élus. »

### 27. Comment avez-vous sécurisé les API de votre PFE ?

« Avec Spring Security et des jetons JWT, quatre rôles et des règles d'accès par rôle. Le jeton de rafraîchissement était dans un cookie HttpOnly, et le jeton était aussi vérifié à l'ouverture du WebSocket. Mais je dois être honnête : il y avait des faiblesses. Le jeton d'accès était stocké dans le localStorage du navigateur, le service d'IA n'avait pas d'authentification, et les images étaient lisibles publiquement. Pour un système de l'État, ce sont les trois premières choses que je corrigerais. »

### 28. Pourquoi des microservices et pourquoi Kafka ?

« Les microservices nous permettaient de séparer la partie métier en Java de la partie IA en Python, et de faire évoluer chacune de son côté. Le prix à payer, c'est plus de complexité. Pour une petite application, un monolithe bien organisé suffit.

Kafka servait à ne perdre aucune alerte : si le service métier tombe, les messages restent en attente et sont traités à son retour. RabbitMQ aurait pu suffire à notre échelle, et c'était d'ailleurs la recommandation de départ. »

### 29. Parlez-nous de GESTINDEM.

« C'est une application que je développe à partir du cahier des charges d'un avis d'achat du CHR de Guelmim. Elle calcule les indemnités de garde, d'astreinte, de permanence et de déplacement du personnel de l'hôpital. J'ai d'abord dessiné tous les écrans, puis j'ai écrit en C# et .NET les moteurs de calcul et le circuit de validation, en commençant chaque fois par les cas de test. Pour moi, c'est très proche du travail du ministère : appliquer des barèmes, respecter des plafonds, valider par étapes et garder la trace de chaque annulation. La base de données et l'interface ne sont pas encore terminées. »

Relances possibles :
- « Avez-vous déposé une offre ? » **[à confirmer]** Dis simplement oui ou non, sans détour.
- « Qui est [prénom retiré], cité dans un document ? » **[à confirmer]** Si c'est une erreur dans un document de conception, dis-le simplement : « C'est une erreur dans ce document. J'ai écrit seul tout le code, les 30 commits du dépôt sont à mon nom. »

### 30. Vous écrivez « Claude Code » sur votre CV. Vous codez avec l'IA ?

« Oui, et je préfère le dire clairement. Je l'utilise pour aller plus vite sur le travail répétitif : lire du code, proposer des tests, rédiger une première version. Mais je relis, je teste et j'assume chaque ligne que je livre. Dans l'administration, je suivrais bien sûr les règles du ministère sur ces outils, en particulier pour ne jamais exposer de données sensibles. »

### 31. Une application de télépaiement d'une taxe : comment la concevez-vous ?

« Je commencerais par les acteurs : le contribuable, l'agent et la banque. Puis le parcours : s'identifier, voir le montant, payer, recevoir un reçu. Pour la sécurité, il faut une authentification forte, une connexion chiffrée et une trace de chaque opération. Pour les données, une base relationnelle avec des transactions : un paiement est fait en entier ou pas du tout. Il faut aussi prévoir les pics de connexion en fin d'échéance, et une interface en arabe et en français, utilisable sur téléphone. »

### 32. Le système tombe en panne le dernier jour des déclarations. Que faites-vous ?

« D'abord, rétablir le service le plus vite possible, en basculant sur le site de secours s'il existe. En même temps, informer les usagers clairement. Ensuite, proposer à ma hiérarchie de prolonger le délai, puisque ce n'est pas la faute des contribuables. Une fois le service rétabli, chercher la cause et corriger pour que cela ne se reproduise pas. »

### 33. Comment repérer une fraude à la TVA avec les données ?

« On peut croiser les factures déclarées par le vendeur et celles déclarées par l'acheteur, et repérer les écarts. On peut aussi détecter les comportements inhabituels, par exemple une entreprise qui demande beaucoup de remboursements d'un coup. Ces outils servent à choisir les dossiers à contrôler en priorité. La décision finale reste toujours celle de l'agent. Et attention aux chiffres trompeurs : si la fraude est rare, un modèle qui répond toujours "pas de fraude" a l'air juste à 99 %, mais il ne sert à rien. Il faut regarder la précision et le rappel. »

### 34. Comment reprendre un vieux système sans tout casser ?

« D'abord, comprendre l'existant avant de toucher quoi que ce soit : lire le code, parler aux utilisateurs, noter ce qui marche et ce qui ne marche pas. Ensuite, écrire des tests qui fixent le comportement actuel, pour être sûr de ne rien casser. Puis changer par petites étapes, une partie à la fois, en gardant le service en marche, et prévoir un retour en arrière à chaque étape. Pour un système de l'État, on ne coupe jamais tout d'un coup. »

(11/11/2026 : l'exemple du projet photovoltaïque a été retiré, comme du CV, à la demande de l'utilisateur.)

---

## Priorité 3 : les pièges

### 35. Un ingénieur gagne plus dans le privé. Pourquoi resteriez-vous ?

« Le salaire compte, je ne vais pas dire le contraire. Mais je cherche surtout du sens et de la stabilité pour construire une carrière. Ici, une application bien faite sert des millions de personnes. Et le statut des ingénieurs des finances offre une vraie progression. »

### 36. Avez-vous passé d'autres concours ? Et si vous êtes admis ailleurs ?

« Oui, comme beaucoup de jeunes diplômés, j'ai passé d'autres concours. Mais le MEF est mon premier choix, pour les raisons que je vous ai données : l'impact des systèmes et le lien avec l'argent public. » Ne dis que le MEF est ton premier choix que si c'est vrai.

### 37. Vous avez 22 ans. Comment allez-vous travailler avec des collègues plus expérimentés ?

« J'ai encore beaucoup à apprendre, j'en suis conscient. Dans mes stages, j'ai travaillé avec des médecins, des responsables sécurité et des chefs de projet plus âgés que moi. J'ai appris à écouter d'abord et à proposer ensuite. Je compte faire la même chose ici. »

### 38. Votre chef vous demande de faire quelque chose d'irrégulier.

« Je lui expliquerais avec respect pourquoi cela me pose problème, en rappelant la règle. S'il maintient sa demande, je demanderais une instruction écrite et j'en parlerais à ma hiérarchie. Je ne ferais pas quelque chose d'irrégulier, même sous pression. »

### 39. Un collègue vous demande votre mot de passe pour aller plus vite.

« Je refuserais poliment. Chaque action dans le système est enregistrée à mon nom : si je donne mon mot de passe, je ne peux plus répondre de ce qui est fait. Je l'aiderais plutôt à demander ses propres accès. »

### 40. Vous découvrez qu'un collègue a partagé des données de contribuables.

« C'est grave. Ces données sont protégées par le secret professionnel et par la loi 09-08. J'en parlerais à mon responsable pour qu'on limite rapidement les dégâts. Je ne garderais pas cela pour moi. »

### 41. Que pensez-vous de la politique du gouvernement ?

« En tant que futur fonctionnaire, mon rôle est d'appliquer les politiques publiques avec neutralité. Je peux en revanche vous parler des objectifs affichés, par exemple ceux du projet de loi de finances 2027 : croissance, emploi, investissement. »

### 42. L'intelligence artificielle va-t-elle remplacer les agents ?

« Je ne crois pas. Elle peut trier, prévoir et signaler des risques, mais la décision et la responsabilité restent humaines. C'est d'ailleurs ce que j'ai appliqué dans mon PFE : l'IA propose, un responsable valide. Pour bien l'utiliser, il faut former les agents et protéger les données. »

### 43. Citez une faiblesse de notre système fiscal.

« Le poids de l'économie informelle : une partie de l'activité échappe à l'impôt, et la charge repose sur un nombre limité d'entreprises. La réforme fiscale, avec la loi-cadre 69-19, cherche justement à élargir la base. Le numérique peut aider, par exemple avec la facturation électronique et le croisement des données. »

### 44. Vous ne connaissez pas la réponse.

« Je ne connais pas ce point avec précision, et je préfère ne pas vous donner un chiffre faux. Ce que je sais, c'est que… » Puis tu dis ce que tu sais, même si c'est peu. N'invente jamais un chiffre.

### 45. Avez-vous des questions pour nous ?

Ne réponds jamais « non ». Choisis une de ces deux questions :
« Dans quelles directions les nouveaux ingénieurs en génie logiciel sont-ils le plus attendus cette année ? »
« Comment se passent l'accueil et la formation des nouveaux ingénieurs au ministère ? »

---

Version arabe de la présentation : fiche 08, section 1.
