#!/usr/bin/env bash

# exit if any of command has failed
set -e
# enable **, ! in globs
shopt -s globstar extglob

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/.."

#release=""
#docs=""
#embed_references=""
#bundle=""
#
#while getopts "rdeb" opt; do
#    case "$opt" in
#        r)  release="-d"
#            ;;
#        d)  docs="true"
#            ;;
#        e)  embed_references="true"
#            ;;
#        b)  bundle="true"
#            ;;
#    esac
#done

echo ">> Building the Sencha testing app"

(
    cd tests_browser/sencha/@my-app
    npm i
    npm run build:testing
)
