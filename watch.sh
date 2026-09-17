#!/bin/sh
set -eu

echo 'Watch mode: recompilation on .tex/.cls/.bib changes (portable polling fallback)'
echo '[FAST] compile.sh will run in FAST mode (keeps aux files to speed up rebuilds)'

compute_hash() {
  find /workspace -type f \( -name '*.tex' -o -name '*.cls' -o -name '*.bib' \) -print0 \
    | xargs -0 -r stat -c '%Y %n' 2>/dev/null \
    | sha1sum | awk '{print $1}'
}

last="$(compute_hash 2>/dev/null || echo '')"

while true; do
  # Try inotify with short timeout; if no event, we still poll
  if command -v inotifywait >/dev/null 2>&1; then
    inotifywait -r -t 2 -e modify,create,delete --format '%w%f' /workspace >/dev/null 2>&1 || true
  fi

  current="$(compute_hash 2>/dev/null || echo '')"
  if [ "$current" != "$last" ]; then
    echo "=== Change detected, recompiling ==="
    # Lancement explicite avec bash pour eviter les problemes de sh
    FAST=1 /workspace/compile.sh || true
    echo '=== Recompilation done ==='
    last="$current"
  fi
  sleep 2
done
