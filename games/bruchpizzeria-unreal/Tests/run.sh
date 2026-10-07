#!/bin/sh
set -eu
test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$test_dir/build"
xcrun clang++ -std=c++20 -fno-exceptions -Wall -Wextra -Werror -pedantic "$test_dir/fraction_rules_test.cpp" -o "$test_dir/build/fraction_rules_test"
"$test_dir/build/fraction_rules_test"

xcrun clang++ -std=c++20 -fno-exceptions -Wall -Wextra -Werror -pedantic "$test_dir/campaign_learning_test.cpp" -o "$test_dir/build/campaign_learning_test"
"$test_dir/build/campaign_learning_test"

xcrun clang++ -std=c++20 -fno-exceptions -Wall -Wextra -Werror -pedantic "$test_dir/billing_rules_test.cpp" -o "$test_dir/build/billing_rules_test"
"$test_dir/build/billing_rules_test"

xcrun clang++ -std=c++20 -fno-exceptions -Wall -Wextra -Werror -pedantic "$test_dir/supplies_test.cpp" -o "$test_dir/build/supplies_test"
"$test_dir/build/supplies_test"
