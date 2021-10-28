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


DIST="$DIR/../DIST"

echo ">> Starting release"

"$DIR"/make_dist.sh

cd $DIST

# the following code is executed on the "distribution" copy
#---------------------------------------------------------------------------------

# prepare the dist for release
scripts/build.sh -r -d -e


# restart point inside the dist
scripts/do_release.sh

