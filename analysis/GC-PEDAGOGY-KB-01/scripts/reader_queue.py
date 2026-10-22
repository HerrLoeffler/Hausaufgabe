#!/usr/bin/env python3
"""Private, local queue for explicitly evidenced reader acquisition attempts."""
import argparse, json, sqlite3, uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "private-archive/reader-control-v2.sqlite3"
TEMPLATE = ROOT / "media/reader-auftraege-v2-20261021.jsonl"
PHASES = ("reserved", "action_observed", "download_pending", "exact_path_confirmed", "staged_and_hashed", "archived_and_journaled")
END = {"uncertain", "partial", "quarantined"}

def connect(path=DB):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(path, timeout=30)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.executescript('''CREATE TABLE IF NOT EXISTS books(reader_ref TEXT PRIMARY KEY, phases TEXT NOT NULL, source TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY, reader_ref TEXT NOT NULL, resource_key TEXT NOT NULL, owner TEXT NOT NULL, fence INTEGER NOT NULL, lease_until TEXT NOT NULL, attempt_counter INTEGER NOT NULL, state TEXT NOT NULL, provenance_type TEXT, provenance_ref TEXT, exact_path TEXT, sha256 TEXT, bytes INTEGER, UNIQUE(reader_ref,resource_key,attempt_counter));
    CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, attempt_id TEXT NOT NULL, fence INTEGER NOT NULL, state TEXT NOT NULL, at TEXT NOT NULL, detail TEXT);
    CREATE TABLE IF NOT EXISTS files(sha256 TEXT PRIMARY KEY, bytes INTEGER NOT NULL, archive_path TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS resource_files(attempt_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, reader_ref TEXT NOT NULL, resource_key TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS gates(reader_ref TEXT NOT NULL, gate TEXT NOT NULL, status TEXT NOT NULL, evidence_ref TEXT NOT NULL, PRIMARY KEY(reader_ref,gate));''')
    cols={r["name"] for r in c.execute("PRAGMA table_info(files)")}
    if "file_type" not in cols: c.execute("ALTER TABLE files ADD COLUMN file_type TEXT NOT NULL DEFAULT 'unknown'")
    if "pdf_pages" not in cols: c.execute("ALTER TABLE files ADD COLUMN pdf_pages INTEGER")
    return c

def now(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat(timespec="seconds")
def event(c, aid, fence, state, detail=None):
    c.execute("INSERT INTO events(attempt_id,fence,state,at,detail) VALUES(?,?,?,?,?)", (aid,fence,state,iso(now()),detail))

def seed(path=DB, template=TEMPLATE):
    c=connect(path); n=0
    with open(template, encoding="utf-8") as f, c:
        for line in f:
            x=json.loads(line); c.execute("INSERT OR IGNORE INTO books VALUES(?,?,?)", (x["reader_ref"],json.dumps(x["phases"],sort_keys=True),line.strip())); n += c.execute("SELECT changes()").fetchone()[0]
    return n

def claim(reader_ref, resource_key, owner, lease_seconds=900, path=DB):
    c=connect(path)
    c.execute("BEGIN IMMEDIATE")
    with c:
        expired=False
        expired_rows=c.execute("SELECT id,fence FROM attempts WHERE reader_ref=? AND state NOT IN ('uncertain','partial','quarantined','archived_and_journaled') AND lease_until<=?",(reader_ref,iso(now()))).fetchall()
        for old in expired_rows:
            c.execute("UPDATE attempts SET state='uncertain' WHERE id=?",(old["id"],)); event(c,old["id"],old["fence"],"uncertain","lease expired; external action not repeated")
        if expired_rows:
            expired=True
            row=None
        else:
            live=c.execute("SELECT id FROM attempts WHERE reader_ref=? AND state NOT IN ('uncertain','partial','quarantined','archived_and_journaled') AND lease_until>? LIMIT 1",(reader_ref,iso(now()))).fetchone()
            if live: raise ValueError("book already has an active collector claim")
            row=c.execute("SELECT * FROM attempts WHERE reader_ref=? AND resource_key=? ORDER BY attempt_counter DESC LIMIT 1",(reader_ref,resource_key)).fetchone()
        if row and not expired:
            if row["state"] in END or row["state"] == "archived_and_journaled": raise ValueError("resource already has a terminal attempt; resolve it explicitly")
            raise ValueError("resource already claimed")
        if expired:
            # Commit this safety state before reporting the failed claim.
            pass
        else:
            fence=c.execute("SELECT COALESCE(MAX(fence),0)+1 FROM attempts WHERE reader_ref=? AND resource_key=?",(reader_ref,resource_key)).fetchone()[0]
            count=c.execute("SELECT COALESCE(MAX(attempt_counter),0)+1 FROM attempts WHERE reader_ref=? AND resource_key=?",(reader_ref,resource_key)).fetchone()[0]
            aid=uuid.uuid4().hex; until=iso(now()+timedelta(seconds=lease_seconds))
            c.execute("INSERT INTO attempts(id,reader_ref,resource_key,owner,fence,lease_until,attempt_counter,state) VALUES(?,?,?,?,?,?,?,'reserved')",(aid,reader_ref,resource_key,owner,fence,until,count)); event(c,aid,fence,"reserved")
    if expired: raise ValueError("expired attempt marked uncertain; inspect evidence before any new attempt")
    return dict(attempt_id=aid,reader_ref=reader_ref,resource_key=resource_key,owner=owner,fencing_token=fence,attempt_counter=count,lease_until=until,state="reserved")

def heartbeat(aid, owner, fence, lease_seconds=900, path=DB):
    if lease_seconds < 1: raise ValueError("lease duration must be positive")
    c=connect(path); c.execute("BEGIN IMMEDIATE")
    until=iso(now()+timedelta(seconds=lease_seconds))
    with c:
        row=c.execute("SELECT * FROM attempts WHERE id=?",(aid,)).fetchone()
        if not row or row["owner"]!=owner or row["fence"]!=int(fence) or row["state"] in END|{"archived_and_journaled"} or datetime.fromisoformat(row["lease_until"])<=now(): raise ValueError("stale, expired, terminal, or unknown claim")
        c.execute("UPDATE attempts SET lease_until=? WHERE id=?",(until,aid))
        event(c,aid,int(fence),"lease_extended",until)
    return until

def _mapping_correction(ref, path, aid, reader_ref, old_key, new_key, source):
    if not ref or Path(ref).is_absolute(): raise ValueError("mapping correction evidence reference must be relative")
    root=(Path(path).parent/"evidence").resolve(); proof=(root/ref).resolve()
    try: proof.relative_to(root)
    except ValueError: raise ValueError("mapping correction evidence must stay inside private evidence directory")
    if not proof.is_file(): raise ValueError("mapping correction evidence artefact does not exist")
    try: data=json.loads(proof.read_text(encoding="utf-8"))
    except (OSError,json.JSONDecodeError) as e: raise ValueError("invalid mapping correction evidence JSON") from e
    if data.get("schema")!="reader_mapping_correction_v1" or data.get("attempt_id")!=aid or data.get("reader_ref")!=reader_ref or data.get("from_resource_key")!=old_key or data.get("to_resource_key")!=new_key or data.get("confirmed") is not True:
        raise ValueError("mapping correction evidence does not match attempt and old/new resource keys")
    if not isinstance(data.get("reason"),str) or not data["reason"].strip() or not data.get("source_tab_id") or not data.get("observed_offer_url"):
        raise ValueError("mapping correction evidence requires a reason and observed UI source")
    if not isinstance(data.get("exact_path"),str) or Path(data["exact_path"]).resolve()!=Path(source).resolve():
        raise ValueError("mapping correction evidence exact_path mismatch")
    return data

def reconcile_completed(aid, owner, fence, reader_ref, resource_key, source, provenance_ref, path=DB, lease_seconds=300, mapping_correction_ref=None):
    """Reconcile one already-completed external download without creating an attempt."""
    from reader_ingest import PROOF_TYPES, PROVENANCE, read_proof
    src=Path(source)
    if not src.is_absolute() or not src.is_file(): raise ValueError("source must be an existing explicit absolute file path")
    if not 1<=lease_seconds<=600: raise ValueError("reconcile lease must be between 1 and 600 seconds")
    c=connect(path); c.execute("BEGIN IMMEDIATE")
    until=iso(now()+timedelta(seconds=lease_seconds))
    with c:
        row=c.execute("SELECT * FROM attempts WHERE id=?",(aid,)).fetchone()
        if not row or row["owner"]!=owner or row["fence"]!=int(fence) or row["reader_ref"]!=reader_ref:
            raise ValueError("attempt identity, owner, or fencing token does not match")
        if row["state"]!="download_pending" or datetime.fromisoformat(row["lease_until"])>now():
            raise ValueError("only an expired download_pending attempt can be reconciled")
        latest=c.execute("SELECT MAX(attempt_counter) FROM attempts WHERE reader_ref=? AND resource_key=?",(reader_ref,row["resource_key"])).fetchone()[0]
        if latest!=row["attempt_counter"]: raise ValueError("a successor attempt exists; reconciliation is fenced")
        other=c.execute("SELECT 1 FROM attempts WHERE reader_ref=? AND id!=? AND state NOT IN ('uncertain','partial','quarantined','archived_and_journaled') AND lease_until>? LIMIT 1",(reader_ref,aid,iso(now()))).fetchone()
        if other: raise ValueError("another collector has an active lease for this book")
        old_key=row["resource_key"]
        corrected=resource_key!=old_key
        correction=None
        if corrected:
            if not mapping_correction_ref: raise ValueError("mapping correction evidence is required")
            if c.execute("SELECT 1 FROM attempts WHERE reader_ref=? AND resource_key=?",(reader_ref,resource_key)).fetchone():
                raise ValueError("corrected resource key already has an attempt")
            if c.execute("SELECT 1 FROM resource_files WHERE reader_ref=? AND resource_key=?",(reader_ref,resource_key)).fetchone():
                raise ValueError("corrected resource key already has archived content")
            correction=_mapping_correction(mapping_correction_ref,path,aid,reader_ref,old_key,resource_key,src)
        elif mapping_correction_ref:
            raise ValueError("mapping correction evidence was supplied without a resource-key change")
        # The download proof names the intended key; a separate correction artefact
        # preserves and justifies any change from the originally claimed key.
        if not provenance_ref or Path(provenance_ref).is_absolute(): raise ValueError("provenance reference must be relative")
        evidence_root=(Path(path).parent/"evidence").resolve()
        proof_path=(evidence_root/provenance_ref).resolve()
        try: proof_path.relative_to(evidence_root)
        except ValueError: raise ValueError("provenance must stay inside private evidence directory")
        try: proof_data=json.loads(proof_path.read_text(encoding="utf-8"))
        except (OSError,json.JSONDecodeError) as e: raise ValueError("private download evidence artefact does not exist or is invalid") from e
        evidence_type=proof_data.get("evidence_type")
        provenance_type=next((k for k,v in PROOF_TYPES.items() if v==evidence_type),None)
        if provenance_type not in PROVENANCE: raise ValueError("unsupported provenance event type")
        read_proof(provenance_ref,path,aid,reader_ref,resource_key,src,provenance_type)
        if corrected:
            detail=json.dumps({"from_resource_key":old_key,"to_resource_key":resource_key,"evidence_ref":mapping_correction_ref,"reason":correction["reason"]},sort_keys=True)
            event(c,aid,int(fence),"reconcile_mapping_correction",detail)
            c.execute("UPDATE attempts SET resource_key=? WHERE id=?",(resource_key,aid))
        c.execute("UPDATE attempts SET lease_until=? WHERE id=?",(until,aid))
        event(c,aid,int(fence),"late_download_proof_reconciled",json.dumps({"provenance_ref":provenance_ref,"exact_path":str(src),"lease_until":until},sort_keys=True))
    return until

def transition(aid, owner, fence, state, provenance_type=None, provenance_ref=None, path=DB):
    if state not in PHASES[1:] + tuple(END): raise ValueError("invalid state")
    c=connect(path); c.execute("BEGIN IMMEDIATE")
    with c:
        row=c.execute("SELECT * FROM attempts WHERE id=?",(aid,)).fetchone()
        if not row or row["owner"] != owner or row["fence"] != int(fence) or row["state"] != PHASES[PHASES.index(row["state"])] or datetime.fromisoformat(row["lease_until"]) <= now(): raise ValueError("stale, expired, or unknown claim")
        if state not in END and PHASES.index(state) != PHASES.index(row["state"])+1: raise ValueError("transition must advance exactly one phase")
        c.execute("UPDATE attempts SET state=?,provenance_type=COALESCE(?,provenance_type),provenance_ref=COALESCE(?,provenance_ref) WHERE id=?",(state,provenance_type,provenance_ref,aid)); event(c,aid,int(fence),state,provenance_ref)
    return state

def main():
    p=argparse.ArgumentParser(description=__doc__); s=p.add_subparsers(dest="cmd",required=True)
    q=s.add_parser("seed"); q.add_argument("--template",type=Path,default=TEMPLATE); q.add_argument("--db",type=Path,default=DB)
    q=s.add_parser("claim"); q.add_argument("reader_ref"); q.add_argument("resource_key"); q.add_argument("--owner",required=True); q.add_argument("--lease-seconds",type=int,default=900); q.add_argument("--db",type=Path,default=DB)
    q=s.add_parser("transition"); q.add_argument("attempt_id"); q.add_argument("state"); q.add_argument("--owner",required=True); q.add_argument("--fence",required=True,type=int); q.add_argument("--provenance-type"); q.add_argument("--provenance-ref"); q.add_argument("--db",type=Path,default=DB)
    q=s.add_parser("heartbeat"); q.add_argument("attempt_id"); q.add_argument("--owner",required=True); q.add_argument("--fence",required=True,type=int); q.add_argument("--lease-seconds",type=int,default=900); q.add_argument("--db",type=Path,default=DB)
    q=s.add_parser("reconcile-completed"); q.add_argument("attempt_id"); q.add_argument("reader_ref"); q.add_argument("resource_key"); q.add_argument("path",type=Path); q.add_argument("provenance_ref"); q.add_argument("--owner",required=True); q.add_argument("--fence",required=True,type=int); q.add_argument("--mapping-correction-ref"); q.add_argument("--lease-seconds",type=int,default=300); q.add_argument("--db",type=Path,default=DB)
    a=p.parse_args()
    try:
        if a.cmd=="seed": print(json.dumps({"inserted":seed(a.db,a.template)}))
        elif a.cmd=="claim": print(json.dumps(claim(a.reader_ref,a.resource_key,a.owner,a.lease_seconds,a.db)))
        elif a.cmd=="heartbeat": print(json.dumps({"lease_until":heartbeat(a.attempt_id,a.owner,a.fence,a.lease_seconds,a.db)}))
        elif a.cmd=="reconcile-completed": print(json.dumps({"lease_until":reconcile_completed(a.attempt_id,a.owner,a.fence,a.reader_ref,a.resource_key,a.path,a.provenance_ref,a.db,a.lease_seconds,a.mapping_correction_ref)}))
        else: print(json.dumps({"state":transition(a.attempt_id,a.owner,a.fence,a.state,a.provenance_type,a.provenance_ref,a.db)}))
    except (ValueError, sqlite3.Error, OSError) as e: p.error(str(e))
if __name__=="__main__": main()
