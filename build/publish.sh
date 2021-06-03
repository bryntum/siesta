#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

if [[ -z "$V" ]]; then
    V="patch"
fi

# bump version in distribution - won't be reflected in main repo, since "make_dist" removes the ".git"
npm version $V

node -e "require('./scripts/changelog.cjs').updateVersion()"

echo "/build" > .npmignore

npm publish --access public

#---------------------------------------------------------------------------------
# post-publish steps, the following code is executed on the main repo
cd "$DIR/.."

# bump version in main repo
npm version $V

node -e "require('./scripts/changelog.cjs').updateVersionAndStartNew()"

git add CHANGELOG.md
git commit -m "Updated changelog"

VERSION=$(node -e "console.log(require('./package.json').version)")
TAG="v$VERSION"

git tag -a -m "version $VERSION" "$TAG"

git push --tags

# the trailing dot is required
"$DIR"/publish_docs.sh "$DIST/docs/."
