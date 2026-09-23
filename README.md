# Préparation Intensive — Concours d'Ingénieurs d'État (1er Grade), Royaume du Maroc

Ce dépôt contient des guides complets de préparation (LaTeX → PDF) aux concours de recrutement des **Ingénieurs d'État de premier grade** de la fonction publique marocaine, un concours par branche Git :

| Branche | Concours | Date de l'épreuve | État |
|---|---|---|---|
| `concours-mae-2026` | **Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l'Étranger (MAECAME)** — 16 postes (Réseaux et Télécommunications, Développement) | 27 septembre 2026 (FSJES Salé) | **Actif** |
| `concours-mef-2026` (tag `v1.0-mef-2026`) | **Ministère de l'Économie et des Finances (MEF)** — 103 postes | 20 septembre 2026 | Figé |

---

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

Les prompts de génération des illustrations se trouvent dans `visual_plan/flow_concours_mae.md` (22 fiches) et sont servis par l'outil local `tools/flow_image_hub/`. Les visuels du guide MEF sont archivés dans `visual_plan/archive_mef/` et `images/archive_mef/`.
