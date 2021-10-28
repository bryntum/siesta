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

NEW_VERSION_TIME=$(node -e "require('./scripts/changelog.cjs').updateVersion()")

echo "/scripts" > .npmignore

npm publish --access public

#---------------------------------------------------------------------------------
# post-publish steps, the following code is executed on the main repo
cd "$DIR/../.."

# update the changelog first, so that the tag, created with `npm version` below
# will point to correct revision
node -e "require('./scripts/changelog.cjs').updateVersionAndStartNew('$NEW_VERSION', $NEW_VERSION_TIME)"

git add CHANGELOG.md
git commit -m "Updated changelog"

# bump version in main repo
npm version $V

git push origin HEAD --tags

scripts/publish_docs.sh "$DIR/../docs"
