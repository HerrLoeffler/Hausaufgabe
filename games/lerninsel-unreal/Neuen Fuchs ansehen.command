#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
engine='/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app'
open -n "$engine" --args "$root/Lerninsel.uproject" -game -FoxDesignPreview -windowed -ResX=1440 -ResY=900 -NoSplash
