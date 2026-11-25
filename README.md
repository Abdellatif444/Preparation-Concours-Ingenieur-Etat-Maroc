# Préparation Intensive au Concours MEF — Ingénieurs d'État (1er Grade)

Ce dépôt contient le dossier complet de préparation intensive pour l'épreuve écrite du **Concours de Recrutement des Ingénieurs d'État de premier grade** organisé par le **Ministère de l'Économie et des Finances (Royaume du Maroc)**.

## Les branches du dépôt (mise à jour du 25/11/2026)

| Branche | Contenu |
|---|---|
| `main` | Guide de l'écrit du concours MEF (ce document) |
| `concours-mef-2026` | Guide MEF 2026, version de l'écrit du 20/09/2026 (tag `v1.0-mef-2026`) |
| `concours-mae-2026` | Guide MAECAME 2026 (Affaires étrangères), mis à jour le 19/11/2026 pour l'oral |
| `concours-srm-soussmassa-2026` | Guide SRM Souss-Massa 2026, mis à jour le 19/11/2026, avec un chapitre sur la SRM Marrakech-Safi |
| `oraux-ingenieur-etat-2026` | Préparation des oraux d'ingénieur d'État de novembre 2026 (MEF, MAEC, SRM Marrakech-Safi) : fiches, questions-réponses modèles, simulations, sans données personnelles |

---

## 🎯 Objectifs du Dossier

1. **Cartographie et Annales Réelles** : Sujets réels tombés (sessions 2024, 2023, 2022, 2021) et sujets à très haute probabilité.
2. **Méthodologie de la Dissertation** : Problématiques, plans détaillés en deux parties, arguments chiffrés et exemples marocains.
3. **Banque de Questions / Réponses (QCM & Questions ouvertes)** : Questions classées par priorité (🔴 Très important, 🟠 Important, 🟡 À connaître, ⚪ Secondaire) avec réponses courtes, claires et sourcées.
4. **Fiches Thématiques Synthétiques** :
   - Économie & Politiques Macroéconomiques
   - Finances Publiques & Loi Organique n° 130-13 (LOF)
   - Organisation et Directions du MEF (DGI, TGR, Douanes, Direction du Budget, DTFE, DEPP, DEPF)
   - Stratégie Nationale « Maroc Digital 2030 » & Souveraineté Numérique
   - Transition Énergétique & Développement Durable
   - Réforme de la Protection Sociale (AMO, RSU, Aide Sociale Directe)
   - Systèmes d'Information Financiers de l'État & Cybersécurité (DGSSI, GID, GIR, BADR)

---

## 🚀 Démarrage Rapide avec Docker

Pour lancer la compilation automatique (Watch) et le serveur web de prévisualisation :

```bash
docker compose -p concours_mef --profile dev --profile server up -d
```

Accéder au PDF généré :
👉 **[http://localhost:8082/main.pdf](http://localhost:8082/main.pdf)**

Pour arrêter les conteneurs :
```bash
docker compose -p concours_mef down
```
