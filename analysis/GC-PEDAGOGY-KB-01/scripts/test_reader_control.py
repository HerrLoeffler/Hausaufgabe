import hashlib, json, tempfile, unittest
from io import BytesIO
import struct, wave, zipfile
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))

import reader_queue as q
import reader_ingest as ing
import reader_report as rep

class ReaderControlTests(unittest.TestCase):
    def setUp(self):
        self.t=tempfile.TemporaryDirectory(); self.root=Path(self.t.name); self.db=self.root/"private.sqlite3"
        self.template=self.root/"seed.jsonl"
        self.template.write_text("\n".join(json.dumps({"reader_ref":f"R{i:03}","phases":{k:"pending" for k in rep.GATES}}) for i in range(1,126))+"\n")
        q.seed(self.db,self.template)
    def tearDown(self): self.t.cleanup()
    def claim(self,key="resource-1",owner="worker"):
        return q.claim("R001",key,owner,path=self.db)
    def make_pending(self, claim):
        for state in ("action_observed","download_pending"):
            q.transition(claim["attempt_id"],claim["owner"],claim["fencing_token"],state,path=self.db)
    def pdf_bytes(self):
        from pypdf import PdfWriter
        out=BytesIO(); writer=PdfWriter(); writer.add_blank_page(width=100,height=100); writer.write(out); return out.getvalue()
    def ingest_path(self, source, key):
        a=self.claim(key); self.make_pending(a); ev=self.evidence(a,source)
        return ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001",key,source,"supported_tab_download_event_exact_path",ev,db=self.db,archive=self.root/"archive")
    def evidence(self, claim, source, kind="supported_tab_download_event_exact_path", overrides=None):
        folder=self.root/"evidence"; folder.mkdir(exist_ok=True)
        name=claim["attempt_id"]+".json"
        data={"schema":"reader_download_evidence_v1","attempt_id":claim["attempt_id"],"reader_ref":claim["reader_ref"],"resource_key":claim["resource_key"],"evidence_type":ing.PROOF_TYPES[kind],"source_tab_id":"tab-1","observed_offer_url":"https://reader.invalid/document.pdf","exact_path":str(source.resolve()),"download_completed":True}
        if overrides: data.update(overrides)
        (folder/name).write_text(json.dumps(data))
        return name
    def test_competing_claim_fails(self):
        self.claim()
        with self.assertRaisesRegex(ValueError,"active collector claim"): self.claim(owner="other")
    def test_active_claim_blocks_other_resource_on_same_book(self):
        self.claim("resource-a")
        with self.assertRaisesRegex(ValueError,"active collector claim"): self.claim("resource-b",owner="other")
    def test_stale_lease_fencing_rejected(self):
        a=self.claim(); c=q.connect(self.db)
        with c: c.execute("UPDATE attempts SET lease_until='2000-01-01T00:00:00+00:00' WHERE id=?",(a["attempt_id"],))
        with self.assertRaisesRegex(ValueError,"expired"):
            q.transition(a["attempt_id"],a["owner"],a["fencing_token"],"action_observed",path=self.db)
        with self.assertRaisesRegex(ValueError,"expired"):
            q.heartbeat(a["attempt_id"],a["owner"],a["fencing_token"],3600,self.db)
    def test_duplicate_hash_links_two_resources(self):
        payload=self.pdf_bytes(); f=self.root/"payload.pdf"; f.write_bytes(payload)
        for i,key in enumerate(("resource-a","resource-b")):
            a=self.claim(key); self.make_pending(a)
            source=f if i==0 else self.root/"payload.bin"
            if i: source.write_bytes(payload)
            ev=self.evidence(a,source)
            result=ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001",key,source,"supported_tab_download_event_exact_path",ev,db=self.db,archive=self.root/"archive")
        self.assertEqual(result["resources_linked"],2)
        self.assertEqual(len(list((self.root/"archive").iterdir())),1)
        row=q.connect(self.db).execute("SELECT archive_path,file_type,pdf_pages FROM files").fetchone()
        self.assertEqual((row["file_type"],row["pdf_pages"]),("application/pdf",1))
    def test_explicit_path_beats_newest_decoy(self):
        chosen=self.root/"chosen.pdf"; chosen.write_bytes(self.pdf_bytes())
        self.root.joinpath("newest-decoy.pdf").write_bytes(b"decoy")
        a=self.claim(); self.make_pending(a)
        ev=self.evidence(a,chosen,"supported_locator_downloadMedia_exact_path")
        result=ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001","resource-1",chosen,"supported_locator_downloadMedia_exact_path",ev,db=self.db,archive=self.root/"archive")
        self.assertEqual(result["sha256"],hashlib.sha256(chosen.read_bytes()).hexdigest())
        replay=ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001","resource-1",chosen,"supported_locator_downloadMedia_exact_path",ev,db=self.db,archive=self.root/"archive")
        self.assertTrue(replay["idempotent_replay"])
    def test_fake_provenance_rejected(self):
        f=self.root/"ok.pdf"; f.write_bytes(self.pdf_bytes())
        a=self.claim(); self.make_pending(a)
        with self.assertRaisesRegex(ValueError,"artefact does not exist"):
            ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001","resource-1",f,"supported_tab_download_event_exact_path","invented.json",db=self.db,archive=self.root/"archive")
        ev=self.evidence(a,f,overrides={"resource_key":"another-resource"})
        with self.assertRaisesRegex(ValueError,"does not match"):
            ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001","resource-1",f,"supported_tab_download_event_exact_path",ev,db=self.db,archive=self.root/"archive")
    def test_html_named_pdf_rejected(self):
        f=self.root/"bad.pdf"; f.write_text("<html>download page</html>")
        a=self.claim(); self.make_pending(a); ev=self.evidence(a,f)
        with self.assertRaisesRegex(ValueError,"HTML"):
            ing.ingest(a["attempt_id"],a["owner"],a["fencing_token"],"R001","resource-1",f,"supported_tab_download_event_exact_path",ev,db=self.db,archive=self.root/"archive")
    def test_png_is_verified_and_archived_with_media_type(self):
        from PIL import Image
        f=self.root/"page.png"; Image.new("RGB",(3,2),(20,40,60)).save(f)
        result=self.ingest_path(f,"resource-image")
        self.assertEqual(result["file_type"],"image/png")
        self.assertIsNone(result["pdf_pages"])
    def test_jpeg_webp_and_gif_are_verified(self):
        from PIL import Image
        source=Image.new("RGB",(3,2),(20,40,60))
        for ext,kind in (("jpg","image/jpeg"),("webp","image/webp"),("gif","image/gif")):
            path=self.root/("page."+ext); source.save(path,format={"jpg":"JPEG","webp":"WEBP","gif":"GIF"}[ext])
            self.assertEqual(self.ingest_path(path,"resource-"+ext)["file_type"],kind)
    def test_zip_is_checked_without_extracting(self):
        f=self.root/"bundle.zip"
        with zipfile.ZipFile(f,"w") as z: z.writestr("docs/readme.txt","ok")
        result=self.ingest_path(f,"resource-zip")
        self.assertEqual(result["file_type"],"application/zip")
        self.assertEqual(list((self.root/"archive").iterdir())[0].name,result["sha256"])
        self.assertEqual(zipfile.ZipFile(list((self.root/"archive").iterdir())[0]).namelist(),["docs/readme.txt"])
    def test_ooxml_word_document_gets_office_type(self):
        f=self.root/"lesson.docx"
        with zipfile.ZipFile(f,"w") as z:
            z.writestr("[Content_Types].xml","<Types/>")
            z.writestr("word/document.xml","<document/>")
        self.assertEqual(self.ingest_path(f,"resource-docx")["file_type"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    def test_zip_path_traversal_is_rejected(self):
        f=self.root/"unsafe.zip"
        with zipfile.ZipFile(f,"w") as z: z.writestr("../escape.txt","no")
        with self.assertRaisesRegex(ValueError,"unsafe ZIP entry"):
            self.ingest_path(f,"resource-unsafe-zip")
    def test_wav_is_parsed_and_archived(self):
        f=self.root/"voice.wav"
        with wave.open(str(f),"wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000); w.writeframes(b"\x00\x00"*80)
        result=self.ingest_path(f,"resource-wav")
        self.assertEqual(result["file_type"],"audio/wav")
    def test_mp3_reports_unsupported_without_media_parser(self):
        f=self.root/"voice.mp3"; f.write_bytes(b"ID3"+b"\x00"*64)
        import importlib.util, shutil
        expected="unsupported audio/video" if not shutil.which("ffprobe") and not importlib.util.find_spec("av") else "media parser"
        with self.assertRaisesRegex(ValueError,expected):
            self.ingest_path(f,"resource-mp3")
    def test_completed_gates_do_not_hide_active_attempt(self):
        for gate in rep.GATES:
            with q.connect(self.db) as c: c.execute("INSERT INTO gates VALUES(?,?,?,?)",("R001",gate,"complete","private-review"))
        self.claim()
        row=next(x for x in rep.report(self.db) if x["reader_ref"]=="R001")
        self.assertFalse(row["complete"])
    def test_uncertain_recovery_never_reclaims_automatically(self):
        a=self.claim(); before=a["lease_until"]
        extended=q.heartbeat(a["attempt_id"],a["owner"],a["fencing_token"],3600,self.db)
        self.assertGreater(extended,before)
        c=q.connect(self.db)
        with c: c.execute("UPDATE attempts SET lease_until='2000-01-01T00:00:00+00:00' WHERE id=?",(a["attempt_id"],))
        with self.assertRaisesRegex(ValueError,"marked uncertain"): self.claim()
        with self.assertRaisesRegex(ValueError,"terminal attempt"): self.claim()
    def test_expired_completed_download_reconciles_with_same_attempt_and_fence(self):
        a=q.claim("R115","R115:mainbook-page8","collector",path=self.db); self.make_pending(a)
        f=self.root/"Scale1.png"
        from PIL import Image
        Image.new("RGB",(2,3)).save(f)
        c=q.connect(self.db)
        with c: c.execute("UPDATE attempts SET lease_until='2000-01-01T00:00:00+00:00' WHERE id=?",(a["attempt_id"],))
        proof=self.evidence(a,f)
        until=q.reconcile_completed(a["attempt_id"],a["owner"],a["fencing_token"],"R115","R115:mainbook-page8",f,proof,path=self.db,lease_seconds=300)
        row=q.connect(self.db).execute("SELECT * FROM attempts WHERE id=?",(a["attempt_id"],)).fetchone()
        self.assertEqual((row["state"],row["fence"],row["attempt_counter"]),("download_pending",a["fencing_token"],1))
        self.assertGreater(row["lease_until"],"2000-01-01T00:00:00+00:00")
        self.assertEqual(c.execute("SELECT state FROM events WHERE attempt_id=? ORDER BY id DESC LIMIT 1",(a["attempt_id"],)).fetchone()[0],"late_download_proof_reconciled")
        self.assertTrue(until)
    def test_expired_attempt_without_proof_cannot_reconcile(self):
        a=q.claim("R115","R115:mainbook-page8","collector",path=self.db); self.make_pending(a)
        f=self.root/"Scale1.png"; f.write_bytes(b"exists")
        c=q.connect(self.db)
        with c: c.execute("UPDATE attempts SET lease_until='2000-01-01T00:00:00+00:00' WHERE id=?",(a["attempt_id"],))
        with self.assertRaisesRegex(ValueError,"artefact does not exist"):
            q.reconcile_completed(a["attempt_id"],a["owner"],a["fencing_token"],"R115","R115:mainbook-page8",f,"missing.json",path=self.db)
        row=q.connect(self.db).execute("SELECT state,lease_until FROM attempts WHERE id=?",(a["attempt_id"],)).fetchone()
        self.assertEqual((row["state"],row["lease_until"]),("download_pending","2000-01-01T00:00:00+00:00"))
    def test_mapping_correction_requires_evidence_and_preserves_old_key(self):
        a=q.claim("R115","R115:pilot-commentary","collector",path=self.db); self.make_pending(a)
        f=self.root/"Scale1.png"
        from PIL import Image
        Image.new("RGB",(2,3)).save(f)
        c=q.connect(self.db)
        with c: c.execute("UPDATE attempts SET lease_until='2000-01-01T00:00:00+00:00' WHERE id=?",(a["attempt_id"],))
        evidence_dir=self.root/"evidence"; evidence_dir.mkdir(exist_ok=True)
        proof_name="corrected-download.json"
        (evidence_dir/proof_name).write_text(json.dumps({"schema":"reader_download_evidence_v1","attempt_id":a["attempt_id"],"reader_ref":"R115","resource_key":"R115:mainbook-page8","evidence_type":"supported_tab_download_event","source_tab_id":"tab-1","observed_offer_url":"content/pages/page_9/Scale1.png","exact_path":str(f.resolve()),"download_completed":True}))
        with self.assertRaisesRegex(ValueError,"mapping correction evidence"):
            q.reconcile_completed(a["attempt_id"],a["owner"],a["fencing_token"],"R115","R115:mainbook-page8",f,proof_name,path=self.db)
        correction={"schema":"reader_mapping_correction_v1","attempt_id":a["attempt_id"],"reader_ref":"R115","from_resource_key":"R115:pilot-commentary","to_resource_key":"R115:mainbook-page8","exact_path":str(f.resolve()),"confirmed":True,"reason":"Observed page-8 image belongs to the main book.","source_tab_id":"tab-1","observed_offer_url":"content/pages/page_9/Scale1.png"}
        (evidence_dir/"mapping.json").write_text(json.dumps(correction))
        q.reconcile_completed(a["attempt_id"],a["owner"],a["fencing_token"],"R115","R115:mainbook-page8",f,proof_name,path=self.db,mapping_correction_ref="mapping.json")
        row=q.connect(self.db).execute("SELECT resource_key FROM attempts WHERE id=?",(a["attempt_id"],)).fetchone()
        event=q.connect(self.db).execute("SELECT detail FROM events WHERE attempt_id=? AND state='reconcile_mapping_correction'",(a["attempt_id"],)).fetchone()
        self.assertEqual(row["resource_key"],"R115:mainbook-page8")
        self.assertIn("R115:pilot-commentary",event["detail"])
    def test_seed_is_idempotent(self):
        self.assertEqual(q.seed(self.db,self.template),0)
        self.assertEqual(q.connect(self.db).execute("SELECT COUNT(*) FROM books").fetchone()[0],125)

if __name__=="__main__": unittest.main()
