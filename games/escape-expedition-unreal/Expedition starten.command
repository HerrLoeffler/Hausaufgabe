#!/bin/sh
set -eu
game_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
editor="/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor"
if [ ! -x "$editor" ]; then
  echo 'Unreal 5.8 wurde am erwarteten Ort nicht gefunden.'
  exit 1
fi
exec "$editor" "$game_dir/Expedition.uproject" -game -windowed -ResX=1440 -ResY=900
