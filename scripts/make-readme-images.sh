#!/bin/bash
# Builds the app, starts it on a spare port, renders every README image, then stops it.
# Run from the repo folder: ./scripts/make-readme-images.sh
set -eu
cd "$(dirname "$0")/.."
PORT=3917
npx next build >/dev/null
npx next start -p "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -sf "http://localhost:$PORT/gallery" >/dev/null && break; sleep 1; done
node scripts/make-readme-images.mjs "http://localhost:$PORT"
