#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

TASK_BRANCH="${1:-$(git branch --show-current)}"
if [[ $# -gt 0 ]]; then shift; fi
if [[ -z "$TASK_BRANCH" ]]; then echo "Branch fehlt: bash cloud-shell-bootstrap.sh <branch> -- <befehl>"; exit 1; fi
if [[ "${1:-}" == "--" ]]; then shift; fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "Nicht gespeicherte Änderungen im Arbeitsordner. Bitte zuerst sichern."
  exit 1
fi
git fetch origin
if git show-ref --verify --quiet "refs/heads/$TASK_BRANCH"; then
  git switch "$TASK_BRANCH"
else
  git switch --track -c "$TASK_BRANCH" "origin/$TASK_BRANCH"
fi
git pull --ff-only origin "$TASK_BRANCH"

GC_NODE_DIR="$HOME/.cache/gradecrew/node22"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  if [[ ! -x "$GC_NODE_DIR/bin/node" ]] || [[ "$("$GC_NODE_DIR/bin/node" -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
    case "$(uname -sm)" in
      "Linux x86_64") GC_NODE_ARCH="linux-x64" ;;
      "Linux aarch64") GC_NODE_ARCH="linux-arm64" ;;
      *) echo "Dieses Bootstrap-Skript ist für Linux Cloud Shell vorgesehen."; exit 1 ;;
    esac
    GC_DOWNLOAD_DIR="$(mktemp -d)"
    trap 'rm -rf "$GC_DOWNLOAD_DIR"' EXIT
    curl --fail --location --silent --show-error https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt -o "$GC_DOWNLOAD_DIR/SHASUMS256.txt"
    GC_NODE_FILE="$(awk -v suffix="-$GC_NODE_ARCH.tar.xz" 'index($2,suffix) && substr($2,length($2)-length(suffix)+1)==suffix {print $2; exit}' "$GC_DOWNLOAD_DIR/SHASUMS256.txt")"
    if [[ ! "$GC_NODE_FILE" =~ ^node-v22\.[0-9]+\.[0-9]+-linux-(x64|arm64)\.tar\.xz$ ]]; then echo "Node-22-Paket konnte nicht eindeutig ermittelt werden."; exit 1; fi
    curl --fail --location --silent --show-error "https://nodejs.org/dist/latest-v22.x/$GC_NODE_FILE" -o "$GC_DOWNLOAD_DIR/$GC_NODE_FILE"
    (cd "$GC_DOWNLOAD_DIR" && awk -v file="$GC_NODE_FILE" '$2==file' SHASUMS256.txt | sha256sum --check --status)
    mkdir -p "$GC_NODE_DIR"
    tar -xJf "$GC_DOWNLOAD_DIR/$GC_NODE_FILE" --strip-components=1 -C "$GC_NODE_DIR"
    rm -rf "$GC_DOWNLOAD_DIR"
    trap - EXIT
  fi
  export PATH="$GC_NODE_DIR/bin:$PATH"
fi
hash -r
echo "GradeCrew: $TASK_BRANCH · Node $(node --version)"

# A Firebase CLI is only needed for an explicitly requested deployment.
if [[ " $* " == *" --deploy "* ]] && ! command -v firebase >/dev/null 2>&1; then
  GC_FIREBASE_DIR="$HOME/.cache/gradecrew/firebase-cli"
  if [[ ! -x "$GC_FIREBASE_DIR/node_modules/.bin/firebase" ]]; then
    npm install --prefix "$GC_FIREBASE_DIR" --no-audit --no-fund firebase-tools@15.32.0
  fi
  export PATH="$GC_FIREBASE_DIR/node_modules/.bin:$PATH"
fi

# Run the command here so it receives the prepared Node environment.
if [[ $# -gt 0 ]]; then exec "$@"; fi
echo "Folgebefehl direkt mitgeben: bash cloud-shell-bootstrap.sh $TASK_BRANCH -- bash deploy-lab-games-hub.sh --check"
