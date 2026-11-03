#!/usr/bin/env bash
# adrive.sh — drive the eckoWALLET Android app on a real device/emulator over adb.
# Usage: adrive.sh <command> [args...]   (run `adrive.sh help` for the list)
# Device: $ANDROID_SERIAL if set, else the single attached device.
set -euo pipefail

PKG="${APP_PKG:-com.xwallet.mobile}"
ACTIVITY="${APP_ACTIVITY:-.MainActivity}"
OUT_DIR="${ADRIVE_OUT:-/tmp/adrive}"
# Screenshots and UI dumps can contain wallet data: keep them owner-only.
mkdir -p "$OUT_DIR" && chmod 700 "$OUT_DIR"

pick_serial() {
  if [ -n "${ANDROID_SERIAL:-}" ]; then return; fi
  local devs
  devs=$(adb devices | awk 'NR>1 && $2=="device" {print $1}')
  local n
  n=$(printf '%s\n' "$devs" | grep -c . || true)
  if [ "$n" -eq 0 ]; then echo "no device attached (adb devices)" >&2; exit 2; fi
  if [ "$n" -gt 1 ]; then echo "several devices; set ANDROID_SERIAL to one of:" >&2; printf '%s\n' "$devs" >&2; exit 2; fi
  export ANDROID_SERIAL="$devs"
}

a() { adb "$@"; }

# Dump the view hierarchy and print one line per element that has text or a
# content-desc: "<cx> <cy> | text | content-desc | resource-id". cx/cy are the
# bounds centre in device pixels — pass them straight to `tap`.
ui_dump() {
  a shell uiautomator dump /sdcard/adrive-ui.xml >/dev/null
  a exec-out cat /sdcard/adrive-ui.xml > "$OUT_DIR/ui.xml"
  a shell rm -f /sdcard/adrive-ui.xml   # don't leave screen text on shared storage
  python3 -I - "$OUT_DIR/ui.xml" <<'PY'
import re, sys, xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
for n in root.iter('node'):
    t, d, r = n.get('text', ''), n.get('content-desc', ''), n.get('resource-id', '')
    if not (t or d): continue
    x1, y1, x2, y2 = map(int, re.findall(r'\d+', n.get('bounds')))
    print(f"{(x1+x2)//2} {(y1+y2)//2} | {t} | {d} | {r}")
PY
}

# Tap the first element whose text or content-desc contains $1 (case-insensitive).
tap_text() {
  local needle="$1" line
  line=$(ui_dump | awk -v n="$needle" 'BEGIN{IGNORECASE=1} index(tolower($0), tolower(n)) {print; exit}')
  if [ -z "$line" ]; then echo "no element matching '$needle'" >&2; exit 1; fi
  set -- $line
  a shell input tap "$1" "$2"
  echo "tapped ($1,$2): $line"
}

cmd="${1:-help}"; shift || true
[ "$cmd" = help ] || [ "$cmd" = devices ] || pick_serial

case "$cmd" in
  devices)  adb devices -l ;;
  info)     echo "serial=$ANDROID_SERIAL android=$(a shell getprop ro.build.version.release) sdk=$(a shell getprop ro.build.version.sdk)";
            a shell wm size; a shell wm density
            a shell dumpsys package "$PKG" | grep -E 'versionName|versionCode|targetSdk' | head -3 || echo "$PKG not installed" ;;
  install)  a install -r -d "${1:?apk path}" ;;
  launch)   a shell am start -W -n "$PKG/$ACTIVITY" | grep -E 'Status|TotalTime|Error' ;;
  stop)     a shell am force-stop "$PKG" ;;
  home)     a shell input keyevent KEYCODE_HOME ;;
  back)     a shell input keyevent KEYCODE_BACK ;;
  # Simulate the OS killing the app in the background (low memory), which is
  # what triggers saved-state restore on next launch. App must be backgrounded.
  kill-bg)  a shell input keyevent KEYCODE_HOME; sleep 1; a shell am kill "$PKG";
            if a shell pidof "$PKG" >/dev/null; then echo "still running (was it foreground?)"; else echo "killed in background"; fi ;;
  # "Don't keep activities" developer option: every activity is destroyed when
  # it leaves the foreground — the fastest repro for state-restore crashes.
  dka)      case "${1:?on|off}" in on) v=1;; off) v=0;; *) echo "on|off" >&2; exit 1;; esac
            a shell settings put global always_finish_activities "$v"; echo "always_finish_activities=$v" ;;
  shot)     f="${1:-$OUT_DIR/shot.png}"; a exec-out screencap -p > "$f"; echo "$f" ;;
  tap)      a shell input tap "${1:?x}" "${2:?y}" ;;
  tap-text) tap_text "${1:?text}" ;;
  # adb joins args and the device sh re-parses them, so single-quote for the
  # remote shell (' → '\'') and encode spaces as %s for `input text`. ASCII only.
  text)     q=$(printf '%s' "${1:?text}" | sed -e "s/'/'\\\\''/g" -e 's/ /%s/g')
            a shell "input text '$q'" ;;
  key)      a shell input keyevent "${1:?KEYCODE_...}" ;;
  swipe)    a shell input swipe "${1:?x1}" "${2:?y1}" "${3:?x2}" "${4:?y2}" "${5:-300}" ;;
  scroll)   case "${1:-down}" in down) a shell input swipe 720 2300 720 900 300;; up) a shell input swipe 720 900 720 2300 300;; esac ;;
  ui)       ui_dump ;;
  pid)      a shell pidof "$PKG" || echo "not running" ;;
  logcat-clear) a logcat -c ;;
  logcat)   a logcat -d -v time "${@:-*:W}" | tail -n "${LINES_OUT:-200}" ;;
  # Crashes since the last logcat-clear: Java FATAL EXCEPTION, native aborts, RN JS errors.
  crash)    a logcat -d -b crash -v time | tail -n 80
            a logcat -d -v time ReactNativeJS:E AndroidRuntime:E DEBUG:F libc:F '*:S' | tail -n 60 ;;
  help|*)   sed -n '2,4p' "$0"; echo
            echo "commands: devices info install <apk> launch stop home back kill-bg dka on|off"
            echo "          shot [file] tap x y tap-text <text> text <str> key <KEYCODE> swipe x1 y1 x2 y2 [ms]"
            echo "          scroll up|down ui pid logcat-clear logcat [filters] crash" ;;
esac
