---
name: drive-android
description: Build, install, launch and drive the eckoWALLET React Native app on a real Android device or emulator over adb — screenshot, read the native view tree, tap by text or coordinate, type, simulate process death, and pull crash logs. Use when asked to run, test, screenshot or QA the Android app, reproduce a Play Console crash, or verify a native/Android change on a device (not just unit tests).
argument-hint: "[what to test / which flow]"
---

# Drive eckoWALLET on Android (adb)

Package `com.xwallet.mobile`, activity `.MainActivity`, RN 0.82 new architecture (Fabric). Everything goes through one wrapper:

```bash
.claude/skills/drive-android/scripts/adrive.sh <command> [args]
```

| Command | Purpose |
|---|---|
| `devices` / `info` | Attached devices; Android version, screen size, installed versionCode + targetSdk |
| `install <apk>` | `adb install -r -d` |
| `launch` / `stop` / `pid` | Start (prints launch time), force-stop, check if running |
| `home` / `back` / `key <KEYCODE_X>` | Hardware keys |
| `shot [file]` | Native-resolution PNG (default `/tmp/adrive/shot.png`). **Read it after every action.** |
| `ui` | One line per element with text/content-desc: `cx cy \| text \| desc \| resource-id` |
| `tap x y` / `tap-text "<label>"` | Tap device pixels, or first element whose text/desc contains the label |
| `text "<str>"` / `swipe …` / `scroll up\|down` | Type into the focused field, gestures |
| `kill-bg` | HOME then `am kill` — the OS killing the app while it's backgrounded |
| `dka on\|off` | "Don't keep activities" — activity destroyed whenever it leaves the foreground |
| `logcat-clear` / `crash` / `logcat [filters]` | Crash buffer + `ReactNativeJS:E`, `AndroidRuntime:E`, native `DEBUG:F` |

`ANDROID_SERIAL` selects a device when several are attached. Outputs go to `$ADRIVE_OUT` (default `/tmp/adrive`).

## Step 1 — Build and install

Debug (needs Metro; fastest loop):

```bash
npx react-native start --reset-cache   # in a background shell
cd android && ./gradlew :app:installDebug -PreactNativeArchitectures=arm64-v8a && cd ..
adb reverse tcp:8081 tcp:8081
.claude/skills/drive-android/scripts/adrive.sh launch
```

`-PreactNativeArchitectures=arm64-v8a` cuts the native build to one ABI for a physical arm64 phone (use `x86_64` for an emulator). Release-only bugs (minify, Hermes bytecode, no dev menu) need `assembleRelease`, which requires the release keystore — ask the owner rather than editing signing config.

## Step 2 — Drive

React Native renders real Android views, so `ui` usually exposes labels. Prefer `tap-text "Send"` over coordinates; fall back to coordinates read from `ui` (they are device pixels — no scaling). Screenshots are native resolution (1440×3120 on the Pixel 6 Pro), the same space `tap` uses. Elements without text need a `testID`/`accessibilityLabel` in the RN code to show up — report missing ones as an accessibility finding rather than adding them during QA.

After every action: `shot` → Read the PNG → confirm state before the next action.

## Reproducing lifecycle/restore crashes

Play Console crashes in `MainActivity.onCreate` usually only happen when Android restores a **killed process**. Use `kill-bg` — it reproduces them; `dka on` alone does not (the process survives, so fragment state isn't restored from a bundle the same way):

```bash
adrive.sh logcat-clear
adrive.sh launch          # go a screen or two deep (e.g. tap-text "I have an account")
adrive.sh kill-bg         # HOME + am kill → "killed in background"
adrive.sh launch
adrive.sh pid             # "not running" right after launch = it crashed
adrive.sh crash           # FATAL EXCEPTION / SIGABRT here = reproduced
```

`dka on` is still useful for activity-recreation bugs that don't need process death; always `dka off` afterwards.

## Rules

- The wallet PIN/password and seed phrase are the owner's. Ask for them each session; never store, log or screenshot them. Crop or skip seed/private-key screens.
- `ui` and `tap-text` print **every string on screen** into the transcript — never run them on seed-phrase or private-key screens; use `tap x y` from an earlier screen's layout instead. Anything passed to `text` (a PIN, a password) also lands in the transcript: use a throwaway test-wallet password, never the owner's real one.
- Money flows: follow `app-driven-pr-review/references/wallet-test-transactions.md` — own-account only, never a typed address.
- A toast, dialog or keyboard in the way is a finding: dismiss it like a user (`back`, tap its close) and note it. Never change app behavior to get past it.
- Leave developer settings as you found them (`dka off`).
- For PR-wide QA with a report, use the `app-driven-pr-review` skill, which builds on this one.
