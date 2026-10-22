#!/usr/bin/env python3
"""Hash and atomically archive one explicitly selected, provenance-backed file."""
import argparse, hashlib, json, os, shutil, sqlite3, subprocess, tempfile, wave, zipfile
from pathlib import Path, PurePosixPath
from reader_queue import DB, ROOT, connect, event, iso, now

PROVENANCE = {"supported_locator_downloadMedia_exact_path", "supported_tab_download_event_exact_path"}
PROOF_TYPES = {"supported_locator_downloadMedia_exact_path":"supported_locator_downloadMedia", "supported_tab_download_event_exact_path":"supported_tab_download_event"}
ZIP_MAX_ENTRIES=50000
ZIP_MAX_MEMBER_BYTES=128*1024*1024
ZIP_MAX_TOTAL_BYTES=512*1024*1024
ZIP_MAX_RATIO=2000

def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

def read_proof(ref, db, attempt_id, reader_ref, resource_key, source, provenance_type):
    if not ref or Path(ref).is_absolute(): raise ValueError("provenance must be a relative private evidence filename")
    evidence_root=(Path(db).parent/"evidence").resolve()
    proof_path=(evidence_root/ref).resolve()
    try: proof_path.relative_to(evidence_root)
    except ValueError: raise ValueError("evidence reference must stay inside private-archive/evidence")
    if not proof_path.is_file(): raise ValueError("private JSON provenance artefact does not exist")
    try: proof=json.loads(proof_path.read_text(encoding="utf-8"))
    except (OSError,json.JSONDecodeError) as e: raise ValueError("invalid provenance JSON artefact") from e
    expected={"schema":"reader_download_evidence_v1","attempt_id":attempt_id,"reader_ref":reader_ref,"resource_key":resource_key,"evidence_type":PROOF_TYPES.get(provenance_type)}
    if any(proof.get(k)!=v for k,v in expected.items()): raise ValueError("provenance does not match schema, attempt, resource, or event type")
    if proof.get("download_completed") is not True: raise ValueError("provenance does not confirm a completed download")
    if not isinstance(proof.get("source_tab_id"),str) or not proof["source_tab_id"].strip(): raise ValueError("provenance is missing source_tab_id")
    if not isinstance(proof.get("observed_offer_url"),str) or not proof["observed_offer_url"].strip(): raise ValueError("provenance is missing observed_offer_url")
    if not isinstance(proof.get("exact_path"),str) or Path(proof["exact_path"]).resolve()!=Path(source).resolve(): raise ValueError("provenance exact_path does not match explicit source path")
    return proof_path

def _zip_type(src):
    try:
        with zipfile.ZipFile(src) as z:
            items=z.infolist()
            if len(items)>ZIP_MAX_ENTRIES: raise ValueError("ZIP has too many entries")
            total=0
            names=set()
            for info in items:
                name=info.filename
                path=PurePosixPath(name)
                mode=(info.external_attr >> 16) & 0o170000
                if not name or "\\" in name or path.is_absolute() or ".." in path.parts or (path.parts and ":" in path.parts[0]) or mode==0o120000:
                    raise ValueError("unsafe ZIP entry path or link")
                if name in names: raise ValueError("duplicate ZIP entry name")
                names.add(name)
                if info.flag_bits & 1: raise ValueError("encrypted ZIP entries are unsupported")
                if info.file_size>ZIP_MAX_MEMBER_BYTES: raise ValueError("ZIP member exceeds size limit")
                total+=info.file_size
                if total>ZIP_MAX_TOTAL_BYTES: raise ValueError("ZIP exceeds expanded size limit")
                if info.file_size and info.file_size/max(info.compress_size,1)>ZIP_MAX_RATIO: raise ValueError("ZIP member compression ratio exceeds limit")
            bad=z.testzip()
            if bad is not None: raise ValueError("corrupt ZIP member")
            if "[Content_Types].xml" in names:
                if "word/document.xml" in names: return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                if "xl/workbook.xml" in names: return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                if "ppt/presentation.xml" in names: return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            return "application/zip"
    except (zipfile.BadZipFile, OSError, RuntimeError, EOFError) as e:
        raise ValueError("invalid or unsupported ZIP/OOXML archive") from e

def _validate_av(src, media_kind):
    ffprobe=shutil.which("ffprobe")
    if ffprobe:
        selection="a:0" if media_kind=="audio" else "v:0"
        result=subprocess.run([ffprobe,"-v","error","-select_streams",selection,"-show_entries","stream=codec_type","-of","csv=p=0",str(src)],capture_output=True,text=True,timeout=60)
        if result.returncode==0 and result.stdout.strip()==media_kind: return
        raise ValueError("media parser could not verify the expected stream")
    try:
        import av
    except ImportError as e:
        raise ValueError("unsupported audio/video: ffprobe and PyAV are unavailable") from e
    try:
        with av.open(str(src)) as container:
            streams=[s for s in container.streams if s.type==media_kind]
            if not streams: raise ValueError("media has no expected stream")
            iterator=container.decode(streams[0])
            next(iterator)
    except StopIteration as e: raise ValueError("media stream has no decodable frames") from e
    except Exception as e: raise ValueError("media parser could not verify the expected stream") from e

def detect_and_validate(src):
    if src.suffix.lower() in {".html",".htm",".crdownload",".part",".partial",".download",".tmp",".temp"}:
        raise ValueError("HTML or partial download cannot be archived as a resource")
    with open(src,"rb") as f: head=f.read(32)
    if head.startswith(b"%PDF-"):
        try:
            from pypdf import PdfReader
            pages=len(PdfReader(str(src),strict=True).pages)
        except Exception as e: raise ValueError("source is not a parseable PDF") from e
        if pages<1: raise ValueError("PDF has no pages")
        return "application/pdf",pages
    if head.startswith((b"\x89PNG\r\n\x1a\n",b"\xff\xd8\xff",b"GIF87a",b"GIF89a")) or (head.startswith(b"RIFF") and head[8:12]==b"WEBP"):
        try:
            from PIL import Image
            with Image.open(src) as image:
                kind={"PNG":"image/png","JPEG":"image/jpeg","WEBP":"image/webp","GIF":"image/gif"}.get(image.format)
                if kind is None: raise ValueError("unsupported image type")
                image.verify()
                return kind,None
        except ValueError: raise
        except Exception as e: raise ValueError("image could not be verified") from e
    if head.startswith((b"PK\x03\x04",b"PK\x05\x06",b"PK\x07\x08")) or zipfile.is_zipfile(src):
        return _zip_type(src),None
    if head.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        return "application/vnd.ms-office.ole-unparsed",None
    if len(head)>=12 and head[:4]==b"RIFF" and head[8:12]==b"WAVE":
        try:
            with wave.open(str(src),"rb") as audio:
                frames=audio.getnframes()
                if frames<1 or audio.getnchannels()<1 or audio.getsampwidth()<1 or audio.getframerate()<1: raise ValueError("WAV has no complete audio frames")
                frame_bytes=audio.getnchannels()*audio.getsampwidth()
                read=0
                while read<frames:
                    chunk=audio.readframes(min(4096,frames-read))
                    if not chunk: raise ValueError("truncated WAV audio data")
                    got=len(chunk)//frame_bytes
                    if got<1: raise ValueError("truncated WAV audio frame")
                    read+=got
                if read!=frames: raise ValueError("invalid WAV frame length")
            return "audio/wav",None
        except ValueError: raise
        except (wave.Error,EOFError,OSError) as e: raise ValueError("WAV could not be parsed") from e
    if head.startswith(b"ID3") or (len(head)>=2 and head[0]==0xff and head[1]&0xe0==0xe0):
        _validate_av(src,"audio")
        return "audio/mpeg",None
    if len(head)>=12 and head[4:8]==b"ftyp":
        _validate_av(src,"video")
        return "video/mp4",None
    if head.lstrip().lower().startswith((b"<!doctype html",b"<html",b"<?xml")):
        raise ValueError("HTML or partial download cannot be archived as a resource")
    raise ValueError("unsupported or unrecognized file type")

def ingest(attempt_id, owner, fence, reader_ref, resource_key, source, provenance_type, provenance_ref, db=DB, archive=None):
    src=Path(source)
    if not src.is_absolute() or not src.is_file(): raise ValueError("source must be an existing explicit absolute file path")
    if provenance_type not in PROVENANCE or not provenance_ref.strip(): raise ValueError("supported provenance type and private evidence reference are required")
    c=connect(db); row=c.execute("SELECT * FROM attempts WHERE id=?",(attempt_id,)).fetchone()
    if not row or row["owner"]!=owner or row["fence"]!=int(fence) or row["reader_ref"]!=reader_ref or row["resource_key"]!=resource_key: raise ValueError("attempt identity, owner, or fencing token does not match")
    read_proof(provenance_ref,db,attempt_id,reader_ref,resource_key,src,provenance_type)
    if row["state"]=="archived_and_journaled":
        if row["provenance_type"]!=provenance_type or row["provenance_ref"]!=provenance_ref or row["exact_path"]!=str(src): raise ValueError("attempt already ingested with different evidence; quarantine for review")
        linked=c.execute("SELECT COUNT(*) FROM resource_files WHERE sha256=?",(row["sha256"],)).fetchone()[0]
        info=c.execute("SELECT file_type,pdf_pages FROM files WHERE sha256=?",(row["sha256"],)).fetchone()
        return {"sha256":row["sha256"],"bytes":row["bytes"],"file_type":info["file_type"] if info else "unknown","pdf_pages":info["pdf_pages"] if info else None,"resources_linked":linked,"archived":True,"idempotent_replay":True}
    if row["state"]!="download_pending" or __import__('datetime').datetime.fromisoformat(row["lease_until"])<=now(): raise ValueError("attempt must be live and in download_pending")
    # Validate detected type before staging. Unknown and incomplete content fails closed.
    before=src.stat()
    file_type,pdf_pages=detect_and_validate(src)
    after_type=src.stat()
    if (before.st_size,before.st_mtime_ns)!=(after_type.st_size,after_type.st_mtime_ns): raise ValueError("source changed during media validation")
    h1=digest(src); after=src.stat(); h2=digest(src); final=src.stat()
    if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns) or (after.st_size,after.st_mtime_ns)!=(final.st_size,final.st_mtime_ns) or h1!=h2: raise ValueError("source changed while being read")
    target_dir=Path(archive) if archive else ROOT/"private-archive/reader-acquired-v2"
    target_dir.mkdir(parents=True,exist_ok=True); target=target_dir/h1
    if not target.exists():
        fd,tmp=tempfile.mkstemp(prefix=".reader-stage-",dir=target_dir)
        try:
            with os.fdopen(fd,"wb") as out, open(src,"rb") as inp:
                for b in iter(lambda:inp.read(1024*1024),b""): out.write(b)
                out.flush(); os.fsync(out.fileno())
            if os.path.getsize(tmp)!=before.st_size or digest(Path(tmp))!=h1: raise ValueError("staged copy failed integrity check")
            os.replace(tmp,target)
        finally:
            if os.path.exists(tmp): os.unlink(tmp)
    if digest(target)!=h1 or target.stat().st_size!=before.st_size: raise ValueError("archive target integrity mismatch")
    with c:
        row=c.execute("SELECT * FROM attempts WHERE id=?",(attempt_id,)).fetchone()
        if row["owner"]!=owner or row["fence"]!=int(fence) or row["state"]!="download_pending" or __import__('datetime').datetime.fromisoformat(row["lease_until"])<=now(): raise ValueError("claim changed during ingest")
        c.execute("UPDATE attempts SET state='archived_and_journaled',provenance_type=?,provenance_ref=?,exact_path=?,sha256=?,bytes=? WHERE id=?",(provenance_type,provenance_ref,str(src),h1,before.st_size,attempt_id))
        c.execute("INSERT OR IGNORE INTO files(sha256,bytes,archive_path,file_type,pdf_pages) VALUES(?,?,?,?,?)",(h1,before.st_size,str(target),file_type,pdf_pages))
        c.execute("INSERT OR IGNORE INTO resource_files VALUES(?,?,?,?)",(attempt_id,h1,reader_ref,resource_key))
        event(c,attempt_id,int(fence),"exact_path_confirmed",provenance_ref); event(c,attempt_id,int(fence),"staged_and_hashed",h1); event(c,attempt_id,int(fence),"archived_and_journaled",h1)
    return {"sha256":h1,"bytes":before.st_size,"file_type":file_type,"pdf_pages":pdf_pages,"resources_linked":c.execute("SELECT COUNT(*) FROM resource_files WHERE sha256=?",(h1,)).fetchone()[0],"archived":True}

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("--attempt-id",required=True); p.add_argument("--owner",required=True); p.add_argument("--fence",required=True,type=int); p.add_argument("--reader-ref",required=True); p.add_argument("--resource-key",required=True); p.add_argument("--path",required=True); p.add_argument("--provenance-type",required=True,choices=sorted(PROVENANCE)); p.add_argument("--provenance-ref",required=True,help="private evidence reference; stored only in the private database"); p.add_argument("--db",type=Path,default=DB); p.add_argument("--archive",type=Path)
    a=p.parse_args()
    try: print(__import__('json').dumps(ingest(a.attempt_id,a.owner,a.fence,a.reader_ref,a.resource_key,a.path,a.provenance_type,a.provenance_ref,a.db,a.archive)))
    except (ValueError,sqlite3.Error,OSError) as e: p.error(str(e))
if __name__=="__main__": main()
