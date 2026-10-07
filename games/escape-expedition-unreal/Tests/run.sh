#!/bin/sh
set -eu
task_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$task_dir/build"
xcrun clang++ -std=c++20 -Wall -Wextra -Werror "$task_dir/rules_test.cpp" -o "$task_dir/build/rules_test"
"$task_dir/build/rules_test"
