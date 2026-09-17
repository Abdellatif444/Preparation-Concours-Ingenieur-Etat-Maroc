@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
cls

REM ============================================================================
REM                    GESTIONNAIRE LATEX - RAPPORT ABDELLATIF GOURRI
REM ============================================================================
REM Ce script centralise toutes les commandes pour compiler et gérer votre
REM rapport LaTeX dans Docker. Plus besoin de se souvenir des commandes !
REM ============================================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:MENU
echo.
echo ================================================================================
echo                         🎓 GESTIONNAIRE DE RAPPORT LATEX 🎓
echo ================================================================================
echo.
echo Choisissez une option :
echo.
echo   1️⃣  - COMPILATION SIMPLE
echo        Compile le rapport une seule fois (recommandé pour la version finale)
echo.
echo   2️⃣  - COMPILATION AVEC DEBUG
echo        Compile avec affichage détaillé des erreurs (utile pour corriger)
echo.
echo   3️⃣  - MODE SURVEILLANCE
echo        Recompile automatiquement à chaque modification (mode développement)
echo.
echo   4️⃣  - SERVEUR PDF
echo        Lance un serveur web pour voir le PDF (http://localhost:8080/main.pdf)
echo.
echo   5️⃣  - VOIR LES LOGS D'ERREUR
echo        Affiche les dernières erreurs de compilation
echo.
echo   6️⃣  - NETTOYER LES FICHIERS
echo        Supprime les fichiers temporaires et le PDF
echo.
echo   7️⃣  - CONSTRUIRE L'IMAGE DOCKER
echo        Reconstruit l'image Docker (après modification du Dockerfile)
echo.
echo   8️⃣  - OUVRIR LE PDF
echo        Ouvre le PDF généré dans le navigateur par défaut
echo.
echo   0️⃣  - QUITTER
echo.
echo ================================================================================

set /p choice="Votre choix (0-8) : "

if "%choice%"=="1" goto COMPILE_SIMPLE
if "%choice%"=="2" goto COMPILE_DEBUG
if "%choice%"=="3" goto MODE_SURVEILLANCE
if "%choice%"=="4" goto SERVEUR_PDF
if "%choice%"=="5" goto VOIR_LOGS
if "%choice%"=="6" goto NETTOYER
if "%choice%"=="7" goto CONSTRUIRE_IMAGE
if "%choice%"=="8" goto OUVRIR_PDF
if "%choice%"=="0" goto FIN
goto CHOIX_INVALIDE

REM ============================================================================
REM                                OPTION 1 : COMPILATION SIMPLE
REM ============================================================================
:COMPILE_SIMPLE
echo.
echo 🔨 COMPILATION SIMPLE DU RAPPORT...
echo ────────────────────────────────────────────────────────────────────────────
echo Cette option compile votre rapport LaTeX en une seule fois.
echo Le fichier PDF sera généré dans ce dossier.
echo.
pause

REM Vérifier que Docker est disponible
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Docker n'est pas installé ou pas accessible
    echo Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop
    pause
    goto MENU
)

echo 🚀 Lancement de la compilation...
docker-compose up --build latex-compiler

if errorlevel 0 (
    echo.
    echo ✅ COMPILATION TERMINÉE !
    if exist "main.pdf" (
        echo 📄 Le fichier main.pdf a été généré avec succès
        for %%f in (main.pdf) do echo 📊 Taille: %%~zf octets
    ) else (
        echo ❌ Le fichier PDF n'a pas été créé - vérifiez les erreurs ci-dessus
    )
) else (
    echo.
    echo ❌ ERREUR LORS DE LA COMPILATION
    echo Consultez les messages ci-dessus pour identifier le problème
)

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 2 : COMPILATION AVEC DEBUG
REM ============================================================================
:COMPILE_DEBUG
echo.
echo 🐛 COMPILATION AVEC MODE DEBUG...
echo ────────────────────────────────────────────────────────────────────────────
echo Cette option compile avec des informations détaillées sur les erreurs.
echo Utilisez cette option quand vous avez des problèmes de compilation.
echo.
pause

echo 🔍 Compilation en mode debug...
docker run --rm -v "%CD%":/workspace rapport-latex-compiler /bin/bash -c "
echo '=== COMPILATION DEBUG ===' && 
pdflatex -interaction=errorstopmode -file-line-error main.tex &&
echo '✅ Première compilation OK' &&
pdflatex -interaction=errorstopmode -file-line-error main.tex &&
echo '✅ Deuxième compilation OK' ||
(echo '❌ ERREUR DÉTECTÉE' && 
 if [ -f main.log ]; then 
   echo '📝 ANALYSE DU FICHIER LOG:' && 
   grep -n '^!' main.log && 
   echo '📋 CONTEXTE:' && 
   grep -A 2 -B 2 'Error\|error' main.log
 fi)
"

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 3 : MODE SURVEILLANCE
REM ============================================================================
:MODE_SURVEILLANCE
echo.
echo 👁️ MODE SURVEILLANCE ACTIVÉ...
echo ────────────────────────────────────────────────────────────────────────────
echo Ce mode surveille les modifications de vos fichiers .tex et .cls
echo Le rapport sera automatiquement recompilé à chaque sauvegarde.
echo.
echo ⚠️  ATTENTION: Appuyez sur Ctrl+C pour arrêter la surveillance
echo.
pause

echo 🔄 Surveillance démarrée - Modifiez vos fichiers pour voir la recompilation automatique...
docker-compose --profile dev up latex-watch

echo.
echo 🛑 Surveillance arrêtée
pause
goto MENU

REM ============================================================================
REM                                OPTION 4 : SERVEUR PDF
REM ============================================================================
:SERVEUR_PDF
echo.
echo 🌐 LANCEMENT DU SERVEUR PDF...
echo ────────────────────────────────────────────────────────────────────────────
echo Cette option lance un serveur web local pour consulter votre PDF.
echo.

REM Vérifier que le PDF existe
if not exist "main.pdf" (
    echo ⚠️  Le fichier main.pdf n'existe pas encore.
    echo Voulez-vous le compiler d'abord ? (O/N^)
    set /p compile_first=""
    if /i "!compile_first!"=="O" (
        echo 🔨 Compilation du PDF...
        docker-compose up --build latex-compiler
    )
)

if exist "main.pdf" (
    echo 🚀 Démarrage du serveur...
    echo.
    echo 🌍 Votre PDF sera accessible à l'adresse :
    echo    👉 http://localhost:8080/main.pdf
    echo.
    echo ⚠️  Appuyez sur Ctrl+C pour arrêter le serveur
    echo.
    pause
    
    REM Ouvrir automatiquement le navigateur
    start http://localhost:8080/main.pdf
    
    docker-compose --profile server up pdf-server
) else (
    echo ❌ Impossible de démarrer le serveur - PDF non trouvé
)

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 5 : VOIR LES LOGS
REM ============================================================================
:VOIR_LOGS
echo.
echo 📋 CONSULTATION DES LOGS D'ERREUR...
echo ────────────────────────────────────────────────────────────────────────────

if exist "main.log" (
    echo 🔍 Analyse du fichier main.log...
    echo.
    
    REM Chercher les erreurs
    findstr /C:"!" main.log > temp_errors.txt 2>nul
    if exist temp_errors.txt (
        for /f %%i in ('type temp_errors.txt ^| find /c /v ""') do set error_count=%%i
        if !error_count! GTR 0 (
            echo ❌ ERREURS TROUVÉES (!error_count!^) :
            echo ────────────────────────────────────────
            type temp_errors.txt
        ) else (
            echo ✅ Aucune erreur majeure détectée
        )
        del temp_errors.txt
    )
    
    echo.
    echo 📝 DERNIÈRES LIGNES DU LOG :
    echo ────────────────────────────────────────
    REM Afficher les 15 dernières lignes
    powershell "Get-Content main.log | Select-Object -Last 15"
    
) else (
    echo ⚠️  Aucun fichier de log trouvé
    echo    Effectuez d'abord une compilation pour générer le log
)

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 6 : NETTOYER
REM ============================================================================
:NETTOYER
echo.
echo 🧹 NETTOYAGE DES FICHIERS...
echo ────────────────────────────────────────────────────────────────────────────
echo Cette option supprime tous les fichiers temporaires et le PDF généré.
echo.
echo ⚠️  ATTENTION: Le fichier main.pdf sera supprimé !
echo Voulez-vous continuer ? (O/N^)
set /p confirm_clean=""

if /i "!confirm_clean!"=="O" (
    echo 🗑️  Suppression des fichiers temporaires...
    
    REM Supprimer les fichiers LaTeX temporaires
    for %%ext in (aux log out toc lof lot bbl blg idx ind ilg fls fdb_latexmk synctex.gz nav snm vrb) do (
        if exist "*.%%ext" (
            del "*.%%ext" 2>nul
            echo    ✅ Fichiers *.%%ext supprimés
        )
    )
    
    REM Supprimer le PDF
    if exist "main.pdf" (
        del "main.pdf"
        echo    ✅ main.pdf supprimé
    )
    
    echo.
    echo ✅ NETTOYAGE TERMINÉ !
) else (
    echo 🚫 Nettoyage annulé
)

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 7 : CONSTRUIRE IMAGE
REM ============================================================================
:CONSTRUIRE_IMAGE
echo.
echo 🔧 CONSTRUCTION DE L'IMAGE DOCKER...
echo ────────────────────────────────────────────────────────────────────────────
echo Cette option reconstruit l'image Docker LaTeX.
echo Utilisez-la après avoir modifié le Dockerfile ou pour forcer une mise à jour.
echo.
pause

echo 🏗️  Construction de l'image...
docker-compose build --no-cache latex-compiler

if errorlevel 0 (
    echo ✅ Image construite avec succès !
) else (
    echo ❌ Erreur lors de la construction de l'image
)

echo.
pause
goto MENU

REM ============================================================================
REM                                OPTION 8 : OUVRIR PDF
REM ============================================================================
:OUVRIR_PDF
echo.
echo 📖 OUVERTURE DU PDF...
echo ────────────────────────────────────────────────────────────────────────────

if exist "main.pdf" (
    echo 🚀 Ouverture de main.pdf...
    start "" "main.pdf"
    echo ✅ PDF ouvert dans l'application par défaut
) else (
    echo ❌ Le fichier main.pdf n'existe pas
    echo    Compilez d'abord votre rapport avec l'option 1 ou 2
)

echo.
pause
goto MENU

REM ============================================================================
REM                                GESTION D'ERREURS
REM ============================================================================
:CHOIX_INVALIDE
echo.
echo ❌ Choix invalide ! Veuillez sélectionner une option entre 0 et 8.
timeout /t 2 >nul
goto MENU

:FIN
echo.
echo 👋 À bientôt ! Bonne rédaction de votre rapport !
echo.
pause
exit /b 0
