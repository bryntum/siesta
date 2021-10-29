#!/usr/bin/env bash

# TODOs:
# - change the guide URL in the examples/*/README.md
# - exclude examples/*/node_modules from npm package
# - clear the *.js files from Deno example (they are gets compiled by IDE)

# exit if any of command has failed
set -e
# enable ** in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

if [[ -z "$V" ]]; then
    echo ">> No value for V env variable"
    exit 1
fi

cd "$DIR/.."

exit_if_git_repo_has_changes .

echo ">> Starting release"

echo ">> Performing git clean"

npx gitclean.sh

echo ">> Preparing the distribution"
# prepare the dist for release
scripts/build.sh -r -d -e -b

# restart point inside the dist
scripts/do_release.sh

echo ">> Release done, cleaning up"

git reset --hard
npx gitclean.sh
