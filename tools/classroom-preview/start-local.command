#!/bin/zsh
set -eu
cd -- "${0:A:h}/../.."
node_bin="${GC_CLASSROOM_NODE:-}"
if [[ -z "$node_bin" ]]; then
  node_bin="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ ! -x "$node_bin" ]]; then
  node_bin="$(command -v node || true)"
fi
if [[ -z "$node_bin" || ! -x "$node_bin" ]]; then
  print -u2 'Node.js wurde nicht gefunden. Bitte die lokale GradeCrew-Laufzeit prüfen.'
  exit 1
fi
if /usr/sbin/lsof -nP -iTCP:8782 -sTCP:LISTEN >/dev/null 2>&1; then
  print 'Port 8782 ist bereits belegt. Prüfe http://127.0.0.1:8782/ im Browser.'
  print 'Es wurde kein laufender Prozess beendet und kein anderer Port gewählt.'
  exit 1
fi
export GC_CLASSROOM_PORT=8782
print 'GradeCrew auf diesem Mac: http://127.0.0.1:8782/'
print 'Dieses Terminalfenster geöffnet lassen. Beenden mit Ctrl+C.'
exec "$node_bin" tools/classroom-preview/server.mjs
