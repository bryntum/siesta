#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

echo ">> Removing unneeded and problematic *.d.ts files"

rm src/chronograph-jsx/**/*.d.ts
rm src/siesta/ui/**/*.d.ts
rm src/siesta/launcher/**/*.d.ts
rm src/siesta/test/TestResult.d.ts
rm src/siesta/test/TestResultReactive.d.ts
