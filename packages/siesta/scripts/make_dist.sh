#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

ignore_changes=""
name="DIST"

while getopts "in:" opt; do
    case "$opt" in
        n)  name="$OPTARG"
            ;;
        i)  ignore_changes="true"
            ;;
    esac
done

if [[ -z $ignore_changes ]]; then
    exit_if_git_repo_has_changes "$DIR/.."
fi

#--------------------------------------------------------------

DIST="$DIR/../$name"

echo ">> Making clean checkout in $DIST"

rm -rf "$DIST"

git worktree prune

git worktree add "$DIST" --no-checkout --detach

(
cd "$DIST"

git checkout HEAD

rm -rf "$DIST/.git" "$DIST/misc" "$DIST/scripts/make_dist.sh"

ln -s "$DIR/../node_modules" "node_modules"
)

