#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable ** in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

release=""
docs=""

while getopts "rd" opt; do
    case "$opt" in
        r)  release="-d"
            ;;
        d)  docs="true"
            ;;
    esac
done

npx tsc $release

if [[ -n $docs ]]; then
    build/build_docs.sh
fi


if [[ -n $release ]]; then
    # we don't need to add type references for files in `bin/`
    GLOBIGNORE=@(examples|node_modules|bin)/**

    for filename_ts in **/!(*.d).ts?(x); do
        regexp="(.*)\.tsx?"

        if [[ $filename_ts =~ $regexp ]]; then
            filename_js="${BASH_REMATCH[1]}.js"
            filename_types=$(basename "${BASH_REMATCH[1]}.d.ts")

            awk -i inplace -v FILENAME_TYPES="$filename_types" 'BEGINFILE{printf "/// <reference types=\"./%s\" />\n",FILENAME_TYPES}{print}' $filename_js
        fi
    done

    # we need to remove the *.ts files everywhere, including the `bin/`
    GLOBIGNORE=@(examples|node_modules)/**

    # delete the TypeScript sources, we provide *.d.ts files instead
    rm **/!(*.d).ts?(x)

    unset GLOBIGNORE
fi


