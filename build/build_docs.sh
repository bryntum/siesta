#!/usr/bin/env bash

# exit if any of command has failed
set -e

# switch to the root folder of the package
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# clear the existing `/docs` folder
rm -rf "docs"

# generate docs
#node --inspect-brk ./node_modules/.bin/typedoc \

npx typedoc \
    --readme "resources/docs_src/README.md" \
    --includes 'src/guides' \
    --media 'src/guides' \
    --out docs \
    --exclude 'tests/**/*' --exclude 'bin/**/*' --exclude 'examples/**/*' \
    --exclude 'src/iterator/**/*' \
    --excludeNotDocumented --listInvalidSymbolLinks \
    --theme node_modules/typedoc-default-themes/bin/default/

# copy and post-process the README.md
cp -f "resources/docs_src/README.md" "README.md"

#sed -i -e 's!\[\[BasicFeaturesGuide[|]Basic features\]\]![Basic features](https://bryntum.github.io/chronograph/docs/modules/_src_guides_basicfeatures_.html#basicfeaturesguide)!' "README.md"
#sed -i -e 's!\[\[AdvancedFeaturesGuide[|]Advanced features\]\]![Advanced features](https://bryntum.github.io/chronograph/docs/modules/_src_guides_advancedfeatures_.html#advancedfeaturesguide)!' "README.md"
#sed -i -e 's!\[\[BenchmarksGuide[|]Benchmarks\]\]![Benchmarks](https://bryntum.github.io/chronograph/docs/modules/_src_guides_benchmarks_.html#benchmarksguide)!' "README.md"
#
#sed -i -e 's!<iframe.*iframe>!!' "README.md"
