from pathlib import Path
import re, html, json, hashlib, zipfile, textwrap, collections
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, Preformatted, KeepTogether, CondPageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.graphics.shapes import Drawing, Rect, Line, Polygon, String
from reportlab.graphics import renderSVG
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent
WORK=ROOT
BASE=Path("/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies")
FONTDIR=BASE/"python/lib/python3.12/site-packages/reportlab/fonts"
pdfmetrics.registerFont(TTFont("GCBody",str(BASE/"native/poppler/poppler/fonts/DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("GCBold",str(FONTDIR/"VeraBd.ttf")))
pdfmetrics.registerFont(TTFont("GCItalic",str(FONTDIR/"VeraIt.ttf")))
pdfmetrics.registerFont(TTFont("GCBoldItalic",str(FONTDIR/"VeraBI.ttf")))
pdfmetrics.registerFont(TTFont("GCMono",str(BASE/"native/poppler/poppler/fonts/SourceCodePro-Regular.ttf")))
pdfmetrics.registerFontFamily("GCBody",normal="GCBody",bold="GCBold",italic="GCItalic",boldItalic="GCBoldItalic")

NAVY=colors.HexColor("#12283C")
TEAL=colors.HexColor("#006D77")
INK=colors.HexColor("#182F40")
MUTED=colors.HexColor("#526675")
LIGHT=colors.HexColor("#F1F5F7")
LINE=colors.HexColor("#D6E0E5")
WHITE=colors.white
W,H=A4
MARGIN=49
CW=W-2*MARGIN
styles={
"body":ParagraphStyle("GCBodyText",fontName="GCBody",fontSize=9.8,leading=14.4,textColor=INK,spaceAfter=5,splitLongWords=True),
"h1":ParagraphStyle("GCH1",fontName="GCBold",fontSize=20,leading=25,textColor=NAVY,spaceAfter=13,keepWithNext=True),
"h2":ParagraphStyle("GCH2",fontName="GCBold",fontSize=13,leading=17,textColor=TEAL,spaceBefore=13,spaceAfter=7,keepWithNext=True),
"h3":ParagraphStyle("GCH3",fontName="GCBold",fontSize=10.6,leading=14,textColor=NAVY,spaceBefore=9,spaceAfter=5,keepWithNext=True),
"bullet":ParagraphStyle("GCBullet",fontName="GCBody",fontSize=9.6,leading=14,leftIndent=13,firstLineIndent=0,bulletIndent=0,spaceAfter=5.5,textColor=INK,splitLongWords=True),
"table":ParagraphStyle("GCTable",fontName="GCBody",fontSize=8.1,leading=11.5,textColor=INK,spaceAfter=0,splitLongWords=True),
"tablehead":ParagraphStyle("GCTableHead",fontName="GCBold",fontSize=8.2,leading=11.4,textColor=WHITE,spaceAfter=0,splitLongWords=True),
"code":ParagraphStyle("GCCode",fontName="GCMono",fontSize=7.7,leading=10.2,textColor=INK,backColor=LIGHT,borderColor=LINE,borderWidth=.4,borderPadding=8,spaceBefore=5,spaceAfter=9),
"caption":ParagraphStyle("GCCaption",fontName="GCItalic",fontSize=8.3,leading=11.6,textColor=MUTED,spaceAfter=12),
"cover":ParagraphStyle("GCCover",fontName="GCBold",fontSize=30,leading=35,textColor=WHITE,spaceAfter=15),
"coversub":ParagraphStyle("GCCoverSub",fontName="GCBody",fontSize=11.5,leading=17,textColor=WHITE),
"small":ParagraphStyle("GCSmall",fontName="GCBody",fontSize=8.8,leading=13.2,textColor=MUTED,spaceAfter=8),
"toc0":ParagraphStyle("GCToc0",fontName="GCBody",fontSize=10.4,leading=15.5,leftIndent=0,firstLineIndent=0,spaceBefore=7,textColor=INK),
}
def normalize(s):
    for c in "\u2010\u2011\u2012\u2013\u2014": s=s.replace(c,"-")
    return s.replace("\u00ad","").replace("\u00a0"," ")
files=sorted(ROOT.glob("[0-9][0-9]-*.md"))
for p in files:
    p.write_text(normalize(p.read_text()))
texts=[p.read_text() for p in files]

def inline(s):
    out=[]; pos=0
    pattern=re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    def plain(x):
        y=html.escape(x)
        y=re.sub(r"\*\*(.+?)\*\*",r"<b>\1</b>",y)
        y=re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)",r"<i>\1</i>",y)
        return y
    for m in pattern.finditer(s):
        out.append(plain(s[pos:m.start()]))
        out.append('<link href="'+html.escape(m.group(2),quote=True)+'" color="#006D77">'+plain(m.group(1))+"</link>")
        pos=m.end()
    out.append(plain(s[pos:]))
    return "".join(out)

def blocks(text):
    ls=text.splitlines(); i=0
    while i<len(ls):
        s=ls[i].strip()
        if not s: i+=1; continue
        if s.startswith("~~~"):
            lang=s[3:]; arr=[]; i+=1
            while i<len(ls) and not ls[i].strip().startswith("~~~"):
                arr.append(ls[i]);i+=1
            i+=1;yield ("code",lang,"\n".join(arr));continue
        m=re.match(r"^(#{1,3})\s+(.+)$",s)
        if m: yield ("heading",len(m.group(1)),m.group(2));i+=1;continue
        if s.startswith("|") and i+1<len(ls) and re.match(r"^\|\s*[-:]",ls[i+1].strip()):
            rows=[];rows.append([x.strip() for x in s.strip("|").split("|")]);i+=2
            while i<len(ls) and ls[i].strip().startswith("|"):
                rows.append([x.strip() for x in ls[i].strip().strip("|").split("|")]);i+=1
            yield ("table",None,rows);continue
        m=re.match(r"^-\s+(.*)$",s)
        if m:yield ("bullet","-",m.group(1));i+=1;continue
        m=re.match(r"^(\d+)\.\s+(.*)$",s)
        if m:yield ("bullet",m.group(1)+".",m.group(2));i+=1;continue
        arr=[s];i+=1
        while i<len(ls) and ls[i].strip():
            x=ls[i].strip()
            if x.startswith(("~~~","|","#","- ")) or re.match(r"^\d+\.\s",x):break
            arr.append(x);i+=1
        yield ("paragraph",None," ".join(arr))

def box(d,x,y,w,h,label,fill=LIGHT,stroke=LINE,color=INK,font=8.6):
    d.add(Rect(x,y,w,h,rx=7,ry=7,fillColor=fill,strokeColor=stroke,strokeWidth=.7))
    lines=label.split("\n");base=y+h/2+(len(lines)-1)*5
    for i,t in enumerate(lines):
        d.add(String(x+w/2,base-i*11,t,textAnchor="middle",fontName="GCBody",fontSize=font,fillColor=color))
def arrow(d,x1,y1,x2,y2,color=TEAL):
    d.add(Line(x1,y1,x2,y2,strokeColor=color,strokeWidth=1))
    import math
    a=math.atan2(y2-y1,x2-x1);r=4.5
    pts=[x2,y2,x2-r*math.cos(a-.5),y2-r*math.sin(a-.5),x2-r*math.cos(a+.5),y2-r*math.sin(a+.5)]
    d.add(Polygon(pts,fillColor=color,strokeColor=color))
def fig_org():
    d=Drawing(CW,300)
    box(d,176,259,145,34,"Martin / Verantwortung",NAVY,NAVY,WHITE,9)
    box(d,176,210,145,34,"Hauptzentrale\nkoordiniert",TEAL,TEAL,WHITE)
    arrow(d,248,259,248,244)
    labels=["Strategie / Führung","Produkt / Konzepte","Pädagogik / Inhalte","Technik / Betrieb","Kunden / Schulen","Marketing / Vertrieb","Finanzen / Organisation","Recht / Verträge","Datenschutz / Sicherheit"]
    xs=[4,171,338]
    for i,l in enumerate(labels):
        x=xs[i%3];y=144-(i//3)*48;box(d,x,y,155,36,l,font=8.1)
    for x in xs:arrow(d,248,210,x+77,180)
    box(d,4,2,489,31,"Gemeinsame Ziele, Akten, Wissen, Analyse und Entscheidungen",LIGHT,LINE,INK,8.2)
    return d
def fig_data():
    d=Drawing(CW,260)
    box(d,5,209,217,36,"MCP-App im Host",NAVY,NAVY,WHITE,9)
    box(d,274,209,217,36,"bestehender lokaler Client",NAVY,NAVY,WHITE,9)
    box(d,132,135,233,45,"Ein Firmenservice\nRechte, Revisionen, Fachverträge",TEAL,TEAL,WHITE)
    arrow(d,113,209,200,180);arrow(d,382,209,295,180)
    box(d,5,61,148,40,"Transaktionaler Store\nRequests, Ziele, Events",font=8.1)
    box(d,174,61,148,40,"Geschützte Artefakte\nHash und Zugriff",font=8.1)
    box(d,343,61,148,40,"Kanonische Quellen\nGitHub, Release, Fachakten",font=8.1)
    for x in [79,248,417]:arrow(d,248,135,x,101)
    d.add(String(248,21,"Jeder Wert hat genau einen verantwortlichen Ursprung.",textAnchor="middle",fontName="GCBody",fontSize=9,fillColor=MUTED))
    return d
def fig_route():
    d=Drawing(CW,255)
    steps=[(5,192,"1 Eingabe","UI / Request-ID"),(175,192,"2 Speichern","Brief / Outbox"),(345,192,"3 Koordinieren","GradeCrew Zentrale"),(345,102,"4 Fachstart","richtige Rolle / Remote-ID"),(175,102,"5 Rückfrage / Ergebnis","derselbe Vorgang"),(5,102,"6 Review / Annahme","Beleg / Zielbeitrag")]
    for x,y,a,b in steps:box(d,x,y,146,47,a+"\n"+b,NAVY if a.startswith(("1","6")) else LIGHT,LINE,WHITE if a.startswith(("1","6")) else INK,8.1)
    arrow(d,151,215,175,215);arrow(d,321,215,345,215);arrow(d,418,192,418,149);arrow(d,345,125,321,125);arrow(d,175,125,151,125)
    box(d,5,24,486,42,"Gespeichert, zugestellt und gestartet sind getrennte Belege.\nAlle Rückmeldungen bleiben an dieselbe Task und denselben Brief gebunden.",LIGHT,LINE,INK,8.3)
    return d
def fig_recovery():
    d=Drawing(CW,265)
    boxes=[(207,"1 Restorebeginn","neue Epoch; Dispatch und Approval gesperrt"),(145,"2 Rechte / Löschungen","vor Anzeige, Suche und neuem Kontext anwenden"),(83,"3 Vollständiger Abgleich","Starts, Abschlüsse, Kosten, Fragen, Widerrufe"),(21,"4 Gezielte Freigabe","nur nach unabhängig belegter Vollständigkeit")]
    for y,a,b in boxes:
        box(d,29,y,438,44,a+"\n"+b,TEAL if y==21 else LIGHT,LINE,WHITE if y==21 else INK,8.8)
    for y in [207,145,83]:arrow(d,248,y,248,y-18)
    return d
def fig_delivery():
    d=Drawing(CW,250)
    nodes=[(5,181,"Baseline / Quellen"),(175,181,"P0 echter Zyklus"),(345,181,"P1 Store / Ziele"),(345,103,"P2 Wissen / Request"),(175,103,"P3 Fachausführung"),(5,103,"UI + Betriebsprüfung"),(5,25,"Recovery / Rechte"),(175,25,"V1-Abnahme"),(345,25,"begrenzte Nutzung")]
    for x,y,t in nodes:box(d,x,y,146,40,t,NAVY if "P0" in t or "V1" in t else LIGHT,LINE,WHITE if "P0" in t or "V1" in t else INK,8.3)
    arrow(d,151,201,175,201);arrow(d,321,201,345,201);arrow(d,418,181,418,143);arrow(d,345,123,321,123);arrow(d,175,123,151,123);arrow(d,78,103,78,65);arrow(d,151,45,175,45);arrow(d,321,45,345,45)
    return d
figures={1:(fig_org,"Abbildung 1: Verantwortungsmodell; Bereiche sind logische Zuständigkeiten, keine neun neu angelegten Chats."),
4:(fig_data,"Abbildung 2: Datenhoheit und gemeinsame Oberfläche; Quellen und Geschäftsbestand bleiben nachvollziehbar getrennt."),
6:(fig_route,"Abbildung 3: Auftrag und gebundener Rückkanal; die technischen Fähigkeiten sind im P0 nachzuweisen."),
8:(fig_recovery,"Abbildung 4: Wiederherstellung bleibt bis zum vollständigen Abgleich gesperrt."),
9:(fig_delivery,"Abbildung 5: Abhängige Lieferfolge; sichere Inventur und isolierte Dokumentation können parallel erfolgen.")}

class BookDoc(BaseDocTemplate):
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and hasattr(f,"_bookmark"):
            self.canv.bookmarkPage(f._bookmark)
            self.canv.addOutlineEntry(f._plain,f._bookmark,level=f._level,closed=(f._level>0))
            if f._level==0:self.notify("TOCEntry",(0,f._plain,self.page,f._bookmark))
def page_frame(canvas,doc):
    canvas.saveState()
    if doc.page==1:
        canvas.setFillColor(NAVY);canvas.rect(0,H-313,W,313,stroke=0,fill=1)
        canvas.setFillColor(TEAL);canvas.rect(MARGIN,H-48,38,4,stroke=0,fill=1)
        canvas.setFillColor(WHITE);canvas.setFont("GCBold",9);canvas.drawString(MARGIN+51,H-48,"GRADECREW / GC-BRAIN-01")
    else:
        canvas.setStrokeColor(LINE);canvas.setLineWidth(.5);canvas.line(MARGIN,H-35,W-MARGIN,H-35)
        canvas.setFillColor(MUTED);canvas.setFont("GCBody",7.8);canvas.drawString(MARGIN,H-25,"FIRMENZENTRALE  |  GESAMTPLAN UND BETRIEBSBUCH")
        canvas.drawRightString(W-MARGIN,H-25,"22.10.2026")
    canvas.setStrokeColor(LINE);canvas.line(MARGIN,35,W-MARGIN,35)
    canvas.setFillColor(MUTED);canvas.setFont("GCBody",7.4)
    canvas.drawString(MARGIN,22,"Planungsfassung 1.1 - keine Produkt- oder Betriebsfreigabe")
    canvas.drawRightString(W-MARGIN,22,"Seite "+str(doc.page))
    canvas.restoreState()

pdf=ROOT/"GradeCrew-Firmenzentrale-Gesamtplan.pdf"
doc=BookDoc(str(pdf),pagesize=A4,leftMargin=MARGIN,rightMargin=MARGIN,topMargin=53,bottomMargin=48,title="GradeCrew Firmenzentrale - Gesamtplan und Betriebsbuch",author="GradeCrew / GC-BRAIN-01",subject="Architektur, Firmenordnung, ChatGPT-Routing, Automatisierung und Umsetzung")
doc.addPageTemplates([PageTemplate(id="normal",frames=[Frame(MARGIN,48,CW,H-101,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=page_frame)])
story=[Spacer(1,76),Paragraph("Firmenzentrale<br/>Gesamtplan und<br/>Betriebsbuch",styles["cover"]),Paragraph("Unternehmensführung, Arbeitsorganisation<br/>und technische Architektur",styles["coversub"]),Spacer(1,87)]
stats=[["9 Verantwortungsbereiche","28 Umsetzungspakete","72 Abnahmefälle"],["19 Kapitel","19 Automationsprofile","Gebundener ChatGPT-Rückkanal"]]
statrows=[[Paragraph(inline(c),styles["table"]) for c in row] for row in stats]
tab=Table(statrows,colWidths=[CW/3]*3)
tab.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),.5,LINE),("INNERGRID",(0,0),(-1,-1),.5,WHITE),("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),("LEFTPADDING",(0,0),(-1,-1),10)]))
story.extend([tab,Spacer(1,23),Paragraph("Eine gemeinsame Sicht auf Ziele, Themen, Entscheidungen und Facharbeit - mit klarer Datenhoheit, realem Ausführungsnachweis und sicherer Wiederaufnahme.",styles["body"]),Paragraph("Stand: 22. Oktober 2026 | Fassung 1.1 | Task GC-BRAIN-01",styles["small"]),Paragraph("Diese neue Gesamtplanung baut auf dem akzeptierten Plan auf. Neue Details benötigen gezielte Prüfung vor produktiver Verwendung.",styles["small"]),PageBreak(),Paragraph("Inhaltsverzeichnis",styles["h1"])])
toc=TableOfContents();toc.levelStyles=[styles["toc0"]]
story.extend([Paragraph("Die PDF-Lesezeichen öffnen zusätzlich alle Unterabschnitte. Die editierbaren Kapitel und der zusammengeführte Markdowntext liegen im selben Ausgabepaket.",styles["small"]),toc,PageBreak()])
htmlchapters=[]; htmltoc=[]
counter=0
for ci,(path,text) in enumerate(zip(files,texts)):
    if ci>0:story.append(PageBreak())
    bodyhtml=[]; firsthead=True
    chapterblocks=list(blocks(text))
    for bi,(kind,info,content) in enumerate(chapterblocks):
        if kind=="heading":
            level=info; key=f"c{ci}-h{counter}";counter+=1
            if bi+1<len(chapterblocks) and chapterblocks[bi+1][0]=="table":
                story.append(CondPageBreak(110))
            p=Paragraph(inline(content),styles["h"+str(level)])
            if bi+1<len(chapterblocks) and chapterblocks[bi+1][0]=="table":p.keepWithNext=False
            p._bookmark=key;p._plain=content;p._level=level-1;story.append(p)
            bodyhtml.append(f'<h{level} id="{key}">{inline(content).replace("<link ","<a ").replace("</link>","</a>")}</h{level}>')
            if firsthead and level==1:
                htmltoc.append(f'<li><a href="#{key}">{html.escape(content)}</a></li>')
                firsthead=False
                if ci in figures:
                    drawing,caption=figures[ci][0](),figures[ci][1]
                    story.extend([drawing,Paragraph(inline(caption),styles["caption"])])
                    svg=renderSVG.drawToString(drawing)
                    svg=re.sub(r'<\?xml[^>]*\?>','',svg)
                    bodyhtml.append('<figure>'+svg+'<figcaption>'+html.escape(caption)+'</figcaption></figure>')
        elif kind=="paragraph":
            story.append(Paragraph(inline(content),styles["body"]))
            bodyhtml.append("<p>"+inline(content).replace("<link ","<a ").replace("</link>","</a>")+"</p>")
        elif kind=="bullet":
            ischeck=content.startswith("[ ] ")
            if ischeck:content=content[4:]
            bullet="□" if ischeck else ("•" if info=="-" else info)
            story.append(Paragraph(inline(content),styles["bullet"],bulletText=bullet))
            bodyhtml.append('<p class="item"><span>'+html.escape(bullet)+'</span>'+inline(content).replace("<link ","<a ").replace("</link>","</a>")+"</p>")
        elif kind=="code":
            story.append(Preformatted(content,styles["code"],maxLineLength=103,splitChars=" \t",newLineChars="    "))
            bodyhtml.append("<pre><code>"+html.escape(content)+"</code></pre>")
        elif kind=="table":
            n=max(len(row) for row in content)
            ratios={2:[.35,.65],3:[.23,.40,.37],4:[.16,.28,.31,.25]}.get(n,[1/n]*n)
            rows=[]
            for ri,row in enumerate(content):
                row=row+[""]*(n-len(row)); sty=styles["tablehead"] if ri==0 else styles["table"]
                rows.append([Paragraph(inline(v),sty) for v in row])
            tb=Table(rows,colWidths=[CW*x for x in ratios],repeatRows=1,hAlign="LEFT",splitByRow=1)
            tb.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT]),("VALIGN",(0,0),(-1,-1),"TOP"),("LINEBELOW",(0,0),(-1,0),.7,TEAL),("LINEBELOW",(0,1),(-1,-1),.3,LINE),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7)]))
            story.extend([tb,Spacer(1,9)])
            bodyhtml.append("<div class='tablewrap'><table><thead><tr>"+"".join("<th>"+inline(v).replace("<link ","<a ").replace("</link>","</a>")+"</th>" for v in content[0])+"</tr></thead><tbody>"+"".join("<tr>"+"".join("<td>"+inline(v).replace("<link ","<a ").replace("</link>","</a>")+"</td>" for v in row)+"</tr>" for row in content[1:])+"</tbody></table></div>")
    htmlchapters.append("<section class='chapter'>"+"\n".join(bodyhtml)+"</section>")

doc.multiBuild(story)
pages=len(PdfReader(str(pdf)).pages)
combined="# GradeCrew Firmenzentrale - Gesamtplan und Betriebsbuch\n\nFassung 1.1 | 22.10.2026 | GC-BRAIN-01\n\n"+"\n\n---\n\n".join(texts)
(ROOT/"GradeCrew-Firmenzentrale-Gesamtplan.md").write_text(combined)
css="""
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f1f5f7;color:#182f40;font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}a{color:#006d77;overflow-wrap:anywhere}aside{position:fixed;left:0;top:0;width:278px;height:100vh;overflow:auto;background:#12283c;color:#fff;padding:28px 22px}aside h2{font-size:20px;line-height:1.3}aside p{font-size:13px;color:#c7d6df}aside ol{padding-left:20px}aside li{padding:6px 0;font-size:13px;line-height:1.45}aside a{color:#e1eef3;text-decoration:none}main{margin-left:278px;padding:42px;max-width:1320px}header{background:#12283c;color:#fff;padding:44px;border-radius:12px;margin-bottom:28px}header h1{font-size:38px;line-height:1.15;margin:0 0 20px}header p{color:#d6e5ec}.chapter{background:white;border:1px solid #d6e0e5;border-radius:10px;padding:34px 38px;margin-bottom:28px}h1,h2,h3{scroll-margin-top:20px}h1{font-size:29px;line-height:1.25;color:#12283c}h2{font-size:22px;line-height:1.4;color:#006d77;margin-top:32px}h3{font-size:18px;color:#12283c;margin-top:24px}.item{display:flex;gap:10px;margin:8px 0}.item>span{flex:0 0 20px}.tablewrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.5}th{text-align:left;background:#12283c;color:white}td,th{padding:10px;border:1px solid #d6e0e5;vertical-align:top;overflow-wrap:anywhere}tr:nth-child(even){background:#f1f5f7}pre{background:#f1f5f7;border:1px solid #d6e0e5;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.5 ui-monospace,monospace}figure{margin:24px 0}figure svg{width:100%;height:auto;max-height:420px}figcaption{font-size:13px;color:#526675}.meta{font-size:14px;color:#526675}footer{color:#526675;font-size:13px;padding:20px}@media(max-width:1000px){aside{position:static;width:auto;height:auto}aside ol{columns:2}main{margin:0;padding:18px}.chapter{padding:25px}header{padding:28px}}@media(max-width:550px){aside ol{columns:1}.chapter{padding:18px}main{padding:10px}header h1{font-size:30px}}@media print{@page{size:A4;margin:18mm}aside{display:none}main{margin:0;padding:0;max-width:none}body{background:white;font-size:10.5pt}.chapter{border:0;padding:0;page-break-before:always}header{border-radius:0}h2,h3{break-after:avoid}table{font-size:9pt}thead{display:table-header-group}tr{break-inside:avoid}pre{font-size:8pt}a{color:inherit;text-decoration:none}}
"""
pagehtml='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GradeCrew Firmenzentrale - Gesamtplan</title><style>'+css+'</style></head><body><aside><h2>Firmenzentrale</h2><p>Gesamtplan und Betriebsbuch<br>GC-BRAIN-01 · Fassung 1.1</p><ol>'+''.join(htmltoc)+'</ol></aside><main><header><h1>Unternehmen steuern.<br>Wissen zusammenführen.<br>Facharbeit nachvollziehbar ausführen.</h1><p>Gesamtplan · 22. Oktober 2026<br>19 Kapitel · 28 Umsetzungspakete · 72 Abnahmefälle</p></header>'+''.join(htmlchapters)+'<footer>Planungsfassung. Produktfähigkeiten und Freigaben gelten nur mit ihren tatsächlichen Nachweisen.</footer></main></body></html>'
(ROOT/"GradeCrew-Firmenzentrale-Leseansicht.html").write_text(pagehtml)
words=sum(len(re.findall(r"\S+",t)) for t in texts)
report={"taskId":"GC-BRAIN-01","version":"1.1","date":"2026-10-22","chapters":len(files),"words":words,"pdfPages":pages,"pdfFile":pdf.name,"pdfBytes":pdf.stat().st_size,"implementationPackages":28,"acceptanceCases":72,"automationProfiles":19,"authoringOnly":True,"independentMasterplanReview":"pending"}
report["chapterFiles"]=[{"name":p.name,"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(ROOT/"manifest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({k:report[k] for k in ["chapters","words","pdfPages","pdfBytes","implementationPackages","acceptanceCases","automationProfiles"]},ensure_ascii=False))

