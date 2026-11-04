---
name: app-driven-pr-review
description: Use when reviewing or QA-testing an eckoWALLET pull request by driving the running React Native app on a real Android device or emulator over adb — exercising the changed user flows, optionally making safe own-account Kadena test transfers, and producing a screenshotted HTML test report.
---

# App-Driven PR Review (eckoWALLET)

Review a PR two ways and merge the results: **read the diff** (static) and **drive the running app** (dynamic) to confirm the changed flows work. Produce one self-contained HTML report.

Core principle: **design test cases at scale with parallel agents, drive the device sequentially under supervision, and generate the report deterministically.**

Device control is the `drive-android` skill (`.claude/skills/drive-android/scripts/adrive.sh`). Read its SKILL.md first.

## Workflow

```
- [ ] P0: device found, PR build installed + launched + unlocked, PR scope pulled, (wallet) accounts mapped
- [ ] P1: every changed file reviewed, >=2 test cases each, findings adversarially verified
- [ ] P2: representative device flows driven + screenshotted; crash log clean; tx log captured
- [ ] P3: deterministic HTML report generated and visually verified
```

### Phase 0 — Scout (inline)

- `adrive.sh devices` / `info` → device, Android/SDK level, installed versionCode and targetSdk.
- Build the PR branch and install it (`drive-android` Step 1). `adrive.sh logcat-clear`, then `launch`.
- Unlock: **ask the user for the PIN/password; never guess or store it.**
- PR scope: `gh pr view <N> --json files,baseRefName` or `git diff --stat origin/<base>...HEAD`. Large PRs: `gh api repos/<owner>/<repo>/pulls/<N>/files --paginate`.
- Wallet: record which Kadena accounts/chains hold balance and which are the user's own (needed for Phase 2 own-account transfers).

### Phase 1 — Review & design at scale

Only when the user has opted into multi-agent work: bin-pack changed files into groups, one reviewer agent per group (`references/review-workflow.md`). Otherwise review inline. Per file: real defects (stale closures, missing effect deps, unhandled promise rejections, Redux/state shape changes, navigation params, native module API changes), plus **≥2 test cases** tagged `device | code | manual`, including an edge/error case. Write JSON to a results dir. Adversarially verify every HIGH/MEDIUM finding with an agent whose default is to refute it.

### Phase 2 — Drive the device (inline, sequential)

Drive a **curated** subset of `device` cases: one per distinct code path, plus the edge/error cases. `adrive.sh shot <results>/shots/<id>.png` per flow; Read it after every action. For native or lifecycle changes, also run the restore repro from `drive-android` (`dka on` … `dka off`). After the run, `adrive.sh crash` must be empty — paste anything it shows into the report.

Designing 200 cases ≠ driving 200 cases. Sample by code path and **say so**.

Money flows: `references/wallet-test-transactions.md` (own-account only).

### Phase 3 — Report

```bash
python3 .claude/skills/app-driven-pr-review/scripts/gen_report.py <results_dir> <screenshots_dir> <out.html>
```

JSON contract at the top of the script. Open the HTML and eyeball it.

## Common mistakes

| Pitfall | Reality |
|---|---|
| Tapping by guessed coordinates | RN exposes native views: `adrive.sh ui` gives labels and centres in device pixels. Use `tap-text`. |
| Scaling screenshot pixels | `shot` is native resolution, same space as `tap`. No scaling. |
| Testing only a fresh launch | Most `MainActivity` crashes need process death: `dka on` or `kill-bg`. |
| Leaving "Don't keep activities" on | Always `dka off` at the end. |
| Treating any failure as a PR regression | Attribute it: failure in a file outside the diff = pre-existing/environment. |
| "Tested all N cases" | You drove a sample; say which. |
| Storing or guessing the PIN | Ask each session; never persist; never in the report. |
| Moving UI to get past an overlay | Dismiss it like a user and report it. Never change behavior during QA. |
