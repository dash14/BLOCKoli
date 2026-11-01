#!/bin/sh
# Runs `docker compose` on docker/compose.yml. In a linked worktree the project
# name, and with it the node_modules volume and the image, carries the
# worktree's name, so worktrees sharing one Docker daemon don't install into
# the same volume at once. The main checkout and CI use plain "blockoli".
set -eu

cd "$(dirname "$0")/.."

project=blockoli
git_dir=$(git rev-parse --git-dir 2>/dev/null || true)
case "$git_dir" in
  */worktrees/*)
    # Project names allow only lowercase letters, digits, "_" and "-".
    slug=$(printf '%s' "$(basename "$git_dir")" | tr 'A-Z' 'a-z' | tr -cs 'a-z0-9_-' '-' | sed -e 's/^-//' -e 's/-$//')
    project="$project-$slug"
    ;;
esac

exec docker compose -p "$project" -f docker/compose.yml "$@"
