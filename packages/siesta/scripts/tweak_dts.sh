#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

echo ">> Tweaking *.d.ts files"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Very very horrible mess caused by: https://github.com/microsoft/TypeScript/issues/35822

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Isomorphic
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sed -i -e 's!import { DashboardLaunchInfo }.*!type DashboardLaunchInfo = any!' "src/siesta/test/Test.d.ts"
sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/test/Test.d.ts"
sed -i -e 's!import { TestLauncherChild }.*!type TestLauncherChild = any!' "src/siesta/test/Test.d.ts"

sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/project/Project.d.ts"

sed -i -e 's!fromTestResult.*!!' "src/siesta/test/TestResult.d.ts"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Browser
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/test/TestBrowser.d.ts"
sed -i -e 's!import { TestLauncherChild }.*!type TestLauncherChild = any!' "src/siesta/test/TestBrowser.d.ts"
sed -i -e 's!import("\.\./launcher/DashboardConnector\.js")\.DashboardLaunchInfo!any!' "src/siesta/test/TestBrowser.d.ts"

sed -i -e 's!typeof import("\.\./launcher/Launcher\.js").Launcher!any!' "src/siesta/project/ProjectBrowser.d.ts"
sed -i -e 's!import("\.\./launcher/Launcher\.js").Launcher!any!' "src/siesta/project/ProjectBrowser.d.ts"

sed -i -e 's!connector:.*!connector:any!' "src/siesta/simulate/UserAgent.d.ts"
sed -i -e 's!import("\.\./launcher/DashboardConnector\.js")\.DashboardLaunchInfo!any!' "src/siesta/simulate/UserAgent.d.ts"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Node.js
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/test/TestNodejs.d.ts"
sed -i -e 's!import("\.\./launcher/DashboardConnector\.js")\.DashboardLaunchInfo!any!' "src/siesta/test/TestNodejs.d.ts"
sed -i -e 's!connector:.*!connector:any!' "src/siesta/test/TestNodejs.d.ts"

sed -i -e 's!typeof import("\.\./launcher/Launcher\.js").Launcher!any!' "src/siesta/project/ProjectNodejs.d.ts"
sed -i -e 's!import("\.\./launcher/Launcher\.js").Launcher!any!' "src/siesta/project/ProjectNodejs.d.ts"

sed -i -e 's!launcherClass:.*!launcherClass:any;!' "src/siesta/project/ProjectNodejs.d.ts"

sed -i -e 's!import { LauncherTerminal }.*!declare const LauncherTerminal : any!' "src/siesta/project/ProjectTerminal.d.ts"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Deno.js
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sed -i -e 's!import { Launcher }.*!declare const Launcher : any!' "src/siesta/test/TestDeno.d.ts"
sed -i -e 's!import("\.\./launcher/DashboardConnector\.js")\.DashboardLaunchInfo!any!' "src/siesta/test/TestDeno.d.ts"
sed -i -e 's!connector:.*!connector:any!' "src/siesta/test/TestDeno.d.ts"
sed -i -e 's!dashboardLaunchInfo:.*!dashboardLaunchInfo:any!' "src/siesta/test/TestDeno.d.ts"

sed -i -e 's!getLauncherClass():.*!getLauncherClass():any!' "src/siesta/project/ProjectDeno.d.ts"
sed -i -e 's!getStandaloneLauncher():.*!getStandaloneLauncher():any!' "src/siesta/project/ProjectDeno.d.ts"
sed -i -e 's!launcherClass:.*!launcherClass:any!' "src/siesta/project/ProjectDeno.d.ts"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TypeScript 3.8.3 compat
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/project/Project.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/project/Project.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/project/ProjectNodejs.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/project/ProjectNodejs.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/test/TestDescriptorDeno.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/test/TestDescriptorDeno.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/test/TestDescriptorNodejs.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/test/TestDescriptorNodejs.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/test/TestNodejs.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/test/TestNodejs.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/siesta/test/assertion/AssertionAsync.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/siesta/test/assertion/AssertionAsync.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/serializer/SerializerRendering.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/serializer/SerializerRendering.d.ts"

sed -i -e '1s!^!import { Base } from "typescript-mixin-class/src/class/Base"\n!' "src/compare_deep/CompareDeepDiffRendering.d.ts"
sed -i -e 's!import("typescript-mixin-class/src/class/Base").Base!Base!' "src/compare_deep/CompareDeepDiffRendering.d.ts"
