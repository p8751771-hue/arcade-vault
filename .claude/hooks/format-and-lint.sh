#!/usr/bin/env bash
# PostToolUse (Write|Edit|MultiEdit): formatea con Prettier y, si es JS/TS,
# pasa ESLint --fix. Los errores que queden se devuelven a Claude (exit 2).
set -uo pipefail

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file="$(jq -r '.tool_input.file_path // empty')"

[[ -z "$file" || ! -f "$file" ]] && exit 0
file="$(realpath "$file")"
project_dir="$(realpath "$project_dir")"
[[ "$file" != "$project_dir"/* ]] && exit 0

cd "$project_dir" || exit 0
prettier="$project_dir/node_modules/.bin/prettier"
eslint="$project_dir/node_modules/.bin/eslint"

if [[ -x "$prettier" ]]; then
  if ! out="$("$prettier" --write --ignore-unknown --log-level warn "$file" 2>&1)"; then
    echo "Prettier no pudo formatear $file:" >&2
    echo "$out" >&2
    exit 2
  fi
fi

case "$file" in
  *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs)
    if [[ -x "$eslint" ]]; then
      if ! out="$("$eslint" --fix --no-warn-ignored "$file" 2>&1)"; then
        echo "ESLint encontró errores en $file que hay que corregir:" >&2
        echo "$out" >&2
        exit 2
      fi
    fi
    ;;
esac

exit 0
