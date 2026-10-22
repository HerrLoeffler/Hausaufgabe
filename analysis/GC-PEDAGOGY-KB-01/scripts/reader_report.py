#!/usr/bin/env python3
"""Export a data-minimized, one-row-per-book status report."""
import argparse, csv, json, sqlite3, sys
from pathlib import Path
from reader_queue import DB, connect

GATES=("inventory","collection","page_and_visual_review","individual_tasks_and_independent_solutions","audio_video_interactive_review","grade_school_subject_region_curriculum","didactic_transfer","pool_release")

def report(db=DB, out=None):
    c=connect(db); books=c.execute("SELECT reader_ref FROM books ORDER BY reader_ref").fetchall()
    rows=[]
    for b in books:
        ref=b["reader_ref"]; phases={g:"pending" for g in GATES}
        for g in c.execute("SELECT gate,status FROM gates WHERE reader_ref=?",(ref,)): phases[g["gate"]]=g["status"]
        counts={r["state"]:r["n"] for r in c.execute("SELECT state,COUNT(*) n FROM attempts WHERE reader_ref=? GROUP BY state",(ref,))}
        unresolved=c.execute("SELECT COUNT(*) FROM attempts WHERE reader_ref=? AND state!='archived_and_journaled'",(ref,)).fetchone()[0]
        row={"reader_ref":ref,"complete":all(v in ("complete","not_applicable") for v in phases.values()) and unresolved==0,"resources_archived":c.execute("SELECT COUNT(*) FROM resource_files WHERE reader_ref=?",(ref,)).fetchone()[0],"attempts":c.execute("SELECT COUNT(*) FROM attempts WHERE reader_ref=?",(ref,)).fetchone()[0],"unresolved_attempts":unresolved,"uncertain":counts.get("uncertain",0),"partial":counts.get("partial",0),"quarantined":counts.get("quarantined",0)}; row.update({"phase_"+k:v for k,v in phases.items()}); rows.append(row)
    fields=list(rows[0]) if rows else ["reader_ref","complete"]
    if out:
        with open(out,"w",newline="",encoding="utf-8") as f:
            w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    return rows

def main():
    p=argparse.ArgumentParser(description=__doc__); sub=p.add_subparsers(dest="cmd",required=True)
    q=sub.add_parser("export"); q.add_argument("--db",type=Path,default=DB); q.add_argument("--out",type=Path)
    q=sub.add_parser("gate",help="record an explicitly reviewed phase gate in the private DB"); q.add_argument("reader_ref"); q.add_argument("gate",choices=GATES); q.add_argument("status",choices=("complete","not_applicable","blocked")); q.add_argument("--evidence-ref",required=True); q.add_argument("--db",type=Path,default=DB)
    a=p.parse_args()
    try:
        if a.cmd=="gate":
            if not a.evidence_ref.strip(): p.error("evidence reference required")
            c=connect(a.db)
            with c: c.execute("INSERT INTO gates VALUES(?,?,?,?) ON CONFLICT(reader_ref,gate) DO UPDATE SET status=excluded.status,evidence_ref=excluded.evidence_ref",(a.reader_ref,a.gate,a.status,a.evidence_ref))
            print(json.dumps({"recorded":True,"reader_ref":a.reader_ref,"gate":a.gate,"status":a.status}))
        else:
            rows=report(a.db,a.out)
            print("Bücher vollständig: %s/125" % sum(bool(x["complete"]) for x in rows))
            print(json.dumps(rows,ensure_ascii=False) if not a.out else str(a.out))
    except (sqlite3.Error,OSError) as e: p.error(str(e))
if __name__=="__main__": main()
