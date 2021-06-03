#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

exit_if_git_repo_has_changes "$DIR/.."

DIST="$DIR/../DIST"

echo ">> Making clean checkout in $DIST"

rm -rf "$DIST"

git worktree prune

git worktree add "$DIST" --no-checkout --detach

(
cd "$DIST"

git checkout HEAD

rm -rf "$DIST/.git" "$DIST/build/make_dist.sh"

ln -s "$DIR/../node_modules" "node_modules"
)

