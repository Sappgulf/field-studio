#!/bin/sh
# Restart contract for the App Builder preview.
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi

mkdir -p .grok
npm run dev >.grok/dev.log 2>&1 &
echo "$!" >.grok/dev.pid
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.4
done
exit 0
