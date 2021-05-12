#!/usr/bin/env bash

# exit if any of command has failed
set -e

# switch to the root folder of the package
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# TODOs:
# - change the guide URL in the examples/*/README.md
# - exclude examples/*/node_modules from npm package
