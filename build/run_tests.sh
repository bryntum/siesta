#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# run isomorphic suite in Node
(
    node bin/siesta.js ./tests/index.js || (echo ">>Isomorphic test suite failed, target Node.js" && false)
) &

## run isomorphic suite in Chrome
#(
#    node bin/siesta.js $SIESTA_PACKAGE_ROOT_WEB_PATH/tests/index.js || (echo ">>Isomorphic test suite failed, target Chrome" && false)
#) &
#
#wait
#
## run Node-specific suite in Node
#(
#    node bin/siesta.js ./tests_nodejs/index.js || (echo ">>Node.js specific test suite failed, target Node 12" && false)
#) &
#
## run Deno-specific suite in Node
#(
#    deno run -A --no-check --unstable bin/siesta-deno.js ./tests_deno/index.js || (echo ">>Deno specific test suite failed, target Deno" && false)
#) &

wait