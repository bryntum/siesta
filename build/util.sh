git_repo_has_changes() (
    (
        cd "$1"

        if git diff-index --quiet HEAD --; then
            echo 'false'
        else
            echo 'true'
        fi
    )
)


exit_if_git_repo_has_changes() (
    if [[ $(git_repo_has_changes "$1") == 'true' ]]; then
        echo ">> Repository has changes, exit"
        exit 1
    fi
)
