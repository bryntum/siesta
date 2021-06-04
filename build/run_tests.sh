#!/usr/bin/env bash

# exit if any of command has failed
set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

# run isomorphic suite in Node
(
    node bin/siesta.js ./tests/index.js --no-color || (echo ">>Isomorphic test suite failed, target Node.js" && false)
) & P1=$!

# run isomorphic suite in Chrome
(
    node bin/siesta.js $SIESTA_PACKAGE_ROOT_WEB_PATH/tests/index.js --no-color || (echo ">>Isomorphic test suite failed, target Chrome" && false)
) & P2=$!

wait $P1
if [[ "$?" != '0' ]]; then
    exit 1
fi

wait $P2
if [[ "$?" != '0' ]]; then
    exit 1
fi

# run Node-specific suite in Node
(
    node bin/siesta.js ./tests_nodejs/index.js --no-color || (echo ">>Node.js specific test suite failed, target Node 12" && false)
) & P3=$!

# run Deno-specific suite in Deno
(
    deno run -A --no-check --quiet --unstable bin/siesta-deno.js ./tests_deno/index.js --no-color || (echo ">>Deno specific test suite failed, target Deno" && false)
) & P4=$!

wait $P3
if [[ "$?" != '0' ]]; then
    exit 1
fi

wait $P4
if [[ "$?" != '0' ]]; then
    exit 1
fi
