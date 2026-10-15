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
P=Path(__file__).parent; ROOT=P.parent; OUT=ROOT/'final/GradeCrew-Spiele-Masterplan-20261015.pdf'; SRC=ROOT/'MASTERPLAN.md'
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
 content_blocks.append(norm(s));return Paragraph(inline(s),style[k])
def heading(s,level=0,key=None):
 f=para(s,'h2' if level==0 else 'h3');f._bookmark=key or 'sec-'+str(len(heading_registry));f._outlinelevel=level;f._heading=s;f._toc=(level==0 and key!='inhalt');heading_registry.append((s,f._bookmark,level));return f
class Book(BaseDocTemplate):
 def afterFlowable(self,f):
  if hasattr(f,'_bookmark'):
   self.canv.bookmarkPage(f._bookmark);self.canv.addOutlineEntry(norm(f._heading),f._bookmark,level=f._outlinelevel,closed=False)
   if f._toc:self.notify('TOCEntry',(0,html.escape(norm(f._heading)),self.page,f._bookmark))
def page(canvas,doc):
 if doc.page==1:return
 canvas.saveState();canvas.setStrokeColor(LINE);canvas.setLineWidth(.5);canvas.line(M,H-42,W-M,H-42);canvas.setFont('Body',8);canvas.setFillColor(MUTED);canvas.drawString(M,H-30,'GradeCrew Lernspiele');canvas.drawRightString(W-M,H-30,'Plan zur Prüfung · GC-GAMES-LEARNING-UX-01');canvas.line(M,40,W-M,40);canvas.drawString(M,26,'Auftrag 15.10.2026 · Satzstand 16.10.2026 · Konzept');canvas.setFont('Body-Bold',9);canvas.drawRightString(W-M,26,str(doc.page));canvas.restoreState()
class Cover(Flowable):
 def __init__(self):Flowable.__init__(self);self.width=CW;self.height=H-120
 def draw(self):
  c=self.canv;c.drawImage(str(P/'preview/brand-icon-v1.png'),0,580,90,90,mask='auto');c.setFont('Display-Bold',28);c.setFillColor(INK);c.drawString(110,610,'GradeCrew');c.setFont('Body',12);c.setFillColor(MUTED);c.drawString(110,588,'Lernspiele · Produkt- und Gestaltungsplan')
  c.setFillColor(INK);c.setFont('Display-Bold',44);c.drawString(0,488,'Gemeinsam');c.drawString(0,436,'leichter lernen')
  c.setFont('Body',17);c.drawString(0,390,'Einfacher Einstieg. Passende Herausforderung.');c.drawString(0,364,'Eigene Tests als Ausgangspunkt.')
  colors=['#285ac9','#713ac9','#087b87','#267049'];titles=['Fast Quiz','Fehlerjagd','Vocab Rush','Wissensreise'];subs=['Mathematik','Deutsch','Englisch','Deine Inhalte']
  for i in range(4):
   x=(i%2)*250;y=248-(i//2)*71;c.setFillColor(HexColor(colors[i]));c.roundRect(x,y,5,46,2,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Body-Bold',15);c.drawString(x+15,y+28,titles[i]);c.setFont('Body',11);c.setFillColor(MUTED);c.drawString(x+15,y+8,subs[i])
  c.setFillColor(SOFT);c.roundRect(0,52,CW,76,12,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Body-Bold',12);c.drawString(18,102,'Mittelschule Bayern · Klassen 5-10');c.setFont('Body',10);c.drawString(18,80,'Vollständiger Vorschlag zur Prüfung · keine Produktfreigabe')
  c.setFont('Body',9);c.setFillColor(MUTED);c.drawString(0,15,'GC-GAMES-LEARNING-UX-01 · Auftrag vom 15. Oktober 2026');c.drawString(0,0,'Satzstand 16. Oktober 2026 · vorhandene GradeCrew-Marke unverändert')
def parse(md):
 lines=md.splitlines();i=0;out=[];started=False
 while i<len(lines):
  line=lines[i].strip()
  if not line:i+=1;continue
  if line.startswith('# '):i+=1;continue
  if line.startswith('## ') and not re.match(r'## \d+\.',line):
   # Subtitle is on the cover; preserve its full wording in the front matter.
   if not started:out.append(para(line[3:],'h3'));i+=1;continue
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
   if n>=6 and widths[0]<66: widths=[66]+[(CW-66)*w/sum(weights[1:]) for w in weights[1:]]
   data=[[para(c,'thead' if ri==0 else 'table') for c in r]+['']*(n-len(r)) for ri,r in enumerate(rows)]
   t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT',splitByRow=1)
   t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,0),.8,BLUE),('LINEBELOW',(0,1),(-1,-1),.4,LINE)]));out.extend([t,Spacer(1,12)]);continue
  if re.match(r'^(-|\*|\d+\.) ',line):
   m=re.match(r'^(-|\*|\d+\.) (.*)',line);txt=('•' if m[1] in ['-','*'] else m[1])+' '+m[2];out.append(para(txt,'list'));i+=1;continue
  if line.startswith('>'):out.append(para(line.lstrip('> '),'quote'));i+=1;continue
  if re.match(r'^[-*_]{3,}$',line):out.append(Spacer(1,10));i+=1;continue
  block=[line];i+=1
  while i<len(lines) and lines[i].strip() and not re.match(r'^(#{1,4} |\||>|```|[-*] |\d+\. )',lines[i].strip()):block.append(lines[i].strip());i+=1
  out.append(para(' '.join(block)))
 return out
md=SRC.read_text();doc=Book(str(OUT),pagesize=(W,H),leftMargin=M,rightMargin=M,topMargin=65,bottomMargin=55,title='Gemeinsam leichter lernen - GradeCrew Lernspiele',author='GradeCrew · Planungsauftrag GC-GAMES-LEARNING-UX-01',subject='Produkt-, Didaktik- und Gestaltungsplan zur Prüfung')
frame=Frame(M,55,CW,H-120,id='main',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0);doc.addPageTemplates([PageTemplate(id='book',frames=[frame],onPage=page)])
story=[Cover(),PageBreak(),heading('Inhalt und Leseweg',0,'inhalt')]
toc=TableOfContents();toc.tableStyle.add('TOPPADDING',(0,0),(-1,-1),0);toc.tableStyle.add('BOTTOMPADDING',(0,0),(-1,-1),0);toc.levelStyles=[ParagraphStyle('TOC',fontName='Body',fontSize=10.3,leading=14,textColor=INK,leftIndent=0,firstLineIndent=0,spaceBefore=6,rightIndent=24)];story.append(toc);story.extend([Spacer(1,22),para('Die Seitenzahlen und Einträge im Inhaltsverzeichnis sind anklickbar. Die PDF-Lesezeichen führen zusätzlich zu den Unterabschnitten und Konzeptansichten.','small'),PageBreak()])
story.extend(parse(md))
story.extend([PageBreak(),heading('Designatlas: zwölf konkrete Konzeptansichten',0,'atlas'),para('Die folgenden Ansichten zeigen den Vorschlag für die gemeinsame Spielhülle auf Desktop, iPad und Phone. Sie sind statische Entwürfe und keine Screenshots eines bereits verfügbaren Builds. Aufgabe, Antwortformat und Hilfe unterscheiden sich fachlich; Marke, Navigation und Statusbegriffe bleiben gemeinsam.')])
for i,m in enumerate(json.loads((P/'mockups/manifest.json').read_text())):
 story.extend(([PageBreak()] if i else [])+[heading(f'Konzeptansicht {i+1}: {m["title"]}',1,'view-'+str(i+1)),para(m['device']+' · Vorschlag · keine Live-Oberfläche','small')])
 file=P/'preview'/m['file'].replace('.svg','.png');im=PILImage.open(file);iw,ih=im.size;scale=min(CW/iw,510/ih);story.append(Image(str(file),width=iw*scale,height=ih*scale,hAlign='CENTER'));story.extend([Spacer(1,14),para(m['explain'])])
story.extend([PageBreak(),heading('Gestaltungsgrundlage und Assetprovenienz',0,'designquellen'),para('Das Planbuch verwendet das bestehende GradeCrew-Hauptzeichen unverändert. Die maßgebliche Quelle ist Martins bereitgestellte Original-SVG vom 02.10.2026, dokumentiert in workstreams/brand-logo-v1.md. Die Dokumentreferenzen sind keine neuen produktbezogenen Logoquellen. Eine neue Games-Hauptmarke wird nicht eingeführt.'),para('Markenassets: assets/gradecrew/brand-primary-v1.svg und brand-icon-v1.svg aus HerrLoeffler/Hausaufgabe, Brand-Core-Commit c458dd1a82f82873b52877b9d914d24efd0b27c5. Der Herkunftsnachweis belegt die Projektquelle und die dort dokumentierte Bereitstellung durch Martin. Er behauptet keine öffentliche freie Lizenz oder separate Markenrechtsfreigabe.'),para('[Originales Hauptzeichen und Projektquelle](https://github.com/HerrLoeffler/Hausaufgabe/blob/c458dd1a82f82873b52877b9d914d24efd0b27c5/assets/gradecrew/brand-primary-v1.svg) · [Brand-Core-Regeln](https://github.com/HerrLoeffler/Hausaufgabe/blob/c458dd1a82f82873b52877b9d914d24efd0b27c5/shared/gradecrew-design/BRAND_CORE.md) · [Herkunftsdokumentation auf main](https://github.com/HerrLoeffler/Hausaufgabe/blob/main/workstreams/brand-logo-v1.md)','small'),para('Grundfarben und Abstände stammen aus shared/gradecrew-design/tokens.json V1.1.0 am selben Commit. Hintergrund #f6f7f9, Oberfläche #ffffff, Text #202b3c, Nebeninformation #5e6b7b, Primäraktion #285ac9 und positiver Zustand #267049 bleiben die Basis. Violett, Petrol und Grün als Fachakzente sind Planvorschläge; Fachname und Symbol tragen dieselbe Bedeutung zusätzlich zur Farbe.'),para('Alle zwölf SVG-Konzeptansichten und ihre einfachen Fachsymbole wurden für diesen Auftrag erstellt. Es wurden keine fremden Spielgrafiken, bezahlten Assets oder privaten Nutzerscreenshots übernommen. Keine Rasterbild- oder andere kostenpflichtige Mediengenerierung wurde gestartet. Schriften: lokal vorhandene Arial und Trebuchet MS zur Dokumentdarstellung; Fontdateien sind nicht Teil der Quelldateien und werden nicht als frei lizenziert bezeichnet.'),para('Die bearbeitbaren SVG-Dateien, die statische HTML-Galerie und der Design-Handoff enthalten die Herkunfts- und Arbeitsnachweise. Abbildungen im Buch sind hochauflösende Render dieser Quellen. Die PDF-Erstellung nutzt ReportLab; Satzstand und Auftragstag sind getrennt ausgewiesen. Die visuellen Vorschläge ersetzen weder fachliche Validierung noch Tests auf einem tatsächlichen Gerät.'),para('Offen bleiben die ausdrückliche Produktentscheidung, ein abgegrenzter Umsetzungsauftrag und die darauf folgenden fachlichen, technischen und gerätebezogenen Nachweise. Dieses Buch ist die prüfbare Grundlage dafür.','quote')])
doc.multiBuild(story)
r=PdfReader(OUT);text='\n'.join(p.extract_text() or '' for p in r.pages)
bodytext='\n'.join('\n'.join((p.extract_text() or '').splitlines()[4:]) if i else p.extract_text() or '' for i,p in enumerate(r.pages))
# The parser records every content block it consumes. Compare normalized alphanumeric token counts,
# including repeated text; one accidental paragraph omission cannot be masked by matching only headings.
from collections import Counter
def visible(s):
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1',s);s=re.sub(r'[`*#]','',s);return norm(s)
def tokens(s):return re.findall(r'[\w]+',visible(s).casefold(),re.UNICODE)
expected=Counter(tokens(' '.join(content_blocks)));actual=Counter(tokens(text));missing={k:v-actual[k] for k,v in expected.items() if actual[k]<v}
# Non-body H1 is deliberately mapped to cover and not included; table separator syntax isn't content.
compact=lambda s: ''.join(tokens(s))
compacted=compact(bodytext)
blockcounts=Counter(compact(b) for b in content_blocks if len(compact(b))>12)
missingblocks={k[:90]:v-compacted.count(k) for k,v in blockcounts.items() if compacted.count(k)<v}
report={'missing_content_blocks':missingblocks,'pdf':str(OUT),'pages':len(r.pages),'source_sha256':hashlib.sha256(md.encode()).hexdigest(),'source_words':len(md.split()),'bookmarks':len(heading_registry),'source_h2':len(re.findall(r'^## ',md,re.M)),'source_h3':len(re.findall(r'^### ',md,re.M)),'rendered_content_blocks':len(content_blocks),'linewrap_split_tokens':missing,'content_check_passed':not missingblocks,'page_text_lengths':[len(p.extract_text() or '') for p in r.pages],'pdf_links':sum(len(p.get('/Annots',[])) for p in r.pages)}
(ROOT/'final/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='page_text_lengths'},ensure_ascii=False,indent=2))
