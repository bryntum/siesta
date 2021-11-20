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


DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

(
    cd packages/chained-iterator
    echo ""
    echo "------------------------------------------"
    echo "Compiling [chained-iterator]"
    npx build.sh $declarations
)

(
    cd packages/typescript-mixin-class
    echo ""
    echo "------------------------------------------"
    echo "Compiling [typescript-mixin-class]"
    npx build.sh $declarations
)

(
    cd packages/typescript-serializable-mixin
    echo ""
    echo "------------------------------------------"
    echo "Compiling [typescript-serializable-mixin]"
    npx build.sh $declarations

    if [[ -n $declarations ]]; then
        scripts/tweak_dts.sh
    fi
)

(
    cd packages/chronograph
    echo ""
    echo "------------------------------------------"
    echo "Compiling [chronograph]"
    npx build.sh $declarations || true
)

(
    cd packages/siesta
    echo ""
    echo "------------------------------------------"
    echo "Compiling [siesta]"
    if [[ -n $siesta_compile_options ]];
    then
        scripts/build.sh $siesta_compile_options
    elif [[ -n $declarations  ]];
    then
        scripts/build.sh -r -e -b -d
    else
        npx tsc
    fi
)
