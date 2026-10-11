#!/bin/sh
# Makes web icons from a square 1024 px PNG.
# Usage: sh make-icons.sh icon-1024.png [out-dir]
set -e
src="$1"; out="${2:-icons}"
case "$src" in -h|--help) echo "usage: sh make-icons.sh icon-1024.png [out-dir]"; exit 0;; esac
[ -f "$src" ] || { echo "usage: sh make-icons.sh icon-1024.png [out-dir]"; exit 1; }
command -v sips >/dev/null || { echo "make-icons.sh needs macOS sips"; exit 1; }
w="$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')"
h="$(sips -g pixelHeight "$src" | awk '/pixelHeight/ {print $2}')"
[ "$w" = "$h" ] || { echo "make-icons.sh needs a square PNG (got ${w}x${h})"; exit 1; }
[ "${w:-0}" -ge 512 ] || { echo "make-icons.sh wants a 1024 px source (got ${w}px wide)"; exit 1; }
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
