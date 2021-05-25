#!/usr/bin/env bash

# TODOs:
# - change the guide URL in the examples/*/README.md
# - exclude examples/*/node_modules from npm package
# - clear the *.js files from Deno example (they are gets compiled by IDE)

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

#if [[ $(git_repo_has_changes "$DIR/..") == 'true' ]]; then
#    echo ">>Repository has changes, aborting release"
#    exit 1
#fi

DIST="$DIR/../DIST"

"$DIR"/make_dist.sh

cd $DIST

# the following code is executed on the "distribution" copy
#---------------------------------------------------------------------------------

# prepare the dist
build/build.sh

build/run_tests.sh

echo "PUBLISHING"

#build/publish.sh
