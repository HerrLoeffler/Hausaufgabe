from pathlib import Path
import re, html, json, hashlib, os
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, KeepTogether, Flowable, CondPageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
from PIL import Image as PILImage
P=Path(__file__).parent; ROOT=P.parents[1]; OUT=ROOT/'final/GradeCrew-Spiele-Korrektur-Level-und-Klassenrunde-20261016.pdf'; SRC=Path(__import__('sys').argv[1]).resolve()
W,H=595.276,841.89; M=53; CW=W-2*M;INK=HexColor('#202b3c');BLUE=HexColor('#285ac9');MUTED=HexColor('#5e6b7b');SOFT=HexColor('#edf3fd');LINE=HexColor('#dfe5ec')
for n,f in [('Body','Arial.ttf'),('Body-Bold','Arial Bold.ttf'),('Body-Italic','Arial Italic.ttf'),('Display','Trebuchet MS.ttf'),('Display-Bold','Trebuchet MS Bold.ttf')]:pdfmetrics.registerFont(TTFont(n,'/System/Library/Fonts/Supplemental/'+f))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Body-Bold',italic='Body-Italic',boldItalic='Body-Bold')
style={
 'body':ParagraphStyle('Body',fontName='Body',fontSize=11.1,leading=15.7,textColor=INK,spaceAfter=9,allowWidows=0,allowOrphans=0),
 'h2':ParagraphStyle('H2',fontName='Display-Bold',fontSize=25,leading=29,textColor=INK,spaceBefore=0,spaceAfter=20,keepWithNext=True),
 'h3':ParagraphStyle('H3',fontName='Display-Bold',fontSize=15,leading=19,textColor=BLUE,spaceBefore=12,spaceAfter=9,keepWithNext=True),
 'h4':ParagraphStyle('H4',fontName='Body-Bold',fontSize=11.5,leading=16,spaceBefore=8,spaceAfter=6,keepWithNext=True,textColor=INK),
 'small':ParagraphStyle('Small',fontName='Body',fontSize=9,leading=12.5,textColor=MUTED,spaceAfter=8),
 'table':ParagraphStyle('Table',fontName='Body',fontSize=9.1,leading=12.6,textColor=INK,spaceAfter=0,splitLongWords=True),
 'thead':ParagraphStyle('TableHead',fontName='Body-Bold',fontSize=9.1,leading=12.6,textColor=BLUE,spaceAfter=0),
 'quote':ParagraphStyle('Quote',fontName='Body-Italic',fontSize=11,leading=16,textColor=INK,leftIndent=15,borderColor=BLUE,borderWidth=2,borderPadding=10,spaceBefore=8,spaceAfter=12),
 'list':ParagraphStyle('List',fontName='Body',fontSize=11.1,leading=15.7,textColor=INK,leftIndent=15,firstLineIndent=-12,spaceAfter=7,allowWidows=0,allowOrphans=0),
 'code':ParagraphStyle('Code',fontName='Body',fontSize=9,leading=13,textColor=INK,backColor=SOFT,borderPadding=10,spaceBefore=8,spaceAfter=10),
}
def norm(s):return s.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-').replace('\u00a0',' ')
def inline(s):
 s=html.escape(norm(s));s=re.sub(r'`([^`]+)`',r'<font color="#4c14d4">\1</font>',s)
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:f'<link href="{m[2]}" color="#285ac9">{m[1]}</link>',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s);s=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<i>\1</i>',s)
 return s
content_blocks=[];heading_registry=[]
def para(s,k='body'):
 content_blocks.append(norm(s))
 if k in ['table','thead']: s=re.sub(r';(?=\S)', '; ',s)
 return Paragraph(inline(s),style[k])
def heading(s,level=0,key=None):
 f=para(s,'h2' if level==0 else 'h3');f._bookmark=key or 'sec-'+str(len(heading_registry));f._outlinelevel=level;f._heading=s;f._toc=(level==0 and key!='inhalt');heading_registry.append((s,f._bookmark,level));return f
class Book(BaseDocTemplate):
 def afterFlowable(self,f):
  if hasattr(f,'_bookmark'):
   self.canv.bookmarkPage(f._bookmark);self.canv.addOutlineEntry(norm(f._heading),f._bookmark,level=f._outlinelevel,closed=False)
   if f._toc:self.notify('TOCEntry',(0,html.escape(norm(f._heading)),self.page,f._bookmark))
def page(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(LINE);canvas.setLineWidth(.5);canvas.line(M,H-42,W-M,H-42);canvas.setFont('Body',8);canvas.setFillColor(MUTED);canvas.drawString(M,H-30,'GradeCrew Lernspiele');canvas.drawRightString(W-M,H-30,'Korrekturplan · GC-GAMES-LEARNING-UX-01');canvas.line(M,40,W-M,40);canvas.drawString(M,26,'Korrektur 16.10.2026 · Konzept · kein Produktrelease');canvas.setFont('Body-Bold',9);canvas.drawRightString(W-M,26,str(doc.page));canvas.restoreState()
def parse(md):
 lines=md.splitlines();i=0;out=[];started=False
 while i<len(lines):
  line=lines[i].strip()
  if not line:i+=1;continue
  if line.startswith('# '):i+=1;continue
  if line.startswith('```'):
   block=[];i+=1
   while i<len(lines) and not lines[i].startswith('```'):block.append(lines[i]);i+=1
   out.append(para('\n'.join(block),'code'));i+=1;continue
  if re.match(r'^#{2,4} ',line):
   m=re.match(r'^(#{2,4}) (.*)',line);lvl=len(m[1]);txt=m[2]
   if lvl==2:
    if out:out.extend([CondPageBreak(210),Spacer(1,14)])
    out.append(heading(txt,0));started=True
   elif lvl==3:out.append(heading(txt,1))
   else:out.append(para(txt,'h4'))
   i+=1;continue
  if line.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].strip().startswith('|'):
    cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
    if not all(re.fullmatch(r':?-+:?',c or '-') for c in cells):rows.append(cells)
    i+=1
   n=max(map(len,rows));weights=[1]*n
   # Give descriptive final columns more room while preserving short identifiers.
   lengths=[sum(len(r[j]) if j<len(r) else 0 for r in rows)/len(rows) for j in range(n)];weights=[max(10,min(65,v))**.55 for v in lengths];widths=[CW*w/sum(weights) for w in weights]
   # Preserve short header words such as 'Endstand' instead of splitting off two letters.
   minima=[min(86,CW/n-3,max(44,max([pdfmetrics.stringWidth(re.sub(r'[*`#]','',w),'Body-Bold',9.1) for w in rows[0][j].split()]+[0])+16)) for j in range(n)]
   if n>=6: minima[0]=max(66,minima[0])
   pinned={}
   for _ in range(n):
    low=[j for j in range(n) if j not in pinned and widths[j]<minima[j]]
    if not low: break
    for j in low: pinned[j]=minima[j]
    remaining=CW-sum(pinned.values());free=[j for j in range(n) if j not in pinned]
    widths=[pinned[j] if j in pinned else remaining*weights[j]/sum(weights[k] for k in free) for j in range(n)]
   data=[[para(c,'thead' if ri==0 else 'table') for c in r]+['']*(n-len(r)) for ri,r in enumerate(rows)]
   t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT',splitByRow=1)
   t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),.8,BLUE),('LINEBELOW',(0,1),(-1,-1),.4,LINE)]));out.extend([t,Spacer(1,12)]);continue
  if re.match(r'^(-|\*|\d+\.) ',line):
   m=re.match(r'^(-|\*|\d+\.) (.*)',line);txt=('•' if m[1] in ['-','*'] else m[1])+' '+m[2];out.append(para(txt,'list'));i+=1;continue
  if line.startswith('>'):out.append(para(line.lstrip('> '),'quote'));i+=1;continue
  if re.match(r'^[-*_]{3,}$',line):out.append(Spacer(1,10));i+=1;continue
  block=[line];i+=1
  while i<len(lines) and lines[i].strip() and not re.match(r'^(#{1,4} |\||>|```|[-*] |\d+\. )',lines[i].strip()):block.append(lines[i].strip());i+=1
  out.append(para(' '.join(block)))
 return out


class CompactTitle(Flowable):
 def __init__(self,title):
  super().__init__();self.width=CW;self.title=Paragraph(inline(title),ParagraphStyle('MainTitle',fontName='Display-Bold',fontSize=26,leading=31,textColor=INK));self.tw,self.th=self.title.wrap(CW,300);self.height=self.th+99
 def draw(self):
  c=self.canv;c.drawImage(str(P.parent/'preview/brand-icon-v1.png'),0,self.height-43,40,40,mask='auto');c.setFillColor(INK);c.setFont('Display-Bold',20);c.drawString(52,self.height-28,'GradeCrew');c.setFont('Body',9);c.setFillColor(MUTED);c.drawRightString(CW,self.height-27,'Nutzerkorrektur · 16.10.2026')
  self.title.drawOn(c,0,35);c.setFont('Body',9);c.setFillColor(MUTED);c.drawString(0,15,'Eigenständiger Plan · alte Dokumente bleiben unverändert · noch kein Produktrelease')

if __name__=='__main__':
 from collections import Counter
 import pdfplumber
 originals={'GradeCrew-Spiele-Masterplan-20261015.pdf':'150f68ef7d150ac9b0cd90f94f92a05b7924e51740e519e91bcf2b68a0e92664','GradeCrew-Spiele-Nachtrag-Adaptive-Runden-20261016.pdf':'e343a4d2848d4f5157494e88b1fb477e75cbc2b3f749e2788ba5bc7f8d15ccdf'}
 def old_hashes():return {name:hashlib.sha256((ROOT/'final'/name).read_bytes()).hexdigest() for name in originals}
 assert old_hashes()==originals,'An existing PDF changed before this correction build'
 md=SRC.read_text();title=next(x[2:] for x in md.splitlines() if x.startswith('# '));content_blocks.append(norm(title))
 doc=Book(str(OUT),pagesize=(W,H),leftMargin=M,rightMargin=M,topMargin=65,bottomMargin=55,title=norm(title),author='GradeCrew · GC-GAMES-LEARNING-UX-01',subject='Korrekturplan: feste Levelkategorien und gemeinsam sammelnde Klassen')
 frame=Frame(M,55,CW,H-120,id='main',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0);doc.addPageTemplates([PageTemplate(id='book',frames=[frame],onPage=page)])
 story=[CompactTitle(title),Spacer(1,6)]
 toc=TableOfContents();toc.tableStyle.add('TOPPADDING',(0,0),(-1,-1),0);toc.tableStyle.add('BOTTOMPADDING',(0,0),(-1,-1),0);toc.levelStyles=[ParagraphStyle('TOC',fontName='Body',fontSize=9.6,leading=13,textColor=INK,leftIndent=0,firstLineIndent=0,spaceBefore=4,rightIndent=24)];story.extend([toc,Spacer(1,18)])
 story.extend(parse(md));doc.multiBuild(story)
 r=PdfReader(OUT);bodytext='\n'.join('\n'.join((p.extract_text() or '').splitlines()[4:]) for p in r.pages)
 def compact(s):
  s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1',s);s=re.sub(r'[`*#]','',s);return ''.join(re.findall(r'\w+',norm(s).casefold()))
 full=compact(bodytext);blocks=Counter(compact(b) for b in content_blocks if len(compact(b))>12);missing={k[:100]:v-full.count(k) for k,v in blocks.items() if full.count(k)<v}
 safe=[]
 with pdfplumber.open(OUT) as pdf:
  for i,p in enumerate(pdf.pages):
   bad=[c for c in p.chars if c.get('text','').strip() and (c['x0']<39 or c['x1']>p.width-39 or c['top']<16 or c['bottom']>p.height-15)]
   if bad:safe.append({'page':i+1,'chars':[(c['text'],round(c['x0'],1),round(c['top'],1)) for c in bad[:20]]})
 links=[a.get_object() for p in r.pages for a in p.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Link'];ids={q.indirect_reference.idnum for q in r.pages};badlinks=[]
 for a in links:
  dest=a.get('/Dest')
  if dest and (not hasattr(dest[0],'idnum') or dest[0].idnum not in ids):badlinks.append(str(dest))
 assert old_hashes()==originals,'An existing PDF changed during this correction build'
 report={'pdf':str(OUT),'pdf_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'source':str(SRC),'source_sha256':hashlib.sha256(md.encode()).hexdigest(),'source_words':len(md.split()),'pages':len(r.pages),'bookmarks':len(heading_registry),'content_blocks':len(content_blocks),'missing_content_blocks':missing,'content_check_passed':not missing,'outside_safe_area':safe,'internal_links':sum(bool(x.get('/Dest')) for x in links),'external_links':sum('/URI' in str(x.get('/A','')) for x in links),'invalid_internal_links':badlinks,'page_text_lengths':[len(p.extract_text() or '') for p in r.pages],'previous_pdf_hashes':old_hashes(),'previous_pdfs_unchanged':old_hashes()==originals}
 (ROOT/'final/level-class-correction-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='page_text_lengths'},ensure_ascii=False,indent=2))
