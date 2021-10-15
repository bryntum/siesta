#!/usr/bin/env bash

# exit if any of command has failed
set -e

# switch to the root folder of the package
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# clear the existing `/docs` folder
rm -rf "docs"

# generate docs
echo ">> Copying and post-processing the README.md"

cp -f "resources/docs_src/README.md" "README.md"

sed -i -e 's!\[\[GettingStartedNodejsGuide|Getting started with Siesta in Node.js environment\]\]![Getting started with Siesta in Node.js environment](https://bryntum.github.io/siesta/docs/modules/_src_guides_getting_started_nodejs_getting_started_nodejs_.html#gettingstartednodejsguide)!' "README.md"
sed -i -e 's!\[\[GettingStartedDenoGuide|Getting started with Siesta in Deno environment\]\]![Getting started with Siesta in Deno environment](https://bryntum.github.io/siesta/docs/modules/_src_guides_getting_started_deno_getting_started_deno_.html#gettingstarteddenoguide)!' "README.md"
sed -i -e 's!\[\[GettingStartedBrowserGuide|Getting started with Siesta in browser environment\]\]![Getting started with Siesta in browser environment](https://bryntum.github.io/siesta/docs/modules/_src_guides_getting_started_browser_getting_started_browser_.html#gettingstartedbrowserguide)!' "README.md"


echo ">> Starting docs generation with typedoc"

npx typedoc \
    --readme "resources/docs_src/README.md" \
    --includes 'src/guides' \
    --media 'src/guides' \
    --out docs \
    --exclude 'tests/**/*' --exclude 'bin/**/*' --exclude 'examples/**/*' \
    --exclude 'src/iterator/**/*' \
    --excludeNotDocumented --listInvalidSymbolLinks \
    --theme node_modules/typedoc-default-themes/bin/default/
