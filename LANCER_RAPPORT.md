# Guide de Lancement Docker — Préparation Concours MEF (Ingénieur d'État 1er Grade)

Ce guide contient les commandes directes pour lancer la compilation continue (Watch) et le serveur Web de prévisualisation du PDF dans Docker.

---

## 🚀 Démarrage des Services (Mode Recommandé)

### 1. Lancer la Surveillance LaTeX (Watch) + le Serveur PDF en arrière-plan
Cette commande démarre la compilation automatique à chaque sauvegarde de fichier (`.tex`, `.bib`, `.cls`) et le serveur HTTP pour consulter le document :

```bash
docker compose -p concours_mef --profile dev --profile server up -d
```

---

## 🌐 Accès au Document PDF Généré

Une fois le serveur lancé, le PDF compilé en temps réel est accessible dans votre navigateur à l'adresse :

👉 **[http://localhost:8082/main.pdf](http://localhost:8082/main.pdf)**

---

## ⚙️ Lancement Séparé des Services (si besoin)

### Uniquement le Serveur Web PDF (Port 8082)
```bash
docker compose -p concours_mef --profile server up -d
```

### Uniquement la Surveillance LaTeX (Watch)
```bash
docker compose -p concours_mef --profile dev up -d
```

### Compilation unique (One-shot)
```bash
docker compose -p concours_mef run --rm latex-compiler /workspace/compile.sh
```

---

## 📋 Suivi des Logs en Temps Réel

### Suivre la compilation LaTeX (erreurs, avertissements, statut) :
```bash
docker logs -f mef-prep-latex-watch
```

### Suivre les requêtes du serveur PDF (Nginx) :
```bash
docker logs -f mef-prep-pdf-server
```

### Voir les 50 dernières lignes de log de compilation :
```bash
docker logs --tail 50 mef-prep-latex-watch
```

---

## 🛑 Arrêt des Services

Pour arrêter et nettoyer les conteneurs du projet :
```bash
docker compose -p concours_mef down
```
