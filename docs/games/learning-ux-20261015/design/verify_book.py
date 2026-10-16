from pathlib import Path
from collections import Counter
import json,re,hashlib
import pdfplumber
from pypdf import PdfReader
P=Path(__file__).parent;ROOT=P.parent;PDF=ROOT/'final/GradeCrew-Spiele-Masterplan-20261015.pdf'
r=PdfReader(PDF);issues=[]
with pdfplumber.open(PDF) as pdf:
 for i,p in enumerate(pdf.pages):
  outside=[c for c in p.chars if c.get('text','').strip() and (c['x0']<39 or c['x1']>p.width-39 or c['top']<16 or c['bottom']>p.height-15)]
  if outside:issues.append({'page':i+1,'outside_safe_area':[(c['text'],round(c['x0'],1),round(c['top'],1)) for c in outside[:15]]})
links=[]
for i,p in enumerate(r.pages):
 for a in p.get('/Annots',[]):
  a=a.get_object()
  if a.get('/Subtype')=='/Link':links.append({'page':i+1,'action':str(a.get('/A','')),'dest':str(a.get('/Dest',''))})
report={'pdf_sha256':hashlib.sha256(PDF.read_bytes()).hexdigest(),'pages':len(r.pages),'outside_safe_area':issues,'links_count':len(links),'internal_links':sum(bool(a['dest']) for a in links),'external_links':sum('/URI' in a['action'] for a in links),'outline_roots':len(r.outline),'file_bytes':PDF.stat().st_size}
(ROOT/'final/layout-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
