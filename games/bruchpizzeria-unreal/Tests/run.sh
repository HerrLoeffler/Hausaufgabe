#!/bin/sh
set -eu
test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$test_dir/build"
xcrun clang++ -std=c++20 -fno-exceptions -Wall -Wextra -Werror -pedantic "$test_dir/fraction_rules_test.cpp" -o "$test_dir/build/fraction_rules_test"
"$test_dir/build/fraction_rules_test"
