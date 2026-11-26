#!/usr/bin/env bash
# Stop: al terminar cada respuesta de Claude, formatea con Prettier y pasa
# ESLint --fix por todos los archivos modificados o nuevos según git
# (cubre ediciones hechas con Bash, p. ej. sed -i, que el hook PostToolUse no ve).
# Si quedan errores de ESLint, se devuelven a Claude (exit 2) una sola vez.
set -uo pipefail

input="$(cat)"
stop_hook_active="$(jq -r '.stop_hook_active // false' <<<"$input")"

project_dir="$(realpath "${CLAUDE_PROJECT_DIR:-$(pwd)}")"
cd "$project_dir" || exit 0
prettier="$project_dir/node_modules/.bin/prettier"
eslint="$project_dir/node_modules/.bin/eslint"

# Modificados (staged o no) + nuevos sin ignorar por .gitignore.
mapfile -t files < <(
  {
    git diff --name-only --diff-filter=d HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)

existing=()
for f in "${files[@]}"; do
  [[ -f "$f" ]] && existing+=("$f")
done
[[ ${#existing[@]} -eq 0 ]] && exit 0

if [[ -x "$prettier" ]]; then
  # --ignore-unknown salta tipos desconocidos; .prettierignore se respeta.
  if ! out="$("$prettier" --write --ignore-unknown --log-level warn "${existing[@]}" 2>&1)"; then
    if [[ "$stop_hook_active" != "true" ]]; then
      echo "Prettier no pudo formatear algunos archivos modificados:" >&2
      echo "$out" >&2
      exit 2
    fi
  fi
fi

lintable=()
for f in "${existing[@]}"; do
  case "$f" in
    *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs) lintable+=("$f") ;;
  esac
done

if [[ ${#lintable[@]} -gt 0 && -x "$eslint" ]]; then
  if ! out="$("$eslint" --fix --no-warn-ignored "${lintable[@]}" 2>&1)"; then
    # Evita bucles: si Claude ya está continuando por este hook, no bloquear otra vez.
    if [[ "$stop_hook_active" != "true" ]]; then
      echo "ESLint encontró errores en archivos modificados que hay que corregir:" >&2
      echo "$out" >&2
      exit 2
    fi
  fi
fi

exit 0
