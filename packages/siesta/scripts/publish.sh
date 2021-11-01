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
NEW_VERSION=$(npm --no-git-tag-version version $V)

node -e "require('./scripts/changelog.cjs').updateVersion('$NEW_VERSION')"

git add CHANGELOG.md package.json package-lock.json
git commit -m "Updated version"

git tag "$NEW_VERSION"

echo "/scripts" > .npmignore

npm publish --access public

#---------------------------------------------------------------------------------
# post-publish steps
git push origin HEAD --tags

scripts/publish_docs.sh "./docs"
