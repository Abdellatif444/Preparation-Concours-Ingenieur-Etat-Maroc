#!/bin/bash

# Script de débogage LaTeX
echo "=== Débogage LaTeX ==="

# Vérifier que main.tex existe
if [ ! -f "main.tex" ]; then
    echo "❌ ERREUR: main.tex introuvable"
    exit 1
fi

echo "✅ Fichier main.tex trouvé"

# Compilation avec mode d'erreur détaillé
echo "🔍 Compilation en mode débogage..."
pdflatex -interaction=errorstopmode -halt-on-error -file-line-error main.tex

# Afficher les erreurs du log si la compilation échoue
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ COMPILATION ÉCHOUÉE - Analyse des erreurs :"
    echo "================================================"
    
    if [ -f "main.log" ]; then
        # Extraire les erreurs importantes du log
        echo "🔍 Erreurs détectées :"
        grep -n "^!" main.log || echo "Aucune erreur explicite trouvée"
        
        echo ""
        echo "⚠️  Avertissements :"
        grep -n "Warning" main.log || echo "Aucun avertissement"
        
        echo ""
        echo "📝 Dernières lignes du log :"
        tail -20 main.log
    else
        echo "Aucun fichier de log généré"
    fi
    
    exit 1
else
    echo "✅ Compilation réussie !"
    if [ -f "main.pdf" ]; then
        echo "📄 PDF généré avec succès"
        ls -lh main.pdf
    fi
fi
