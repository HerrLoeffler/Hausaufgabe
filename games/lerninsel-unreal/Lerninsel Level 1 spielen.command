#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
engine='/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app'
if [ ! -d "$engine" ]; then printf '%s\n' 'UE5.8 an diesem Mac-Pfad nicht gefunden.'; exit 1; fi
# Always check the module against the current source before launch.
"$root/Tools/build_editor.sh" > "$root/.build/starter-level1-build.log" 2>&1
open -n "$engine" --args "$root/Lerninsel.uproject" /Game/Maps/Lerninsel_Level1Ref -game -windowed -ResX=1440 -ResY=900 -NoSplash 
