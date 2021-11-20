#!/usr/bin/env bash

# exit early if any of the commands failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

declarations=""

while getopts "d" opt; do
    case "$opt" in
        d)  declarations="-d"
            ;;
    esac
done


DIR="$( cd "$( dirname "$0" )" && cd .. && pwd )"
DIST="$DIR/SIESTA_DIST"

rm -rf "$DIST"
mkdir -p "$DIST"

rsync -l -I -r --exclude 'node_modules' --exclude '.git' --exclude 'SIESTA_DIST' --exclude '.idea' "./" "$DIST/"

cd "$DIST"

pnpm i
