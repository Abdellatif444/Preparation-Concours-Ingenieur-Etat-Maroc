# Préparation Intensive — Concours d'Ingénieurs d'État (1er Grade), Royaume du Maroc

Ce dépôt contient des guides complets de préparation (LaTeX → PDF) aux concours de recrutement des **Ingénieurs d'État de premier grade** de la fonction publique marocaine, un concours par branche Git :

| Branche | Concours | Date de l'épreuve | État |
|---|---|---|---|
| `concours-srm-soussmassa-2026` | **Société Régionale Multiservices Souss-Massa (SRM)** — Cadres Techniques Bac+5 / Ingénieur d'État, spécialité Génie Informatique — 38 postes (sur 174 au total) | 4 octobre 2026 (Faculté des Sciences d'Agadir) | **Actif** |
| `concours-mae-2026` | **Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l'Étranger (MAECAME)** — 16 postes (Réseaux et Télécommunications, Développement) | 27 septembre 2026 (FSJES Salé) | Figé |
| `concours-mef-2026` (tag `v1.0-mef-2026`) | **Ministère de l'Économie et des Finances (MEF)** — 103 postes | 20 septembre 2026 | Figé |

---

## 🎯 Contenu du guide SRM Souss-Massa (branche `concours-srm-soussmassa-2026`)

1. **Cadrage officiel** : épreuve écrite unique de 1 h 30 sous forme de QCM (spécialité Génie Informatique + culture générale/entreprise), informations de convocation vérifiées (n° d'examen GI_DC_R_119, Faculté des Sciences d'Agadir, Amphi 6).
2. **L'entreprise** : cadre légal (loi 83-21, dahir 1-23-53), création de la SRM (15 octobre 2024, succession de la RAMSA), périmètre géographique, gouvernance, actionnariat, budget, stress hydrique et grands projets de dessalement.
3. **Banque de QCM Génie Informatique** : algorithmique, POO, bases de données/SQL, réseaux, cybersécurité, plus les notions propres au secteur eau/électricité (SIG, télérelève, SCADA).
4. **Fiches de culture générale et entreprise** : droit des SRM, secteur eau-électricité au Maroc, chiffres et dates clés, actualité récente, pièges fréquents.
5. **Planning J-6** (28 septembre → 4 octobre) et **examen blanc chronométré** de 50 questions avec corrigé détaillé.

## 🎯 Contenu du guide MAECAME (branche `concours-mae-2026`)

1. **Cadrage officiel** : les trois épreuves (spécialité informatique et réseaux 3 h coef. 4 ; rédaction sur les attributions du ministère 2 h coef. 2 ; oral coef. 6), informations pratiques vérifiées.
2. **Méthodologie** : dissertation administrative en 2 heures, ton diplomatique, stratégie documentaire, feuille de route de l'oral en 11 piliers.
3. **Six sujets probables de rédaction** avec copies modèles (Sahara marocain, ancrage africain, Marocains du monde, diplomatie économique, numérique consulaire, multilatéralisme).
4. **Banque de questions** ministère et diplomatie + **préparation de l'épreuve de spécialité** (réseaux et télécoms approfondis, développement, bases de données, cybersécurité, exercices rédigés corrigés).
5. **Fiches mémotechniques** : organisation du ministère (décret 2.24.957), constantes de la politique étrangère, chronologie du Sahara (résolution 2797), Afrique, MRE, partenariats, numérique, dates et chiffres.
6. **Planning J-4** et **examen blanc complet** avec corrigés.

---

## 🚀 Démarrage Rapide avec Docker

```bash
docker compose -p concours_mef --profile dev --profile server up -d
```

PDF généré : 👉 **[http://localhost:8082/main.pdf](http://localhost:8082/main.pdf)**

Compilation ponctuelle (Git Bash sous Windows) :

```bash
MSYS_NO_PATHCONV=1 docker compose -p concours_mef run --rm latex-compiler bash /workspace/compile.sh
```

Arrêt :
```bash
docker compose -p concours_mef down
```

---

## 🖼️ Visuels

Les prompts de génération des illustrations de la branche active se trouvent dans `visual_plan/flow_concours_srm.md` (14 fiches) et sont servis par l'outil local `tools/flow_image_hub/`. Les visuels et plans visuels des guides MEF et MAECAME ne sont plus conservés dans les répertoires de travail (pour économiser l'espace disque local) mais restent entièrement récupérables depuis l'historique Git déjà poussé sur ce dépôt (branches `concours-mef-2026` et `concours-mae-2026`, ou `git log` sur `concours-srm-soussmassa-2026` avant le commit « chore: clear archived MEF/MAE images from local working tree »).
