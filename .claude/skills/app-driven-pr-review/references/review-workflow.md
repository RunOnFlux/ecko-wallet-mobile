# Review-at-scale workflow (Phase 1)

A ready-to-adapt Workflow script that fans out per-file review + test-case design across the changed files, then adversarially verifies findings. Use the Workflow tool. One device can't be parallelized, but the diff can.

## Prep (inline, before the Workflow)

```bash
# changed files (the plain diff 406s on big PRs)
gh api repos/<owner>/<repo>/pulls/<N>/files --paginate \
  --jq '.[] | "\(.status)\t\(.additions)\t\(.deletions)\t\(.filename)"' > results/files.tsv
git fetch origin <base>
```

Bin-pack files into weight-balanced groups by `additions+deletions` (isolate giant files into their own group so they get near-dedicated attention), and write one `results/groups/<group>.tsv` per group. Pass the base branch + results dir to the Workflow via `args`.

## Workflow script skeleton

```javascript
export const meta = {
  name: 'pr-review-design',
  description: 'Per-file review + >=2 test cases each, then adversarially verify findings',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}
const { repo, base, results, groups } = args  // pass these in

const REVIEW_SCHEMA = { type:'object', additionalProperties:false,
  required:['group','fileCount','testCaseCount','wrotePath','findingsToVerify'],
  properties:{ group:{type:'string'}, fileCount:{type:'number'}, testCaseCount:{type:'number'},
    wrotePath:{type:'string'},
    findingsToVerify:{ type:'array', items:{ type:'object', additionalProperties:false,
      required:['id','file','severity','title','claim'],
      properties:{ id:{type:'string'}, file:{type:'string'},
        severity:{type:'string',enum:['HIGH','MEDIUM']}, title:{type:'string'}, claim:{type:'string'} } } } } }
const VERDICT_SCHEMA = { type:'object', additionalProperties:false,
  required:['id','verdict','adjustedSeverity','reasoning'],
  properties:{ id:{type:'string'}, verdict:{type:'string',enum:['confirmed','refuted','uncertain']},
    adjustedSeverity:{type:'string',enum:['HIGH','MEDIUM','LOW','NONE']}, reasoning:{type:'string'} } }

const results_ = await pipeline(
  groups,                                   // ['group-00', 'group-01', ... ]
  (g) => agent(reviewPrompt(g), { label:`review:${g}`, phase:'Review', schema: REVIEW_SCHEMA }),
  (r) => (!r || !r.findingsToVerify.length) ? { r, verdicts:[] }
    : parallel(r.findingsToVerify.map(f => () =>
        agent(verifyPrompt(f), { label:`verify:${f.id}`, phase:'Verify', schema: VERDICT_SCHEMA })))
      .then(v => ({ r, verdicts: v.filter(Boolean) }))
)
return { reviews: results_.filter(Boolean) }
```

## Reviewer prompt (per group)

Tell each reviewer to:
- `cat <results>/groups/<group>.tsv` for its file list.
- For each file: `git -C <repo> diff origin/<base>...HEAD -- <path>`; summarize the real behavioral change; review for defects (React Native pitfalls: stale closures, missing effect deps, unhandled promise rejections, state-shape changes, navigation params, native module API changes, dropped null-checks; plus security/fund-risk for wallets).
- Design **>=2 test cases per file**, each `{id,title,type(device|code|manual),area,preconditions,steps,expected,edgeCaseCovered}`, at least one covering an edge/error case. Prefer `device` for files affecting visible flows of things present in the test environment; use `code`/`manual` for unreachable ones.
- **Write** the full structured result to `<results>/review-<group>.json` (use the Write tool, valid JSON).
- Return the compact summary (counts + `findingsToVerify` = HIGH/MED only).

## Verifier prompt (per HIGH/MED finding)

Default stance: **refute**. Re-read `git diff origin/<base>...HEAD -- <file>` and the current file; grep for symbol usages. `confirmed` only if the defect is genuinely substantiated; `refuted` if it's a behavior-preserving refactor / false positive; `uncertain` if only a device check settles it. Write the verdict to `<results>/verdict-<id>.json` and return it. In migrations, most "behavior change" findings refute as intentional.

## After the Workflow

Aggregate `results/review-*.json` + `results/verdict-*.json` into `results/aggregate.json` (join verdicts onto findings by id). Confirm every file has >=2 test cases. Feed the device-typed cases into Phase 2.
