# Android 16 Target + Play Console Crash Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the Play policy block (target API 36 by 31 Aug 2026) and fix the production crashes reported for build 201 (1.20.0), plus give the repo skills for driving the app on a real Android device.

**Architecture:** Native Android config + one-line Activity fix + a native library bump. Verification is on-device (Pixel 6 Pro, Android 17, serial `1B291FDEE0098X`) via adb, because the crashes are lifecycle/native and have no JS unit-test surface.

**Tech Stack:** React Native 0.82 (new arch, Hermes), Gradle 8.14.1, AGP from RN 0.82, react-native-screens 4.18, react-native-safe-area-context 5.5.2 → 5.11.1, adb.

**Spec:** Play Console screenshots (2026-11-03): policy "App must target Android 16 (API level 36) or higher", crashes `MainActivity.onCreate` `Fragment$InstantiationException` (49 events / 16 users), `ExceptionsManagerModule.reportException` `JavascriptException` (2), `RNCSafeAreaViewProps::~RNCSafeAreaViewProps()` SIGABRT (1).

## Global Constraints

- `compileSdkVersion = 36`, `targetSdkVersion = 36`, `buildToolsVersion = "36.0.0"`; `minSdkVersion` stays 24.
- No change to `versionCode`/`versionName` (release bumps are done by the owner in "Build N vX" commits).
- No commit/PR attribution trailers.
- Do not change shared UI behavior to get past test obstacles; report them as findings.

## Review Focus

1. Process death while backgrounded on a non-root screen → app must relaunch without crash (the 94% crash). Pinned in Task 1 via "Don't keep activities".
2. Edge-to-edge on API 36 (opt-out removed) → header/tab bar/bottom buttons must not sit under status or nav bar. Pinned in Task 2 by screenshotting main screens.
3. Screens that mount/unmount `SafeAreaView` rapidly (navigation back/forward, modals) → no native abort. Pinned in Task 3 by navigating modal flows.
4. Bootsplash on API 36 → splash still shows and hides. Pinned in Task 2 cold-start screenshot.
5. Release (minified) build still starts → Task 2 assembles `release`-variant config parity via `assembleRelease` compile check.

---

### Task 0: Device-driving skills

**Files:**
- Create: `.claude/skills/drive-android/SKILL.md`, `.claude/skills/drive-android/scripts/adrive.sh`
- Create: `.claude/skills/app-driven-pr-review/SKILL.md` (+ `references/`, `scripts/gen_report.py`) adapted from `ZelTreZ_Mobile/.claude/skills/app-driven-pr-review`

**Interfaces:** Produces `adrive.sh <devices|install|launch|stop|kill-bg|shot|tap|text|key|swipe|ui|logcat|crash|dka on|off>`, package `com.xwallet.mobile`.

- [ ] Write `adrive.sh` (adb wrapper; serial from `$ANDROID_SERIAL` or the single attached device).
- [ ] Verify: `adrive.sh devices` lists the Pixel; `adrive.sh shot /tmp/x.png` produces a readable PNG.
- [ ] Commit.

### Task 1: Fragment$InstantiationException on restore

**Files:** Modify `android/app/src/main/java/com/xwallet/mobile/MainActivity.kt` (`onCreate`)

- [ ] Reproduce on the current build: enable "Don't keep activities" (`adrive.sh dka on`), launch, navigate past first screen, HOME, relaunch → expect crash with `Fragment$InstantiationException` in `adrive.sh crash`.
- [ ] Change `super.onCreate(savedInstanceState)` → `super.onCreate(null)` (react-native-screens documented requirement), keep `RNBootSplash.init` first.
- [ ] Rebuild, repeat repro → no crash; `dka off`.
- [ ] Commit.

### Task 2: Target API 36

**Files:** Modify `android/build.gradle:3-6`

- [ ] Set values per Global Constraints.
- [ ] `./gradlew :app:assembleDebug` and `:app:compileReleaseKotlin` succeed.
- [ ] Install, cold start, screenshot splash + home + a pushed screen + a modal; check insets.
- [ ] Commit.

### Task 3: SafeAreaView native abort

**Files:** Modify `package.json`, `package-lock.json` (`react-native-safe-area-context` → `^5.11.1`)

- [ ] `npm install react-native-safe-area-context@5.11.1`, rebuild native.
- [ ] Navigate modal/back flows repeatedly; `adrive.sh crash` shows nothing.
- [ ] Commit.

### Task 4: JavascriptException (2 events)

- [ ] No stack trace available; record as open item needing the Play Console message. No code change.

### Task 5: Whole-branch review + finish

- [ ] One fresh Opus reviewer on `git diff release...HEAD`.
- [ ] superpowers:finishing-a-development-branch.
