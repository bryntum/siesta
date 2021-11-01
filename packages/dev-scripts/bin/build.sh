#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"

declarations=""
embed_references=""

while getopts "de" opt; do
    case "$opt" in
        d)  declarations="-d"
            ;;
        e)  embed_references="true"
            declarations="-d"
            ;;
    esac
done

echo ">> Building the distribution"

npx tsc $declarations

if [[ -n $embed_references ]]; then
    echo ">> Embedding reference to declaration types for Deno"

    # we don't need to add type references for files in `bin/`
    GLOBIGNORE=@(node_modules)/**

    for filename_ts in **/!(*.d).ts?(x); do
        regexp="(.*)\.tsx?"

        if [[ $filename_ts =~ $regexp ]]; then
            filename_js="${BASH_REMATCH[1]}.js"
            filename_types=$(basename "${BASH_REMATCH[1]}.d.ts")

            awk -i inplace -v FILENAME_TYPES="$filename_types" 'BEGINFILE{printf "/// <reference types=\"./%s\" />\n",FILENAME_TYPES}{print}' $filename_js
        fi
    done

    unset GLOBIGNORE
fi

if [[ -n $declarations ]]; then
    echo ">> Removing TypeScript sources"

    # we need to remove the *.ts files everywhere, including the `bin/`
    GLOBIGNORE=@(node_modules)/**

    # delete the TypeScript sources, we provide *.d.ts files instead
    rm **/!(*.d).ts?(x)

    unset GLOBIGNORE
fi

