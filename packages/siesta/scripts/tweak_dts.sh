#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

echo ">> Tweaking *.d.ts files"

sed -i -e 's!import { DashboardLaunchInfo }.*!type DashboardLaunchInfo = any!' "src/siesta/test/Test.d.ts"
sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/test/Test.d.ts"
sed -i -e 's!import { TestLauncherChild }.*!type TestLauncherChild = any!' "src/siesta/test/Test.d.ts"

sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/project/Project.d.ts"

sed -i -e 's!fromTestResult.*!!' "src/siesta/test/TestResult.d.ts"
