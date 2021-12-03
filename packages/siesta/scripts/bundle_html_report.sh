#!/usr/bin/env bash

# TODO
# right now, the bundle size for html report is pretty much the same as for the main distribution
# somehow the launcher code is pulled in
# need to reduce it, not critical though

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

BUNDLES_FOLDER="dist_html_report"

clean=""

while getopts "c" opt; do
    case "$opt" in
        c)  clean="true"
            ;;
    esac
done

echo ">> Generating & embedding HTML report bundles with Rollup"

rm -rf "$BUNDLES_FOLDER" && npx rollup -c htmlreport.rollup.config.js

rm -rf "./resources/html_report/dist/"

rsync -I -r "$BUNDLES_FOLDER"/ ./resources/html_report/dist/

if [[ -n $clean ]]; then
    rm -rf "$BUNDLES_FOLDER"
fi
