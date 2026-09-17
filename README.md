# Préparation Intensive au Concours MEF — Ingénieurs d'État (1er Grade)

Ce dépôt contient le dossier complet de préparation intensive pour l'épreuve écrite du **Concours de Recrutement des Ingénieurs d'État de premier grade** organisé par le **Ministère de l'Économie et des Finances (Royaume du Maroc)**.

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
