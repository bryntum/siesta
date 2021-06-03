#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable ** in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

release="false"
docs="false"

while getopts "rd" opt; do
    case "$opt" in
        r)  release="true"
            ;;
        d)  docs="true"
            ;;
    esac
done

npx tsc $release

if [[ $docs == 'true' ]]; then
    build/build_docs.sh
fi


if [[ $release == 'true' ]]; then
    GLOBIGNORE=@(examples|node_modules)/**

    for filename_ts in **/!(*.d).ts?(x); do
        regexp="(.*)\.tsx?"

        if [[ $filename_ts =~ $regexp ]]; then
            filename_js="${BASH_REMATCH[1]}.js"
            filename_types="${BASH_REMATCH[1]}.d.ts"

            awk -i inplace -v FILENAME_TYPES="$filename_types" 'BEGINFILE{printf "/// <reference types=\"./%s\" />\n",FILENAME_TYPES}{print}' $filename_js
        fi
    done

    # delete the TypeScript sources, we provide *.d.ts files instead
    rm **/!(*.d).ts?(x)

    unset GLOBIGNORE
fi


