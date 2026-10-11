#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python3 "$root/Tools/generate_tasks.py" --check
mkdir -p "$root/.build"
c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/rules_test.cpp" -o "$root/.build/rules_test"
"$root/.build/rules_test"
c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/puzzles_test.cpp" -o "$root/.build/puzzles_test"
"$root/.build/puzzles_test"

c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/controls_test.cpp" -o "$root/.build/controls_test"
"$root/.build/controls_test"

c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/water_test.cpp" -o "$root/.build/water_test"
"$root/.build/water_test"

c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/fox_test.cpp" -o "$root/.build/fox_test"
"$root/.build/fox_test"

c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/tasks_test.cpp" -o "$root/.build/tasks_test"
"$root/.build/tasks_test"
