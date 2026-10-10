#!/bin/zsh
set -eu
TASK_DIR="$(cd "$(dirname "$0")" && pwd)"
TASK_NODE="${NODE_BINARY:-$(command -v node || true)}"
if [[ -z "$TASK_NODE" ]]; then TASK_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"; fi
exec "$TASK_NODE" "$TASK_DIR/start.mjs"
