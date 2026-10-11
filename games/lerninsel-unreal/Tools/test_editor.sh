#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/.build" "$root/Reports"
report=$(mktemp -d "$root/.build/automation-report.XXXXXX")
test_filter=${1:-GradeCrew.Lerninsel}
# Never run a stale module after a failed compilation.
"$root/Tools/build_editor.sh" > "$root/.build/editor-build-before-test.log" 2>&1
"/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor" "$root/Lerninsel.uproject" -LerninselWorldPreview -unattended -NoSound -NoSplash -Windowed -ResX=1440 -ResY=900 -ExecCmds="Automation RunTests $test_filter" -TestExit="Automation Test Queue Empty" -ReportExportPath="$report" -abslog="$root/.build/automation.log" -stdout -FullStdOutLogOutput > "$root/.build/editor-stdout.log" 2>&1
python3 "$root/Tools/validate_automation_report.py" "$report/index.json" "$test_filter"
mkdir -p "$root/Reports/Automation"
cp "$report/index.json" "$root/Reports/Automation/index.json"
