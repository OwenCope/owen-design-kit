#!/bin/sh
# Makes web icons from a square 1024 px PNG.
# Usage: sh make-icons.sh icon-1024.png [out-dir]
set -e
src="$1"; out="${2:-icons}"
[ -f "$src" ] || { echo "usage: sh make-icons.sh icon-1024.png [out-dir]"; exit 1; }
mkdir -p "$out"
for s in 16 32; do sips -z $s $s "$src" --out "$out/favicon-$s.png" >/dev/null; done
sips -z 180 180 "$src" --out "$out/apple-touch-icon.png" >/dev/null
sips -z 192 192 "$src" --out "$out/icon-192.png" >/dev/null
sips -z 512 512 "$src" --out "$out/icon-512.png" >/dev/null
if command -v magick >/dev/null; then magick "$out/favicon-16.png" "$out/favicon-32.png" "$out/favicon.ico"
elif command -v convert >/dev/null; then convert "$out/favicon-16.png" "$out/favicon-32.png" "$out/favicon.ico"
else echo "No ImageMagick: skipped favicon.ico (the PNGs are enough for current browsers)."; fi
cat <<HTML
Paste into <head>:
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
HTML
