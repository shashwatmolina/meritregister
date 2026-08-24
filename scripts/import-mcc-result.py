#!/usr/bin/env python3
"""Import an MCC NEET-UG allotment PDF into The Merit Register.

Current parser target: MCC 2026 Round-1 provisional allotment PDF layout.
Rules:
- MBBS only.
- MCC quota exactly "All India" or "Open Seat Quota".
- Cutoff = highest AIR allotted to an institute in the exact allotted category.
- Ordinary categories only: Open -> General, OBC, EWS, SC, ST.
- PwD-specific allotted categories are intentionally excluded from ordinary cutoffs.
- Institute matching is deterministic: explicit audited alias first, then normalized
  canonical/2025 official-name substring. Unmatched institutes are never force-mapped.
"""
from __future__ import annotations
import argparse, csv, json, re, subprocess, tempfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

SOURCE_URL = "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/08/202608202078593834.pdf"
SOURCE_TITLE = "MCC NEET UG 2026 Provisional Round 1 Allotment Result"
CATEGORIES = {"Open":"General", "OBC":"OBC", "EWS":"EWS", "SC":"SC", "ST":"ST"}
ALL_CATEGORIES = ["General","OBC","EWS","SC","ST"]
ELIGIBLE_QUOTAS = {"All India", "Open Seat Quota"}


def load_js_json(path: Path, const_name: str):
    text = path.read_text(encoding="utf-8")
    m = re.search(rf"const\s+{re.escape(const_name)}\s*=\s*(.*?);\s*$", text, re.S)
    if not m:
        raise RuntimeError(f"Could not locate {const_name} in {path}")
    return json.loads(m.group(1))


def normalise(text: str) -> str:
    s = str(text or "").lower().replace("&", " and ")
    replacements = [
        (r"\binstt\.?\b", "institute"),
        (r"\bgovt\.?\b", "government"),
        (r"\bmed\.?\b", "medical"),
        (r"\bcoll\.?\b", "college"),
        (r"\ball india institute of medical sciences\b", "aiims"),
        (r"\bjawaharlal institute of postgraduate medical education and research\b", "jipmer"),
    ]
    for pattern, repl in replacements:
        s = re.sub(pattern, repl, s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def extract_tsv(pdf: Path, requested_tsv: Path | None = None):
    if requested_tsv:
        return requested_tsv, False
    tmp = tempfile.NamedTemporaryFile(prefix="mcc-allotment-", suffix=".tsv", delete=False)
    tmp.close()
    out = Path(tmp.name)
    subprocess.run(["pdftotext", "-tsv", str(pdf), str(out)], check=True)
    return out, True


def page_rows(page_num: int, words: list[tuple[float,float,float,float,str]]):
    """Reconstruct MCC table rows from pdftotext TSV word geometry."""
    if page_num < 3 or not words:
        return []
    words = sorted(words, key=lambda w: (w[1], w[0]))
    rank_words = [w for w in words if 45 <= w[0] < 90 and w[4].isdigit() and w[1] < 577]
    starts = []
    for w in words:
        x, y, _width, _height, text = w
        if x < 45 and y < 577 and text.isdigit() and any(abs(r[1]-y) <= 1.6 for r in rank_words):
            starts.append((y, int(text)))
    starts = sorted(set(starts))
    out = []
    for i, (y, sno) in enumerate(starts):
        next_y = starts[i+1][0] if i+1 < len(starts) else 577
        row_words = [w for w in words if y-1.8 <= w[1] < next_y-0.8 and w[1] < 577]
        def col(x1, x2):
            chosen = sorted((w for w in row_words if x1 <= w[0] < x2), key=lambda q: (q[1], q[0]))
            return " ".join(w[4] for w in chosen).strip()
        rank_text = col(45,90)
        rank_match = re.search(r"\d+", rank_text)
        if not rank_match:
            continue
        out.append({
            "sno": sno,
            "rank": int(rank_match.group()),
            "quota": col(90,175),
            "institute": col(175,570),
            "course": col(570,645),
            "allotted_category": re.sub(r"\s+", " ", col(645,700)).strip(),
            "candidate_category": re.sub(r"\s+", " ", col(700,770)).strip(),
            "remarks": col(770,842),
            "page": page_num,
        })
    return out


def iter_rows(tsv: Path):
    current_page = None
    words = []
    with tsv.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh, delimiter="\t")
        for rec in reader:
            if rec.get("level") != "5":
                continue
            page = int(rec["page_num"])
            if current_page is None:
                current_page = page
            if page != current_page:
                yield from page_rows(current_page, words)
                words = []
                current_page = page
            words.append((float(rec["left"]), float(rec["top"]), float(rec["width"]), float(rec["height"]), rec["text"]))
    if current_page is not None:
        yield from page_rows(current_page, words)


def build_matcher(root: Path, colleges, cutoffs25):
    by_id = {int(c["id"]): c for c in colleges}
    alias_path = root / "scripts" / "mappings" / "mcc-college-aliases-2026.json"
    alias_data = json.loads(alias_path.read_text(encoding="utf-8"))
    manual = [(normalise(x["contains"]), int(x["college_id"]), x["contains"]) for x in alias_data["aliases"]]
    for _needle, cid, raw in manual:
        if cid not in by_id:
            raise RuntimeError(f"Manual alias points to missing canonical id {cid}: {raw}")

    official_aliases = []
    for c in colleges:
        a = normalise(c["name"])
        if len(a) >= 8:
            official_aliases.append((len(a), a, int(c["id"]), "canonical"))
    for key, record in cutoffs25.items():
        if record.get("college_name"):
            a = normalise(record["college_name"])
            if len(a) >= 8:
                official_aliases.append((len(a), a, int(key), "2025-official-name"))
    official_aliases.sort(reverse=True)

    def match(institute: str):
        n = normalise(institute)
        manual_hits = [(len(needle), cid, raw) for needle, cid, raw in manual if needle in n]
        if manual_hits:
            manual_hits.sort(reverse=True)
            best_len = manual_hits[0][0]
            ids = {cid for ln, cid, _raw in manual_hits if ln == best_len}
            if len(ids) == 1:
                return next(iter(ids)), "manual-alias"
            return None, "ambiguous-manual-alias"
        hits = [(ln, cid, src) for ln, alias, cid, src in official_aliases if alias in n]
        if not hits:
            return None, "unmatched"
        best_len = hits[0][0]
        best = [h for h in hits if h[0] == best_len]
        ids = {h[1] for h in best}
        if len(ids) != 1:
            return None, "ambiguous-official-name"
        return best[0][1], best[0][2]
    return by_id, match


def js_dump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", type=Path, help="MCC allotment PDF")
    ap.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument("--tsv", type=Path, help="Reuse a pdftotext -tsv extraction")
    args = ap.parse_args()
    root = args.project_root.resolve()
    colleges = load_js_json(root/"data/colleges.js", "ALL_COLLEGES")
    cut25 = load_js_json(root/"data/aiq-cutoffs-2025.js", "CUTOFFS")
    by_id, match = build_matcher(root, colleges, cut25)
    tsv, cleanup = extract_tsv(args.pdf.resolve(), args.tsv.resolve() if args.tsv else None)

    all_rows = 0
    eligible_rows = []
    quota_counts = Counter()
    allotted_counts = Counter()
    try:
        for row in iter_rows(tsv):
            all_rows += 1
            if row["course"] == "MBBS" and row["quota"] in ELIGIBLE_QUOTAS:
                eligible_rows.append(row)
                quota_counts[row["quota"]] += 1
                allotted_counts[row["allotted_category"]] += 1
    finally:
        if cleanup:
            tsv.unlink(missing_ok=True)

    inst_rows = defaultdict(list)
    for row in eligible_rows:
        inst_rows[row["institute"]].append(row)

    mapped = {}
    unmatched = {}
    used_ids = defaultdict(list)
    for institute, rows in inst_rows.items():
        cid, method = match(institute)
        if cid is None:
            unmatched[institute] = {"rows": rows, "method": method}
        else:
            mapped[institute] = {"college_id": cid, "rows": rows, "method": method}
            used_ids[cid].append(institute)

    duplicates = {cid:names for cid,names in used_ids.items() if len(names)>1}
    if duplicates:
        detail = "\n".join(f"{cid}: {names}" for cid,names in duplicates.items())
        raise RuntimeError("Multiple MCC institute labels mapped to the same canonical id; audit required:\n" + detail)

    cutoffs = {}
    audit_matched = []
    for institute, info in mapped.items():
        cid = info["college_id"]
        rows = info["rows"]
        bycat = {c: None for c in ALL_CATEGORIES}
        ordinary = 0
        for row in rows:
            cat = CATEGORIES.get(row["allotted_category"])
            if not cat:
                continue
            ordinary += 1
            rank = row["rank"]
            bycat[cat] = max(bycat[cat] or 0, rank)
        quotas = sorted({r["quota"] for r in rows})
        rounds = {cat:{"R1":bycat[cat],"R2":None,"R3":None} for cat in ALL_CATEGORIES}
        c = by_id[cid]
        cutoffs[str(cid)] = {
            "college_name": c["name"],
            "year": 2026,
            "quota": " / ".join(quotas),
            "source": SOURCE_TITLE,
            "categories_source": SOURCE_TITLE,
            "categories_confidence": "high",
            "category_rounds": rounds,
            "round_status": {"R1":"provisional"},
            "source_urls": {"R1":SOURCE_URL},
            "methodology": "Highest AIR in MCC Round 1 for MBBS in the institute's All India/Open Seat quota, using the exact ordinary allotted category. PwD-specific allotted categories are excluded from ordinary category cutoffs."
        }
        audit_matched.append({
            "mcc_institute": institute,
            "canonical_id": cid,
            "canonical_name": c["name"],
            "match_method": info["method"],
            "quota": " / ".join(quotas),
            "all_eligible_rows": len(rows),
            "ordinary_category_rows": ordinary,
            **{f"{cat.lower()}_r1": bycat[cat] or "" for cat in ALL_CATEGORIES},
        })

    # Stable ordering: canonical id numerically.
    cutoffs = dict(sorted(cutoffs.items(), key=lambda kv:int(kv[0])))
    audit_matched.sort(key=lambda x:int(x["canonical_id"]))

    out_js = root/"data/aiq-cutoffs-2026.js"
    meta = {
        "year": 2026,
        "rounds": {
            "R1": {
                "published": True,
                "imported": True,
                "status": "provisional",
                "published_at": "2026-08-20",
                "imported_at": date.today().isoformat(),
                "discrepancy_deadline": "2026-08-21 15:59 IST",
                "source_title": SOURCE_TITLE,
                "source_url": SOURCE_URL,
                "profiles_imported": len(cutoffs),
                "note": f"Audited import complete: {len(cutoffs)} canonical college profiles. {len(unmatched)} MCC institute label(s) remain outside the canonical government-college master and are retained in the audit log. PwD-specific allotted categories are excluded from ordinary category cutoffs."
            }
        }
    }
    out_js.write_text(
        "// 2026 MCC AIQ/Open-seat cutoff dataset. Generated by scripts/import-mcc-result.py.\n"
        "// Do not hand-edit cutoff ranks; re-run the importer and inspect audit outputs instead.\n"
        f"const AIQ_2026_META = {js_dump(meta)};\n"
        f"const AIQ_CUTOFFS_2026 = {js_dump(cutoffs)};\n",
        encoding="utf-8"
    )

    audit_dir = root/"audit"; audit_dir.mkdir(exist_ok=True)
    matched_path = audit_dir/"mcc-r1-2026-matched.csv"
    fields = ["mcc_institute","canonical_id","canonical_name","match_method","quota","all_eligible_rows","ordinary_category_rows","general_r1","obc_r1","ews_r1","sc_r1","st_r1"]
    with matched_path.open("w",newline="",encoding="utf-8") as fh:
        w=csv.DictWriter(fh,fieldnames=fields);w.writeheader();w.writerows(audit_matched)

    unmatched_path = audit_dir/"mcc-r1-2026-unmatched.csv"
    ufields=["mcc_institute","match_status","quota","all_eligible_rows","general_r1","obc_r1","ews_r1","sc_r1","st_r1"]
    unmatched_rows=[]
    for institute,info in sorted(unmatched.items()):
        bycat={c:None for c in ALL_CATEGORIES}
        for row in info["rows"]:
            cat=CATEGORIES.get(row["allotted_category"])
            if cat: bycat[cat]=max(bycat[cat] or 0,row["rank"])
        unmatched_rows.append({
            "mcc_institute":institute,"match_status":info["method"],
            "quota":" / ".join(sorted({r['quota'] for r in info['rows']})),
            "all_eligible_rows":len(info["rows"]),
            **{f"{cat.lower()}_r1":bycat[cat] or "" for cat in ALL_CATEGORIES}
        })
    with unmatched_path.open("w",newline="",encoding="utf-8") as fh:
        w=csv.DictWriter(fh,fieldnames=ufields);w.writeheader();w.writerows(unmatched_rows)

    category_coverage = Counter(sum(v["category_rounds"][c]["R1"] is not None for c in ALL_CATEGORIES) for v in cutoffs.values())
    summary = {
        "source_pdf": str(args.pdf),
        "source_title": SOURCE_TITLE,
        "result_status": "provisional",
        "parsed_allotment_rows": all_rows,
        "eligible_mbbs_aiq_open_rows": len(eligible_rows),
        "quota_counts": dict(quota_counts),
        "allotted_category_counts": dict(allotted_counts),
        "unique_eligible_mcc_institutes": len(inst_rows),
        "mapped_institutes": len(mapped),
        "mapped_unique_canonical_colleges": len(used_ids),
        "unmatched_institutes": len(unmatched),
        "ordinary_category_rows": sum(1 for r in eligible_rows if r["allotted_category"] in CATEGORIES),
        "pwd_specific_rows_excluded": sum(1 for r in eligible_rows if "PwD" in r["allotted_category"]),
        "category_coverage_profile_counts": {str(k):v for k,v in sorted(category_coverage.items())},
        "output": str(out_js.relative_to(root)),
        "audit_matched": str(matched_path.relative_to(root)),
        "audit_unmatched": str(unmatched_path.relative_to(root)),
    }
    (audit_dir/"mcc-r1-2026-summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if unmatched_rows:
        print("\nUnmatched institute(s):")
        for r in unmatched_rows:
            print(" -",r["mcc_institute"])

if __name__ == "__main__":
    main()
