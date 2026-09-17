@echo off
title Flow Image Hub - Coloring Studio
cd /d "%~dp0"
echo ========================================================
echo   Flow Image Hub -- Coloring Studio (Port 8085)
echo ========================================================
echo.
echo Ouverture du navigateur sur http://localhost:8085/ ...
start http://localhost:8085/
python hub_server.py
pause
