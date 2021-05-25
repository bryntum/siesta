#!/usr/bin/env bash

# TODOs:
# - change the guide URL in the examples/*/README.md
# - exclude examples/*/node_modules from npm package
# - clear the *.js files from Deno example (they are gets compiled by IDE)

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
. "$DIR"/util.sh

cd "$DIR/.."

build/run_tests.sh

echo "PUBLISHING"

#build/publish.sh
