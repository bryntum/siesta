#!/usr/bin/env bash

# exit early if any of the commands failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

(
    cd packages/chained-iterator
    echo ""
    echo "------------------------------------------"
    echo "Compiling [chained-iterator]"
    npx tsc
)

(
    cd packages/typescript-mixin-class
    echo ""
    echo "------------------------------------------"
    echo "Compiling [typescript-mixin-class]"
    npx tsc
)

(
    cd packages/typescript-serializable-mixin
    echo ""
    echo "------------------------------------------"
    echo "Compiling [typescript-serializable-mixin]"
    npx tsc
)

(
    cd packages/chronograph
    echo ""
    echo "------------------------------------------"
    echo "Compiling [chronograph]"
    npx tsc
)

(
    cd packages/siesta
    echo ""
    echo "------------------------------------------"
    echo "Compiling [siesta]"
    npx tsc
)
