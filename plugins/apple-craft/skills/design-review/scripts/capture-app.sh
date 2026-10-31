#!/bin/bash
# Capture a running Mac app for design review: light, dark, narrow, reduce-motion.
#
#   capture-app.sh [--no-reduce-motion] <AppName> [out-dir]   (default out-dir ./review-app)
#
# Captures the app's frontmost window only and writes to <out>/:
#   light.png, dark.png, narrow-light.png, reduce-motion.png (unless skipped)
#
# Pass --no-reduce-motion to skip the interactive Reduce Motion step.
# The step is also skipped when stdin is not a terminal.
#
# Needs Screen Recording and Accessibility permission for the terminal running
# this script (System Settings > Privacy & Security). It only switches the
# system appearance while capturing and restores it after; it never touches
# the user's installed app settings.
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then echo "usage: capture-app.sh [--no-reduce-motion] <AppName> [out-dir]"; exit 0; fi
SKIP_REDUCE=0
ARGS=()
for a in "$@"; do
  if [[ "$a" == "--no-reduce-motion" ]]; then SKIP_REDUCE=1; else ARGS+=("$a"); fi
done
APP="${ARGS[0]:?usage: capture-app.sh [--no-reduce-motion] <AppName> [out-dir]}"
OUT="./review-app"
if [[ "${#ARGS[@]}" -ge 2 ]]; then OUT="${ARGS[1]}"; fi
mkdir -p "$OUT"

ORIG="$(defaults read -g AppleInterfaceStyle 2>/dev/null || echo Light)"
ORIG_SIZE="$(osascript -e 'on run argv
tell application "System Events" to tell process (item 1 of argv) to get size of front window
end run' -- "$APP" 2>/dev/null || echo "")"
restore() {
  if [[ -n "${ORIG_SIZE:-}" ]]; then
    set -- ${ORIG_SIZE//,/}
    osascript -e 'on run argv
tell application "System Events" to tell process (item 1 of argv) to set size of front window to {(item 2 of argv) as integer, (item 3 of argv) as integer}
end run' -- "$APP" "$1" "$2" >/dev/null 2>&1 || true
  fi
  if [[ "$ORIG" == "Dark" ]]; then
    osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to true' >/dev/null
  else
    osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to false' >/dev/null
  fi
}
trap restore EXIT

set_mode() { # light|dark
  if [[ "$1" == "dark" ]]; then
    osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to true' >/dev/null
  else
    osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to false' >/dev/null
  fi
  sleep 1.5
}

win_id() {
  swift -e 'import CoreGraphics
let name = CommandLine.arguments.last
let infos = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String:Any]] ?? []
for i in infos { if (i[kCGWindowOwnerName as String] as? String) == name { print(i[kCGWindowNumber as String]!); break } }' -- "$APP"
}

grab() { # <dest> : bring app front, capture frontmost window only
  local dest="$1"
  osascript -e 'on run argv
tell application (item 1 of argv) to activate
end run' -- "$APP" >/dev/null
  sleep 0.5
  local wid
  wid="$(win_id)"
  [[ "$wid" =~ ^[0-9]+$ ]] || { echo "no on-screen window for $APP"; exit 1; }
  screencapture -l "$wid" "$dest"
  echo "wrote $dest"
}

set_mode light
grab "$OUT/light.png"

set_mode dark
grab "$OUT/dark.png"

set_mode light
osascript -e 'on run argv
tell application "System Events" to tell process (item 1 of argv) to set size of front window to {(item 2 of argv) as integer, (item 3 of argv) as integer}
end run' -- "$APP" 640 "$(osascript -e 'on run argv
tell application "System Events" to tell process (item 1 of argv) to get item 2 of (size of front window)
end run' -- "$APP")" >/dev/null
grab "$OUT/narrow-light.png"

HAVE_REDUCE=0
if [[ "$SKIP_REDUCE" == "1" ]] || ! [ -t 0 ]; then
  echo "Reduce Motion capture was skipped."
else
  echo "Reduce Motion cannot be toggled reliably from a script on recent macOS."
  printf '%s' "Please turn ON Reduce Motion in System Settings > Accessibility > Display, then press Return: "
  read -r _
  grab "$OUT/reduce-motion.png"
  HAVE_REDUCE=1
fi

restore
trap - EXIT
echo "Files written:"
if [[ "$HAVE_REDUCE" == "1" ]]; then
  printf '%s\n' "$OUT/light.png" "$OUT/dark.png" "$OUT/narrow-light.png" "$OUT/reduce-motion.png"
else
  printf '%s\n' "$OUT/light.png" "$OUT/dark.png" "$OUT/narrow-light.png"
fi
