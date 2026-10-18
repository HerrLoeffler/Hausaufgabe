#!/bin/sh
set -eu
plugin_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if [ -n "${GC_NODE_BIN:-}" ] && [ -x "$GC_NODE_BIN" ]; then
 exec "$GC_NODE_BIN" "$plugin_dir/plugin/mcp.mjs"
elif command -v node >/dev/null 2>&1; then
 exec node "$plugin_dir/plugin/mcp.mjs"
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
 exec "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" "$plugin_dir/plugin/mcp.mjs"
else
 echo 'GradeCrew Central benötigt Node.js 22 oder neuer.' >&2
 exit 1
fi
