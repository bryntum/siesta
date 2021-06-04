#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

if [[ -z "$V" ]]; then
    echo ">> No value for V env variable"
    exit 1
fi

# bump version in distribution - won't be reflected in main repo, since "make_dist" removes the ".git"
npm version $V

node -e "require('./build/changelog.cjs').updateVersion()"

echo "/build" > .npmignore

npm publish --dry-run --access public

#---------------------------------------------------------------------------------
# post-publish steps, the following code is executed on the main repo
cd "$DIR/../.."

# bump version in main repo
npm version $V

node -e "require('./build/changelog.cjs').updateVersionAndStartNew()"

git add CHANGELOG.md
git commit -m "Updated changelog"

git push origin HEAD --tags

build/publish_docs.sh "$DIST/docs"
