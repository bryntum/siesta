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

dependency_repo_is_on_released_tag ../chained-iterator
dependency_repo_is_on_released_tag ../typescript-mixin-class
dependency_repo_is_on_released_tag ../typescript-serializable-mixin
dependency_repo_is_on_released_tag ../chronograph

echo ">> Starting release"

echo ">> Performing git clean"

(cd ../.. && packages/dev-scripts/bin/gitclean.sh)

# prepare the dist for release
(
    cd ../..
    scripts/compile.sh -d
    scripts/build_sencha_tests.sh
    npx sass resources/styling
)

# restart point inside the dist
scripts/do_release.sh

echo ">> Release done, cleaning up"

git reset --hard
npx gitclean.sh
git submodule update --force

#npm i --package-lock-only
