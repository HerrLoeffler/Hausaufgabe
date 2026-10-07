#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/.build" "$root/Reports"
"/Users/Shared/Epic Games/UE_5.8/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor" "$root/Lerninsel.uproject" -unattended -NoSound -NoSplash -Windowed -ResX=1440 -ResY=900 -ExecCmds="Automation RunTests GradeCrew.Lerninsel" -TestExit="Automation Test Queue Empty" -ReportExportPath="$root/Reports/Automation" -abslog="$root/.build/automation.log" -stdout -FullStdOutLogOutput > "$root/.build/editor-stdout.log" 2>&1
python3 - "$root/Reports/Automation/index.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1],encoding='utf-8-sig'))
print('UE tests:',r.get('succeeded',0),'clean,',r.get('succeededWithWarnings',0),'with warnings,',r.get('failed',0),'failed')
for t in r.get('tests',[]): print(t.get('fullTestPath'),t.get('state'),'errors',t.get('errors'),'warnings',t.get('warnings'))
assert r.get('failed')==0 and r.get('notRun')==0 and r.get('tests')
PY
