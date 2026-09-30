#!/usr/bin/env bash
# Source this file: the selected runtime must stay in the deploy process.
# Installs only in the user's cache; never changes shell profiles or the repo.

gradecrew_use_node22() {
  local major candidate cache_root runtime_dir install_dir actual_commit
  local nvm_tag="v0.40.3"
  local nvm_commit="977563e97ddc66facf3a8e31c6cff01d236f09bd"
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  if [[ "$major" == "22" ]] && command -v npm >/dev/null 2>&1; then
    echo "GradeCrew Runtime: vorhandenes Node $(node --version)."
    return 0
  fi

  cache_root="${XDG_CACHE_HOME:-$HOME/.cache}/gradecrew"
  runtime_dir="$cache_root/nvm-$nvm_tag"
  if ! command -v nvm >/dev/null 2>&1; then
    # An explicit NVM_DIR is authoritative (and allows a fully isolated CI fixture).
    for candidate in "${NVM_DIR:-$HOME/.nvm}" /usr/local/nvm "$runtime_dir"; do
      if [[ -s "$candidate/nvm.sh" ]]; then
        # nvm installs Node below NVM_DIR; system-wide read-only copies are unsuitable.
        if [[ ! -w "$candidate" ]]; then continue; fi
        # A downloaded cache must still be the release we verified below.
        if [[ "$candidate" == "$runtime_dir" ]] &&
          [[ "$(git -C "$candidate" rev-parse HEAD 2>/dev/null || true)" != "$nvm_commit" ]]; then
          echo "FEHLER: GradeCrew-nvm-Cache entspricht nicht der geprüften Version."
          return 1
        fi
        export NVM_DIR="$candidate"
        # shellcheck disable=SC1090
        . "$NVM_DIR/nvm.sh" --no-use
        if command -v nvm >/dev/null 2>&1; then break; fi
      fi
    done
  fi

  if ! command -v nvm >/dev/null 2>&1; then
    echo "nvm fehlt – GradeCrew richtet Node 22 im Benutzerverzeichnis ein."
    if ! mkdir -p "$cache_root"; then return 1; fi
    if ! install_dir="$(mktemp -d "$cache_root/nvm-install.XXXXXX")"; then return 1; fi
    if ! git clone --quiet --depth 1 --branch "$nvm_tag" \
      https://github.com/nvm-sh/nvm.git "$install_dir/nvm"; then
      rm -rf "$install_dir"
      echo "FEHLER: nvm konnte nicht geladen werden. Es wird nichts deployed."
      return 1
    fi
    actual_commit="$(git -C "$install_dir/nvm" rev-parse HEAD 2>/dev/null || true)"
    if [[ "$actual_commit" != "$nvm_commit" ]]; then
      rm -rf "$install_dir"
      echo "FEHLER: nvm-Download entspricht nicht der geprüften Version."
      return 1
    fi
    if [[ -e "$runtime_dir" ]] || ! mv "$install_dir/nvm" "$runtime_dir"; then
      rm -rf "$install_dir"
      echo "FEHLER: GradeCrew-nvm-Cache konnte nicht eingerichtet werden."
      return 1
    fi
    rmdir "$install_dir"
    export NVM_DIR="$runtime_dir"
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh" --no-use
  fi

  if ! nvm install 22 || ! nvm use 22; then
    echo "FEHLER: Node 22 konnte nicht aktiviert werden. Es wird nichts deployed."
    return 1
  fi
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  if [[ "$major" != "22" ]] || ! command -v npm >/dev/null 2>&1; then
    echo "FEHLER: Node 22 mit npm erforderlich. Es wird nichts deployed."
    return 1
  fi
}

gradecrew_use_firebase() {
  local cli_dir
  if command -v firebase >/dev/null 2>&1; then return 0; fi
  cli_dir="${XDG_CACHE_HOME:-$HOME/.cache}/gradecrew/firebase-cli"
  if [[ ! -x "$cli_dir/node_modules/.bin/firebase" ]]; then
    echo "Firebase CLI fehlt – Installation im Benutzerverzeichnis."
    if ! npm install --prefix "$cli_dir" --no-save --package-lock=false \
      --no-audit --no-fund firebase-tools; then
      echo "FEHLER: Firebase CLI konnte nicht eingerichtet werden."
      return 1
    fi
  fi
  export PATH="$cli_dir/node_modules/.bin:$PATH"
  if ! command -v firebase >/dev/null 2>&1; then
    echo "FEHLER: Firebase CLI ist nach der Installation nicht verfügbar."
    return 1
  fi
}
