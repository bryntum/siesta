#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
DOCS="$( cd "$( dirname "$1" )" && pwd )"

if [[ -z $DOCS ]]; then
    echo ">> No path to docs given"

    exit 1
fi

DIST_DOCS="$DIR/../DIST_DOCS"

rm -rf "$DIST_DOCS"

git worktree prune

git worktree add "$DIST_DOCS" gh-pages

cd $DIST_DOCS

git pull

rm -rf "$DIST_DOCS/docs"

cp -r "$DOCS" "$DIST_DOCS/docs"

git commit -a -m "Docs updated" || true

git push

git worktree remove "$DIST_DOCS"

echo ">> Successfully updated github pages"
