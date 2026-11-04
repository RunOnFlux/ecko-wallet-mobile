#!/usr/bin/env python3
"""
Deterministically build a self-contained HTML PR-test report from JSON artifacts.

Usage:
    python3 gen_report.py <results_dir> <screenshots_dir> <out.html> [--title "..."]

Reads these files from <results_dir> (all optional except aggregate.json):

  aggregate.json
    { "files": [ { "path","status","additions","deletions","summary",
                   "findings":[ {"id","severity","title","description","suggestedFix",
                                 "verdict"?,"adjustedSeverity"?,"verdictReason"?} ],
                   "testCases":[ {"id","title","type":"device|code|manual","area",
                                  "expected","edgeCaseCovered"?,"executed"?} ] } ],
      "stats"?: {...}  # recomputed if absent }

  device-execution.json   (optional)
    { "device"?, "method"?,
      "tests":[ {"id","area","result","relatedFiles"?,"steps"?,"expected"?,"notes"?,"screenshot"?} ],
      "deviceFindings"?:[ {"title","severity","file"?,"area"?,"description","suggestedFix"?} ],
      "observations"?:[ {"title","detail"} ] }

  transactions.json       (optional)
    { "policy"?, "transactions":[ {"id","coin","fromWallet","toWallet","toAddress",
                                   "amount"|"amountFlux","approxUsd"?,"txid","result","external"} ] }

Screenshots referenced by test "screenshot" fields are looked up in <screenshots_dir>,
downscaled, and embedded as base64 (no external file dependencies).
"""
import json, os, sys, base64, io, html
from collections import defaultdict
try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow required: pip install Pillow")

if len(sys.argv) < 4:
    sys.exit(__doc__)
RES, SHOTS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TITLE = "PR Test Report"
if "--title" in sys.argv:
    TITLE = sys.argv[sys.argv.index("--title") + 1]

def load(name, default=None):
    p = os.path.join(RES, name)
    if not os.path.exists(p):
        return default
    with open(p) as f:
        return json.load(f)

def esc(s):
    return html.escape(str(s if s is not None else ""))

agg = load("aggregate.json", {"files": []})
dev = load("device-execution.json", {}) or {}
tx  = load("transactions.json", {}) or {}
files = agg.get("files", [])

# ---- stats (recompute if absent) ----
tcs = [t for f in files for t in f.get("testCases", [])]
by_type = defaultdict(int)
for t in tcs:
    by_type[t.get("type", "?")] += 1
findings = [(f["path"], x) for f in files for x in f.get("findings", [])]
by_sev = defaultdict(int)
for _, x in findings:
    by_sev[(x.get("adjustedSeverity") or x.get("severity") or "?")] += 1
verdicts = defaultdict(int)
for _, x in findings:
    verdicts[x.get("verdict", "unverified")] += 1
devtests = dev.get("tests", [])
txs = tx.get("transactions", [])

SEV = {"HIGH": "#ff4d4f", "MEDIUM": "#ffa940", "LOW": "#8c8c8c", "NONE": "#52c41a", "?": "#8c8c8c"}
TYP = {"device": "#1677ff", "code": "#722ed1", "manual": "#13c2c2"}

img_cache = {}
def img(name, maxw=560):
    if not name:
        return None
    if name in img_cache:
        return img_cache[name]
    p = os.path.join(SHOTS, name)
    if not os.path.exists(p):
        img_cache[name] = None
        return None
    im = Image.open(p).convert("RGB")
    w, h = im.size
    if w > maxw:
        im = im.resize((maxw, int(h * maxw / w)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=72)
    uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    img_cache[name] = uri
    return uri

def badge(text, color):
    return (f'<span style="display:inline-block;padding:2px 9px;border-radius:11px;font-size:11px;'
            f'font-weight:700;background:{color}22;color:{color};border:1px solid {color}55">{esc(text)}</span>')

P = []
P.append(f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(TITLE)}</title><style>
:root{{--bg:#0b0f17;--panel:#121826;--panel2:#172033;--line:#243049;--tx:#e6edf7;--mut:#8da2c0;--blue:#4d9bff}}
*{{box-sizing:border-box}}body{{margin:0;background:#0b0f17;color:var(--tx);font:15px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif}}
.wrap{{max-width:1100px;margin:0 auto;padding:28px 20px 80px}}code{{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:#0d1422;border:1px solid var(--line);border-radius:6px;padding:1px 6px;color:#bcd2f5;word-break:break-all}}
header{{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:26px;margin-bottom:20px}}header h1{{margin:0 0 6px;font-size:28px}}.sub{{color:var(--mut);font-size:14px}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:20px 0}}.card{{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}}.card .n{{font-size:28px;font-weight:800}}.card .l{{color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:.5px}}.card .d{{font-size:12px;color:var(--mut);margin-top:5px}}
section{{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:24px;margin:18px 0}}section h2{{margin:0 0 12px;font-size:21px}}.intro{{color:var(--mut);font-size:13.5px;margin:0 0 14px}}
table{{width:100%;border-collapse:collapse;font-size:13.5px}}th,td{{text-align:left;padding:9px 11px;border-bottom:1px solid var(--line);vertical-align:top}}th{{color:var(--mut);font-size:11px;text-transform:uppercase}}
.kv{{color:var(--mut);font-size:12px}}.dev{{display:grid;grid-template-columns:280px 1fr;gap:18px;border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0;background:var(--panel2)}}.dev img{{width:100%;border-radius:10px;border:1px solid var(--line)}}.dev .noimg{{aspect-ratio:9/16;border:1px dashed var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:12px;padding:10px;text-align:center}}.dev h3{{margin:0 0 6px;font-size:15px}}.dev ul{{margin:6px 0 6px 18px;padding:0}}
.finding{{border:1px solid var(--line);border-left:4px solid var(--line);border-radius:10px;padding:14px;margin:10px 0;background:var(--panel2)}}.finding h4{{margin:0 0 6px;font-size:15px}}.finding .src{{font-size:12px;color:var(--mut);margin-bottom:6px}}.finding .fix{{background:#0e1a10;border:1px solid #205030;border-radius:8px;padding:8px 11px;margin-top:9px;font-size:13px}}.finding .why{{font-size:12px;color:var(--mut);margin-top:8px;border-top:1px dashed var(--line);padding-top:7px}}
details{{border:1px solid var(--line);border-radius:10px;margin:9px 0;background:var(--panel2)}}summary{{cursor:pointer;padding:11px 15px;font-weight:600;font-size:14px}}details .body{{padding:4px 15px 13px}}.tcrow{{padding:8px 0;border-top:1px solid var(--line)}}.tcrow:first-child{{border-top:none}}.tcrow .t{{font-weight:600;font-size:13.5px}}.tcrow .m{{font-size:12px;color:var(--mut);margin-top:3px}}
.foot{{color:var(--mut);font-size:12px;text-align:center;margin-top:26px;border-top:1px solid var(--line);padding-top:16px}}
</style></head><body><div class="wrap">''')

P.append(f'<header><h1>{esc(TITLE)}</h1><div class="sub">{esc(dev.get("device",""))} · {esc(dev.get("method",""))}</div></header>')

# cards
P.append('<div class="cards">')
P.append(f'<div class="card"><div class="n">{len(files)}</div><div class="l">Files reviewed</div></div>')
P.append(f'<div class="card"><div class="n">{len(tcs)}</div><div class="l">Test cases</div><div class="d">{by_type.get("device",0)} device · {by_type.get("code",0)} code · {by_type.get("manual",0)} manual</div></div>')
P.append(f'<div class="card"><div class="n">{len(devtests)}</div><div class="l">Driven on device</div></div>')
P.append(f'<div class="card"><div class="n">{len(findings)}</div><div class="l">Findings</div><div class="d">{by_sev.get("HIGH",0)} high · {by_sev.get("MEDIUM",0)} med · {by_sev.get("LOW",0)} low</div></div>')
if verdicts.get("confirmed") is not None:
    P.append(f'<div class="card"><div class="n">{verdicts.get("confirmed",0)}</div><div class="l">Confirmed</div><div class="d">{verdicts.get("refuted",0)} refuted</div></div>')
if txs:
    ok = sum(1 for t in txs if str(t.get("result","")).startswith("SUCCESS"))
    P.append(f'<div class="card"><div class="n">{len(txs)}</div><div class="l">Internal tx</div><div class="d">{ok} OK · own→own only</div></div>')
P.append('</div>')

# transactions
if txs:
    P.append('<section><h2>Internal transactions <span class="kv">— own wallets only, never external</span></h2>')
    if tx.get("policy"):
        P.append(f'<p class="intro">{esc(tx["policy"])}</p>')
    P.append('<table><thead><tr><th>#</th><th>Coin</th><th>From → To (own)</th><th>Amount</th><th>TXID / result</th><th></th></tr></thead><tbody>')
    for t in txs:
        r = str(t.get("result", ""))
        rb = badge("SUCCESS", "#52c41a") if r.startswith("SUCCESS") else (badge("FAILED", "#ff4d4f") if r.startswith("FAILED") else (badge("REJECTED", "#ffa940") if r.startswith("REJECTED") else badge(r[:10] or "—", "#8c8c8c")))
        amt = t.get("amount", t.get("amountFlux", ""))
        P.append(f'<tr><td>{esc(t.get("id"))}</td><td>{esc(t.get("coin"))}</td>'
                 f'<td>{esc(t.get("fromWallet"))} → {esc(t.get("toWallet"))}<div class="kv">{esc(t.get("toAddress"))}</div></td>'
                 f'<td>{esc(amt)} {esc(t.get("coin"))}</td>'
                 f'<td><code>{esc(t.get("txid"))}</code><div class="kv">{esc(r)}</div></td><td>{rb}</td></tr>')
    P.append('</tbody></table></section>')

# device execution
if devtests:
    P.append(f'<section><h2>On-device execution <span class="kv">— {len(devtests)} flows</span></h2>')
    for d in devtests:
        uri = img(d.get("screenshot"))
        ih = f'<img src="{uri}">' if uri else '<div class="noimg">(no screenshot)</div>'
        rc = "#52c41a" if str(d.get("result","")).startswith("PASS") else ("#ff4d4f" if "FAIL" in str(d.get("result","")).upper() else "#1677ff")
        fb = " ".join(f'<code>{esc(os.path.basename(x))}</code>' for x in d.get("relatedFiles", [])[:6])
        steps = "".join(f"<li>{esc(s)}</li>" for s in d.get("steps", []))
        P.append(f'''<div class="dev"><div>{ih}</div><div>
<h3>{esc(d.get("id"))} · {esc(d.get("area"))} {badge(d.get("result",""), rc)}</h3>
<div>{fb}</div><ul>{steps}</ul>
<div class="kv"><b>Expected:</b> {esc(d.get("expected",""))}</div>
<div class="kv" style="margin-top:5px"><b>Notes:</b> {esc(d.get("notes",""))}</div></div></div>''')
    for f in dev.get("deviceFindings", []):
        col = SEV.get(f.get("severity"), "#8c8c8c")
        fix = f'<div class="fix"><b>Suggested action:</b> {esc(f.get("suggestedFix",""))}</div>' if f.get("suggestedFix") else ""
        P.append(f'<div class="finding" style="border-left-color:{col}"><h4>{esc(f.get("title"))} {badge(f.get("severity",""),col)} {badge("ON-DEVICE","#722ed1")}</h4>'
                 f'<div class="src"><code>{esc(f.get("file",""))}</code> · {esc(f.get("area",""))}</div><div>{esc(f.get("description",""))}</div>{fix}</div>')
    for o in dev.get("observations", []):
        P.append(f'<div class="finding" style="border-left-color:#1677ff"><h4>{esc(o.get("title"))} {badge("INFO","#1677ff")}</h4><div>{esc(o.get("detail",""))}</div></div>')
    P.append('</section>')

# notable findings (confirmed + uncertain, else all if no verdicts)
notable = [(p, x) for p, x in findings if x.get("verdict") in ("confirmed", "uncertain")]
if not notable and findings:
    notable = [(p, x) for p, x in findings if (x.get("adjustedSeverity") or x.get("severity")) in ("HIGH", "MEDIUM")]
if notable:
    P.append(f'<section><h2>Notable findings <span class="kv">— {len(notable)}</span></h2>')
    for p, x in sorted(notable, key=lambda e: 0 if (e[1].get("adjustedSeverity") or e[1].get("severity")) == "HIGH" else 1):
        sev = x.get("adjustedSeverity") or x.get("severity"); col = SEV.get(sev, "#8c8c8c")
        vb = badge(x["verdict"].upper(), {"confirmed":"#ffa940","uncertain":"#13c2c2"}.get(x["verdict"],"#8c8c8c")) if x.get("verdict") else ""
        fix = f'<div class="fix"><b>Suggested action:</b> {esc(x.get("suggestedFix",""))}</div>' if x.get("suggestedFix") else ""
        why = f'<div class="why"><b>Verifier:</b> {esc((x.get("verdictReason") or "")[:800])}</div>' if x.get("verdictReason") else ""
        P.append(f'<div class="finding" style="border-left-color:{col}"><h4>{esc(x.get("title"))} {badge(sev,col)} {vb}</h4>'
                 f'<div class="src"><code>{esc(p)}</code></div><div>{esc(x.get("description",""))}</div>{fix}{why}</div>')
    P.append('</section>')

# full catalog grouped by directory
groups = defaultdict(list)
for f in files:
    parts = f["path"].split("/")
    groups["/".join(parts[:3]) if len(parts) > 3 else "/".join(parts[:2])].append(f)
P.append(f'<section><h2>Full test-case catalog <span class="kv">— {len(tcs)} cases / {len(files)} files</span></h2>')
for area in sorted(groups):
    gf = sorted(groups[area], key=lambda x: x["path"])
    n = sum(len(f.get("testCases", [])) for f in gf)
    P.append(f'<details><summary>{esc(area)} · {len(gf)} files · {n} tests</summary><div class="body">')
    for f in gf:
        fb = " ".join(badge((x.get("adjustedSeverity") or x.get("severity")), SEV.get((x.get("adjustedSeverity") or x.get("severity")), "#8c8c8c")) for x in f.get("findings", []))
        P.append(f'<div style="margin:12px 0 4px"><code>{esc(f["path"])}</code> <span class="kv">{esc(f.get("status",""))} +{esc(f.get("additions",0))}/-{esc(f.get("deletions",0))}</span> {fb}</div>')
        if f.get("summary"):
            P.append(f'<div class="m" style="color:var(--mut);font-size:12px;margin-bottom:5px">{esc(f["summary"][:320])}</div>')
        for t in f.get("testCases", []):
            chk = " ✓" if t.get("executed") else ""
            edge = f' · <b>Edge:</b> {esc(t.get("edgeCaseCovered"))}' if t.get("edgeCaseCovered") else ""
            P.append(f'<div class="tcrow"><div class="t">{badge(t.get("type","?"), TYP.get(t.get("type"),"#8c8c8c"))} {esc(t.get("title"))}{chk}</div>'
                     f'<div class="m"><b>Expected:</b> {esc(t.get("expected",""))}{edge}</div></div>')
    P.append('</div></details>')
P.append('</section>')

P.append(f'<div class="foot">{len(files)} files · {len(tcs)} test cases · {len(devtests)} device flows · {len(txs)} internal tx · generated by app-driven-pr-review</div>')
P.append('</div></body></html>')

with open(OUT, "w") as f:
    f.write("".join(P))
print(f"wrote {OUT} ({os.path.getsize(OUT)//1024} KB), images embedded: {sum(1 for v in img_cache.values() if v)}")
