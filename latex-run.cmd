@echo off
setlocal

REM LaTeX runner (ASCII-only, non-interactive)
REM Usage examples:
REM   latex-run.cmd build   -> build image and compile once (shows errors)
REM   latex-run.cmd debug   -> compile with detailed LaTeX errors
REM   latex-run.cmd log     -> show last lines of main.log
REM   latex-run.cmd server  -> serve PDF on http://localhost:8080/main.pdf
REM   latex-run.cmd watch   -> recompile on changes (needs inotify-tools in image)
REM   latex-run.cmd clean   -> remove temp files and main.pdf

cd /d "%~dp0"

REM Detect docker compose variant
set "COMPOSE_CMD=docker compose"
docker compose version >nul 2>nul
if errorlevel 1 set "COMPOSE_CMD=docker-compose"

if "%~1"=="" goto USAGE

if /i "%~1"=="build"  goto BUILD
if /i "%~1"=="debug"  goto DEBUG
if /i "%~1"=="log"    goto LOG
if /i "%~1"=="server" goto SERVER
if /i "%~1"=="watch"  goto WATCH
if /i "%~1"=="clean"  goto CLEAN

:USAGE
echo Usage:
echo   %~nx0 build   - Build image and compile once (show errors)
echo   %~nx0 debug   - Compile with detailed LaTeX errors
echo   %~nx0 log     - Show last 80 lines of main.log
echo   %~nx0 server  - Serve PDF on http://localhost:8080/main.pdf
echo   %~nx0 watch   - Recompile on changes
echo   %~nx0 clean   - Remove temp files and main.pdf
goto END

:BUILD
echo [BUILD] Building image and compiling once...
%COMPOSE_CMD% up --build latex-compiler
goto END

:DEBUG
echo [DEBUG] Building service if needed...
%COMPOSE_CMD% build latex-compiler
echo [DEBUG] Running XeLaTeX with errorstopmode...
%COMPOSE_CMD% run --rm latex-compiler bash -lc "xelatex -interaction=errorstopmode -halt-on-error -file-line-error main.tex || (echo ==== Errors from main.log ====; test -f main.log && tail -n 120 main.log || true)"
goto END

:LOG
if exist "main.log" (
  echo [LOG] Showing last 80 lines of main.log...
  powershell -NoLogo -NoProfile -Command "Get-Content -Path '%CD%\main.log' -Tail 80"
) else (
  echo [LOG] main.log not found. Run a compilation first.
)
goto END

:SERVER
if not exist "main.pdf" (
  echo [SERVER] main.pdf not found. Run: %~nx0 build
  goto END
)
echo [SERVER] Opening http://localhost:8080/main.pdf
start "" http://localhost:8080/main.pdf
%COMPOSE_CMD% --profile server up pdf-server
goto END

:WATCH
echo [WATCH] Starting watch service (Ctrl+C to stop)...
%COMPOSE_CMD% --profile dev up latex-watch
goto END

:CLEAN
echo [CLEAN] Deleting LaTeX temp files and PDF...
for %%e in (aux log out toc lof lot bbl blg idx ind ilg fls fdb_latexmk synctex.gz nav snm vrb pdf) do del /q "*.%%e" 2>nul
echo [CLEAN] Done.
goto END

:END
endlocal
exit /b 0
