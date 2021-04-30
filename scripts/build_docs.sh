#!/usr/bin/env bash

# exit if any of command has failed
set -e
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

rm -rf "docs"

npx typedoc \
    --readme "README.md" \
    --includes 'src/guides' \
    --out docs \
    --exclude 'tests/**/*' --exclude 'bin/**/*' --exclude 'examples/**/*' \
    --excludeNotDocumented --listInvalidSymbolLinks \
    --theme node_modules/typedoc-default-themes/bin/default/

#cp -f "docs_src/README.md" "README.md"
#
#sed -i -e 's!\[\[BasicFeaturesGuide[|]Basic features\]\]![Basic features](https://bryntum.github.io/chronograph/docs/modules/_src_guides_basicfeatures_.html#basicfeaturesguide)!' "README.md"
#sed -i -e 's!\[\[AdvancedFeaturesGuide[|]Advanced features\]\]![Advanced features](https://bryntum.github.io/chronograph/docs/modules/_src_guides_advancedfeatures_.html#advancedfeaturesguide)!' "README.md"
#sed -i -e 's!\[API docs\][(]\./globals.html[)]![API docs](https://bryntum.github.io/chronograph/docs/)!' "README.md"
#sed -i -e 's!\[\[BenchmarksGuide[|]Benchmarks\]\]![Benchmarks](https://bryntum.github.io/chronograph/docs/modules/_src_guides_benchmarks_.html#benchmarksguide)!' "README.md"
#
#sed -i -e 's!<iframe.*iframe>!!' "README.md"
