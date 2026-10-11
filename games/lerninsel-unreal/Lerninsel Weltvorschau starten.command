#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
engine='/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app'
if [ ! -d "$engine" ]; then
  printf '%s\n' 'Unreal Engine 5.8 wurde an diesem Mac-Pfad nicht gefunden. Lerninsel.uproject im installierten Editor öffnen.'
  exit 1
fi
if [ ! -f "$root/Binaries/Mac/libUnrealEditor-Lerninsel.dylib" ]; then
  "$root/Tools/build_editor.sh"
fi
open -n "$engine" --args "$root/Lerninsel.uproject" /Game/Maps/Lerninsel_Weltvorschau -game -LerninselWorldPreview -windowed -ResX=1440 -ResY=900 -NoSplash
