#!/bin/zsh
project_dir="${0:A:h}"
exec /usr/bin/open -n -a '/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app' --args "$project_dir/Bruchpizzeria.uproject" -game -windowed -ResX=1440 -ResY=900 -NoSplash
