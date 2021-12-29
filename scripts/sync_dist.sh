#!/usr/bin/env bash

# exit early if any of the commands failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

declarations=""
siesta_compile_options="-r -e -b -d"

while getopts "ds:" opt; do
    case "$opt" in
        d)  declarations="-d"
            ;;
        s)  siesta_compile_options="$OPTARG"
            ;;
    esac
done


DIR="$( cd "$( dirname "$0" )" && cd .. && pwd )"
DIST="$DIR/SIESTA_DIST"

$DIR/scripts/make_dist.sh

(
cd $DIST

echo $(pwd)

(cd packages/siesta && npx sass resources/styling)

scripts/compile.sh -s "-r"
)
