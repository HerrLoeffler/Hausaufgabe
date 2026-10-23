#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/.build" "$root/Reports/L1"
report=$(mktemp -d "$root/.build/world-preview-report.XXXXXX")
test_filter=${1:-GradeCrew.Lerninsel.WorldPreview}
"$root/Tools/build_editor.sh" > "$root/.build/world-preview-build.log" 2>&1
"/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor" "$root/Lerninsel.uproject" -LerninselWorldPreview -unattended -NoSound -NoSplash -Windowed -ResX=1440 -ResY=900 -ExecCmds="Automation RunTests $test_filter" -TestExit="Automation Test Queue Empty" -ReportExportPath="$report" -abslog="$root/.build/world-preview.log" -stdout > "$root/.build/world-preview-stdout.log" 2>&1
python3 "$root/Tools/validate_automation_report.py" "$report/index.json" "$test_filter"
mkdir -p "$root/Reports/L1/Automation"
cp "$report/index.json" "$root/Reports/L1/Automation/index.json"
