@echo off
setlocal

REM Simple LaTeX manager (ASCII only) to avoid encoding issues in CMD
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Detect Docker Compose command (V2: "docker compose", fallback: "docker-compose")
set "COMPOSE_CMD=docker compose"
docker compose version >nul 2>nul
if errorlevel 1 (
  set "COMPOSE_CMD=docker-compose"
)

:MENU

echo.
echo ================= LaTeX Manager (ASCII) =================
echo 1) Compile once (build + run)
echo 2) Compile in DEBUG (show LaTeX errors)
echo 3) Show main.log (last 50 lines)
echo 0) Exit
set /p CHOICE=Choose [0-3]: 
if "%CHOICE%"=="1" goto COMPILE_ONCE
if "%CHOICE%"=="2" goto COMPILE_DEBUG
if "%CHOICE%"=="3" goto SHOW_LOG
if "%CHOICE%"=="0" goto END
echo Invalid choice.
goto MENU

:COMPILE_ONCE
echo Building image and compiling once...
%COMPOSE_CMD% up --build latex-compiler
echo Done.
goto MENU

:COMPILE_DEBUG
echo Building service (if needed)...
%COMPOSE_CMD% build latex-compiler
echo Running LaTeX in DEBUG mode (errorstopmode)...
%COMPOSE_CMD% run --rm latex-compiler bash -lc "pdflatex -interaction=errorstopmode -halt-on-error -file-line-error main.tex || (echo ==== Errors from main.log ====; test -f main.log && tail -n 80 main.log || true)"
echo Finished DEBUG run.
goto MENU

:SHOW_LOG
if exist "main.log" (
  echo Showing last 50 lines of main.log:
  powershell -NoLogo -NoProfile -Command "Get-Content -Path 'main.log' -Tail 50"
) else (
  echo main.log not found. Run a compilation first.
)
goto MENU

:END
endlocal
exit /b 0
