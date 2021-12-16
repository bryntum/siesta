#!/usr/bin/env bash

# exit if any of command has failed
set -e
shopt -s globstar

# switch to the root folder of the package
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# clear the existing `/docs` folder
rm -rf "docs"

# generate docs
echo ">> Copying and post-processing the README.md"

cp -f "resources/docs_src/README.md" "README.md"

sed -i -e 's!\[\[GettingStartedNodejsGuide|Getting started with Siesta in Node.js environment\]\]![Getting started with Siesta in Node.js environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Node_js.html)!' "README.md"
sed -i -e 's!\[\[GettingStartedDenoGuide|Getting started with Siesta in Deno environment\]\]![Getting started with Siesta in Deno environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Deno.html)!' "README.md"
sed -i -e 's!\[\[GettingStartedBrowserGuide|Getting started with Siesta in browser environment\]\]![Getting started with Siesta in browser environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_browser.html)!' "README.md"
sed -i -e 's!\[\[GettingStartedSenchaGuide|Getting started with Siesta in Sencha framework environment\]\]![Getting started with Siesta in Sencha framework environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Sencha.html)!' "README.md"


echo ">> Starting docs generation with typedoc"

npx typedoc index.ts nodejs.ts browser.ts deno.ts sencha.ts src/guides/**/*.ts \
    --out docs \
    --customCss resources/docs_src/styling.css \
    --media 'src/guides' \
    --readme "resources/docs_src/README.md" \
    --includes 'src/guides' \
    --exclude 'tests/**/*' --exclude 'bin/**/*' --exclude 'examples/**/*' \
    --excludeNotDocumented --excludeExternals \
    --categorizeByGroup false \
    --validation.invalidLink \
    --plugin typedoc-plugin-missing-exports

cp -f "resources/images/readme_header.svg" "docs/assets/"
sed -i -e 's!"\./packages/siesta/resources/images/readme_header.svg"!"./assets/readme_header.svg"!' "docs/index.html"
