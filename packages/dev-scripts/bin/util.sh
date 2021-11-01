git_repo_has_changes() (
    (
        cd "$1"

        if [[ `git status --porcelain` ]]; then
            echo 'true'
        else
            echo 'false'
        fi
    )
)


exit_if_git_repo_has_changes() (
    if [[ $(git_repo_has_changes "$1") == 'true' ]]; then
        echo ">> Repository has changes, exit"
        exit 1
    fi
)


dependency_repo_is_on_released_tag() (
    (
        cd "$1"

        if [ ! -f "package.json" ]; then
            echo '>> `dependency_repo_is_on_released_tag` should be pointed to the package root (folder with `package.json`)'
            exit 1
        fi

        VERSION=$(node -e "require('./package.json').version")
        TAG=$(git describe --tag)

        if [[ "v$VERSION" == "$TAG" ]]; then
            dummy=1
        else
            echo ">> Package at $(pwd) has unpublished commits"
        fi
    )
)
