#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
DOCS="$1"

if [[ -z $DOCS ]]; then
    echo ">> No path to docs given"

    exit 1
fi

DIST_DOCS="$DIR/../DIST_DOCS"

rm -rf "$DIST_DOCS"

git worktree prune

git worktree add "$DIST_DOCS" gh-pages

cd $DIST_DOCS

# the following happens inside the docs checkout dir
#------------------------------------

git pull

rm -rf "$DIST_DOCS/docs"

cp -r "$DOCS" "$DIST_DOCS/docs"

git add -A || true

git commit -a -m "Docs updated" || true

git push

git worktree remove "$DIST_DOCS"

echo ">> Successfully updated github pages"
