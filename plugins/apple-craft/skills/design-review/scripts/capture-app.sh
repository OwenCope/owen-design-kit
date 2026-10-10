#!/bin/bash
# Capture a running Mac app for design review: light, dark, narrow, reduce-motion.
#
#   capture-app.sh <AppName> [out-dir]   (default out-dir ./review-app)
#
# Captures the app's frontmost window only and writes to <out>/:
#   light.png, dark.png, narrow-light.png, reduce-motion.png
#
# Needs Screen Recording and Accessibility permission for the terminal running
# this script (System Settings > Privacy & Security). It only switches the
# system appearance while capturing and restores it after; it never touches
# the user's installed app settings.
set -euo pipefail

APP="${1:?usage: capture-app.sh <AppName> [out-dir]}"
OUT="${2:-./review-app}"
mkdir -p "$OUT"

ORIG="$(defaults read -g AppleInterfaceStyle 2>/dev/null || echo Light)"
restore() {
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
  swift -e "import CoreGraphics; let infos = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String:Any]] ?? []; for i in infos { if (i[kCGWindowOwnerName as String] as? String) == \"$APP\" { print(i[kCGWindowNumber as String]!); break } }"
}

grab() { # <dest> : bring app front, capture frontmost window only
  local dest="$1"
  osascript -e "tell application \"$APP\" to activate" >/dev/null
  sleep 0.5
  local wid
  wid="$(win_id)"
  screencapture -l "$wid" "$dest"
  echo "wrote $dest"
}

set_mode light
grab "$OUT/light.png"

set_mode dark
grab "$OUT/dark.png"

set_mode light
osascript -e "tell application \"System Events\" to tell process \"$APP\" to set size of front window to {640, (item 2 of (size of front window))}" >/dev/null
grab "$OUT/narrow-light.png"

echo "Reduce Motion cannot be toggled reliably from a script on recent macOS."
printf '%s' "Please turn ON Reduce Motion in System Settings > Accessibility > Display, then press Return: "
read -r _
grab "$OUT/reduce-motion.png"

restore
trap - EXIT
echo "Files written:"
printf '%s\n' "$OUT/light.png" "$OUT/dark.png" "$OUT/narrow-light.png" "$OUT/reduce-motion.png"
