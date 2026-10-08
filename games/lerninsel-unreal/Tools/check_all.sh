#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
sh "$root/Tests/run.sh"
"$root/Tools/test_editor.sh"
