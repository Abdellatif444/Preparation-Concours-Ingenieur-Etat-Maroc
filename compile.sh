#!/bin/bash

# Script de compilation LaTeX avec gestion d'erreurs
set -e

# Mode rapide (watch): conserve les fichiers auxiliaires pour des recompilations beaucoup plus rapides
FAST_MODE=0
CLEAN_ON_SUCCESS=1
LATEXMK_QUIET=""

if [ "${FAST:-0}" = "1" ] || [ "${1:-}" = "fast" ]; then
    FAST_MODE=1
    CLEAN_ON_SUCCESS=0
    LATEXMK_QUIET="-silent"
    echo "[FAST] Mode rapide activé: aucun nettoyage, compilation incrémentale."
fi

echo "=== Compilation du rapport LaTeX ==="
echo "Fichier principal: main.tex"
echo "Répertoire de travail: $(pwd)"
echo

# Fonctions de nettoyage
cleanup_success() {
    echo "Nettoyage des fichiers temporaires (succès)..."
    # Conserver erreur.log seulement
    rm -f main.log *.aux *.out *.toc *.lof *.lot *.bbl *.blg *.idx *.ind *.ilg *.fls *.fdb_latexmk *.synctex.gz
}

cleanup_failure() {
    echo "Nettoyage minimal (échec) : conservation de main.log et erreur.log"
    # Ne pas supprimer main.log ni erreur.log pour diagnostic
    rm -f *.aux *.out *.toc *.lof *.lot *.bbl *.blg *.idx *.ind *.ilg *.fls *.fdb_latexmk *.synctex.gz || true
}

# Génère erreur.log avec uniquement les erreurs détectées
generate_error_log() {
    local SRC_LOG="main.log"
    local ERR_LOG="erreur.log"
    : > "$ERR_LOG" # overwrite
    if [ -f "$SRC_LOG" ]; then
        # Extraire les erreurs LaTeX/Biber les plus utiles
        grep -En "^(\\!|LaTeX Error:|Package .* Error:|^l\\\.|Undefined control sequence|Missing number|Illegal unit|Fatal error occurred|Emergency stop|TeX capacity exceeded|Runaway argument|No file .*\\.bbl\\.|^ERROR - )" "$SRC_LOG" >> "$ERR_LOG" || true
    fi
}

# Vérifier que le fichier main.tex existe
if [ ! -f "main.tex" ]; then
    echo "ERREUR: Le fichier main.tex n'existe pas dans le répertoire courant."
    exit 1
fi

LATEXMK_CMD="latexmk -xelatex -interaction=nonstopmode -halt-on-error -file-line-error -synctex=1 $LATEXMK_QUIET main.tex"

if command -v latexmk >/dev/null 2>&1; then
    echo "Compilation avec latexmk (biber activé si nécessaire)..."
    if ! bash -lc "$LATEXMK_CMD"; then
        echo "ERREUR: latexmk a échoué, tentative de repli..."
    else
        echo
        echo "=== Compilation réussie (latexmk) ! ==="
        echo "Le fichier PDF généré: main.pdf"
        if [ -f "main.pdf" ]; then
            cp main.pdf "Preparation_Concours_MAECAME_Ingenieur_Etat.pdf"
            echo "Le rapport a été copié sous le nom : Preparation_Concours_MAECAME_Ingenieur_Etat.pdf"
            echo "Taille du fichier: $(du -h main.pdf | cut -f1)"
            echo "Date de création: $(date)"
        fi
        generate_error_log
        if [ "$CLEAN_ON_SUCCESS" -eq 1 ]; then
            cleanup_success
        else
            echo "[FAST] Aucun nettoyage: fichiers auxiliaires conservés."
        fi
        echo "Compilation terminée avec succès !"
        exit 0
    fi
fi

# Repli manuel sans latexmk
echo "Compilation manuelle (xelatex/biber/xelatex x2)..."
if ! xelatex -interaction=nonstopmode -halt-on-error -file-line-error main.tex; then
    echo "ERREUR: La première compilation a échoué."
    echo "Consultez les erreurs ci-dessus pour plus de détails."
    generate_error_log
    cleanup_failure
    exit 1
fi

if grep -q "\\usepackage\[.*backend=biber" main.tex >/dev/null 2>&1; then
    if command -v biber >/dev/null 2>&1; then
        echo "Exécution de biber..."
        if ! biber main; then
            echo "AVERTISSEMENT: biber a échoué. La bibliographie peut être incomplète."
        fi
    else
        echo "AVERTISSEMENT: biber est introuvable."
    fi
fi

echo "Passes finales xelatex..."
if ! xelatex -interaction=nonstopmode -halt-on-error -file-line-error main.tex; then
    echo "ERREUR: La deuxième compilation a échoué."
    generate_error_log
    cleanup_failure
    exit 1
fi
if ! xelatex -interaction=nonstopmode -halt-on-error -file-line-error main.tex; then
    echo "ERREUR: La troisième compilation a échoué."
    generate_error_log
    cleanup_failure
    exit 1
fi

echo
echo "=== Compilation réussie ! ==="
echo "Le fichier PDF généré: main.pdf"

if [ -f "main.pdf" ]; then
    cp main.pdf "Preparation_Concours_MAECAME_Ingenieur_Etat.pdf"
    echo "Le rapport a été copié sous le nom : Preparation_Concours_MAECAME_Ingenieur_Etat.pdf"
    echo "Taille du fichier: $(du -h main.pdf | cut -f1)"
    echo "Date de création: $(date)"
else
    echo "ATTENTION: Le fichier PDF n'a pas été créé correctement."
    exit 1
fi

generate_error_log

if [ "$CLEAN_ON_SUCCESS" -eq 1 ]; then
    cleanup_success
else
    echo "[FAST] Aucun nettoyage: fichiers auxiliaires conservés."
fi

echo "Compilation terminée avec succès !"
exit 0
