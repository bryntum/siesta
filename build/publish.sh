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
NEW_VERSION=$(npm version $V)

NEW_VERSION_TIME=$(node -e "require('./build/changelog.cjs').updateVersion()")

echo "/build" > .npmignore

npm publish --dry-run --access public

#---------------------------------------------------------------------------------
# post-publish steps, the following code is executed on the main repo
cd "$DIR/../.."

# update the changlelog first, so that the tag, created with `npm version`
# will point to completely correct distribution
node -e "require('./build/changelog.cjs').updateVersionAndStartNew('$NEW_VERSION', $NEW_VERSION_TIME)"

git add CHANGELOG.md
git commit -m "Updated changelog"

# bump version in main repo
npm version $V

git push origin HEAD --tags

build/publish_docs.sh "$DIR/../docs"
