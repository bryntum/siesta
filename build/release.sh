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

DIST="$DIR/../DIST"

echo ">> Starting release"

"$DIR"/make_dist.sh

cd $DIST

# the following code is executed on the "distribution" copy
#---------------------------------------------------------------------------------

echo ">>Building the distribution"

# prepare the dist for release
build/build.sh -r -d


# restart point inside the dist
build/do_release.sh

