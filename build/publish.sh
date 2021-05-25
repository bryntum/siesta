#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

if [[ $(git_repo_has_changes "$DIR/..") == 'true' ]]; then
    echo ">>Repository has changes, aborting release"
    exit 1
fi

DIST="$DIR/../DIST"

"$DIR"/make_dist.sh

cd $DIST

# the following code is executed on the "distribution" copy
#---------------------------------------------------------------------------------

# prepare the dist
scripts/build.sh

# run isomorphic suite in Node
(
    node bin/siesta.js ./tests/index.js || (echo ">>Isomorphic test suite failed, target Node.js, aborting release" && false)
) &

# run isomorphic suite in Chrome
(
    node bin/siesta.js $SIESTA_PACKAGE_ROOT_WEB_PATH/tests/index.js || (echo ">>Isomorphic test suite failed, target Chrome, aborting release" && false)
) &

wait

# run Node-specific suite in Node
(
    node bin/siesta.js ./tests_nodejs/index.js || (echo ">>Node.js specific test suite failed, target Node 12, aborting release" && false)
) &

# run Deno-specific suite in Node
(
    deno run -A --no-check --unstable bin/siesta-deno.js ./tests_deno/index.js || (echo ">>Deno specific test suite failed, target Deno, aborting release" && false)
) &

wait

# publish
scripts/build_docs.sh

if [[ -z "$V" ]]; then
    V="patch"
fi

# bump version in distribution - won't be reflected in main repo, since "make_dist" removes the ".git"
npm version $V

node -e "require(\"./scripts/changelog.cjs\").updateVersion()"

echo "" > .npmignore

npm publish --access public

#---------------------------------------------------------------------------------
# post-publish steps, the following code is executed on the main repo
cd "$DIR/.."

# bump version in main repo
npm version $V

node -e "require(\"./scripts/changelog.cjs\").updateVersionAndStartNew()"

git add CHANGELOG.md
git commit -m "Updated changelog"

git push

# the trailing dot is required
"$DIR"/publish_docs.sh "$DIST/docs/."
