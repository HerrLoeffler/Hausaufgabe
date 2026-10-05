#!/bin/zsh
cd "$(dirname "$0")" || exit 1
GC_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [[ ! -x "$GC_NODE" ]]; then GC_NODE="$(command -v node)"; fi
if [[ -z "$GC_NODE" ]]; then
  echo 'Node.js fehlt. Bitte die App über Codex starten lassen.'
  read '?Zum Schließen Enter drücken.'
  exit 1
fi
"$GC_NODE" server.mjs &
GC_APP_PID=$!
trap 'kill "$GC_APP_PID" 2>/dev/null' EXIT INT TERM
sleep 1
if kill -0 "$GC_APP_PID" 2>/dev/null; then
  open 'http://127.0.0.1:4318'
  echo 'GradeCrew ist geöffnet. Dieses Fenster während der Nutzung offen lassen.'
  wait "$GC_APP_PID"
else
  echo 'Die App läuft möglicherweise schon: http://127.0.0.1:4318'
  read '?Zum Schließen Enter drücken.'
fi
