#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

BUNDLES_FOLDER="dist"

clean=""

while getopts "c" opt; do
    case "$opt" in
        c)  clean="true"
            ;;
    esac
done

echo ">> Generating & embedding bundles with Rollup"

rm -rf "$BUNDLES_FOLDER" && npx rollup -c

rsync -I -r "$BUNDLES_FOLDER"/ ./

if [[ -n $clean ]]; then
    rm -rf "$BUNDLES_FOLDER"
fi
