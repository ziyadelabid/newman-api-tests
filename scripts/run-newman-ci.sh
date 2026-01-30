#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-4444}"
export TOKEN_SECRET="${TOKEN_SECRET:-dev-secret}"

node dist/main.js &
API_PID=$!

cleanup() {
  kill "$API_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Intentionally flaky by default: Jenkins/Newman may hit the API before it's ready.
if [[ "${WAIT_FOR_API:-0}" == "1" ]]; then
  for _ in $(seq 1 50); do
    if curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done
fi

pnpm -s run newman:run

