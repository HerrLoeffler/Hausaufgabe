#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/.build"
c++ -std=c++17 -Wall -Wextra -Werror "$root/Tests/rules_test.cpp" -o "$root/.build/rules_test"
"$root/.build/rules_test"
