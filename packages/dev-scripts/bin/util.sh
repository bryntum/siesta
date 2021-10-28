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
