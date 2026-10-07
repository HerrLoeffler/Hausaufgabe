"""Build the design reader and PDF; this is documentation tooling, not game code."""
from pathlib import Path
from fractions import Fraction
from itertools import permutations
import hashlib, html, json, re, struct

ROOT = Path(__file__).resolve().parent
CATALOG = json.loads((ROOT / 'catalog.json').read_text())
FILES = ['01-spielbuch.md', '02-drehbuch.md', '03-bauvertrag.md', '04-bildpruefung.md']

def inline(text):
    text = html.escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', r'<a href="\2">\1</a>', text)
    return text

def blocks(text):
    for b in re.split(r'\n\s*\n', text.strip()):
        if b.startswith('## '):
            yield 'h2', b[3:]
        elif b.startswith('# '):
            yield 'h1', b[2:]
        elif b.startswith('|'):
            rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in b.splitlines()]
            rows = [r for r in rows if not all(re.fullmatch(r'[: -]+', c or '-') for c in r)]
            yield 'table', rows
        else:
            yield 'p', b.replace('\n', ' ')

def as_html(text):
    out = []
    for kind, value in blocks(text):
        if kind == 'table':
            out.append('<div class="table-wrap"><table>' + ''.join('<tr>' + ''.join(
                f'<{"th" if n == 0 else "td"}>{inline(c)}</{"th" if n == 0 else "td"}>'
                for c in r) + '</tr>' for n, r in enumerate(value)) + '</table></div>')
        elif kind == 'h2':
            key = 'chapter-' + re.sub(r'\D', '', value.split('·')[0])
            out.append(f'<h2 id="{key}">{inline(value)}</h2>')
        else:
            out.append(f'<{kind}>{inline(value)}</{kind}>')
    return ''.join(out)

def shape_rotate(points, q):
    for _ in range(q):
        points = [(3-y, x) for x, y in points]
    return points

def canonical(points):
    seq = [tuple(p) for p in points]
    candidates = []
    for arr in (seq, list(reversed(seq))):
        candidates.extend(tuple(arr[n:] + arr[:n]) for n in range(len(arr)))
    return min(candidates)

def verify_design():
    assert len(CATALOG) == 12 and all(len(b['items']) == 20 for b in CATALOG)
    for b in CATALOG:
        assert len(set(b['items'])) == 20
    calculations = {
        'S1': Fraction(20*25, 100), 'S2': 1-Fraction(1,2)-Fraction(1,4),
        'S3': 12*Fraction(1,2), 'S4': Fraction(3,4)*100,
        'S5': Fraction(1,2)+Fraction(1,4), 'S6': Fraction(16*25,100),
        'S7': Fraction(3,4)>Fraction(2,3),
    }
    expected = {'S1':5, 'S2':Fraction(1,4), 'S3':6, 'S4':75,
                'S5':Fraction(3,4), 'S6':4, 'S7':True}
    assert calculations == expected
    transfer = [Fraction(12,4),1-Fraction(1,4),Fraction(10,2),Fraction(100,4),
                Fraction(1,4)+Fraction(1,4),Fraction(8,4),Fraction(1,2)>Fraction(1,3)]
    assert transfer == [3,Fraction(3,4),5,25,Fraction(1,2),2,True]
    assert Fraction(7,12) >= Fraction(55,100) and Fraction(7,12) <= Fraction(60,100)
    school, logic, travel = 330, 130, 130
    assert school+logic+travel == 590
    assert Fraction(55,100) <= Fraction(school,590) <= Fraction(60,100)
    orders = [p for p in permutations(['Blatt','Welle','Sonne'])
              if p.index('Blatt') < p.index('Welle') and p.index('Sonne') == p.index('Welle')+1]
    assert orders == [('Blatt','Welle','Sonne')]
    places = [('Bank','Holz','still'),('Felsbogen','Stein','fließend'),('Brücke','Holz','fließend')]
    assert [p[0] for p in places if p[1:] == ('Holz','fließend')] == ['Brücke']
    target = [(0,0),(3,0),(3,1),(2,1),(2,3),(0,3)]
    ends = [(0,2),(2,2)]
    candidates = {
        'A': {'outline':target, 'ends':[(0,1),(3,1)]},
        'B': {'outline':[(0,0),(3,0),(3,1),(2,1),(2,2),(2.5,2),(2.5,2.5),(2,2.5),(2,3),(0,3)],'ends':ends},
        'C': {'outline':target, 'ends':ends},
    }
    valid = [(key,q) for key,c in candidates.items() for q in range(4)
             if canonical(shape_rotate(c['outline'],q)) == canonical(target)
             and sorted(shape_rotate(c['ends'],q)) == sorted(ends)]
    assert valid == [('C',0)]
    geometry = {'units':'normierte Baukoordinaten; vier Drehungen um (1.5,1.5)',
                'target':target, 'targetLineEnds':ends, 'candidates':candidates,
                'validCandidate':'C','validQuarterTurns':0}
    (ROOT/'mosaic-geometry.json').write_text(json.dumps(geometry,ensure_ascii=False,indent=2)+'\n')
    pngs = []
    for f in sorted((ROOT/'boards').glob('*.png')):
        data = f.read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        w,h = struct.unpack('>II',data[16:24])
        assert w >= 1400 and h >= 900
        pngs.append({'path':str(f.relative_to(ROOT)), 'width':w,'height':h,
                     'sha256':hashlib.sha256(data).hexdigest(),
                     'gitBlob':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
    assert len(pngs) == 13, f'Expected 13 boards, got {len(pngs)}'
    for b in CATALOG:
        assert (ROOT/'boards'/f"{b['id']}.png").exists()
    return {'scope':'Entwurfsdaten, keine Runtime-/Geräteprüfung','motifs':244,
            'boards':pngs,'schoolTasks':7,'logicTasks':5,'schoolRatio':float(Fraction(7,12)),
            'plannedActiveSeconds':590,'plannedSchoolSeconds':330,
            'plannedSchoolTimeRatio':float(Fraction(330,590)),
            'mathChecks':{k:str(v) for k,v in calculations.items()},'transferChecks':[str(v) for v in transfer],
            'validSymbolOrders':orders,'mosaicConfigurationsChecked':12,'validMosaic':valid}

def geometry_svg():
    g = json.loads((ROOT/'mosaic-geometry.json').read_text())
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260" role="img" aria-label="Mosaikgeometrie: Ziel, Kandidat A falsche Linie, B falsche Kontur, C passt">']
    data = [('Ziel',g['target'],g['targetLineEnds'])] + [(k,c['outline'],c['ends']) for k,c in g['candidates'].items()]
    for i,(label,points,ends) in enumerate(data):
        x0 = i*220+32; y0 = 44; scale = 52
        pts = ' '.join(f'{x0+x*scale},{y0+y*scale}' for x,y in points)
        parts.append(f'<polygon points="{pts}" fill="#e9dcc4" stroke="#5a584d" stroke-width="3"/>')
        (a,b) = ends
        parts.append(f'<path d="M{x0+a[0]*scale},{y0+a[1]*scale} Q{x0+(a[0]+b[0])*scale/2},{y0+(a[1]+b[1])*scale/2-20} {x0+b[0]*scale},{y0+b[1]*scale}" fill="none" stroke="#226e78" stroke-width="5"/>')
        parts.append(f'<text x="{x0}" y="236" font-family="Arial,sans-serif" font-size="20" fill="#23363c">{label}</text>')
    parts.append('</svg>')
    return ''.join(parts)

def make_reader(report):
    texts = [(f,(ROOT/f).read_text()) for f in FILES]
    chapters = [(v, 'chapter-'+re.sub(r'\D','',v.split('·')[0])) for _,t in texts for k,v in blocks(t) if k=='h2']
    catalog_text = '# Bildkatalog – 240 kleine Studien\n\n'
    for b in CATALOG:
        catalog_text += f"## Tafel {b['id']} · {b['title']}\n\n![Bildtafel](boards/{b['id']}.png)\n\n"
        catalog_text += '\n'.join(f"- {b['id']}.{i+1:02}: {s}" for i,s in enumerate(b['items']))+'\n\n'
    (ROOT/'05-bildkatalog.md').write_text(catalog_text.rstrip()+'\n')
    wc = sum(len(t.split()) for _,t in texts) + len(catalog_text.split())
    report['readableWordCount'] = wc
    nav = ''.join(f'<button class="board-button" data-board="{b["id"]}">{b["id"]} · {html.escape(b["title"])}</button>' for b in CATALOG)
    chapter_nav = ''.join(f'<a href="#{key}">{html.escape(title)}</a>' for title,key in chapters)
    sections = ''.join(f'<section class="reading" id="text-{i}" hidden>{as_html(t)}</section>' for i,(_,t) in enumerate(texts))
    css = '''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f4f0e6;color:#24363a;font:16px/1.65 -apple-system,BlinkMacSystemFont,Arial,sans-serif}button,a,input{font:inherit}button{cursor:pointer}a{color:#206e78}header{padding:34px 5vw 24px;background:#193b40;color:#fff}header p{max-width:760px;margin:12px 0;color:#e7e4d7}h1{font-size:clamp(30px,4vw,54px);line-height:1.1;margin:4px 0 15px;letter-spacing:-1px}header .eyebrow{text-transform:uppercase;font-size:12px;letter-spacing:2px;color:#e6bc77}.facts{display:flex;gap:22px;flex-wrap:wrap;font-size:14px}.tabs{display:flex;gap:4px;flex-wrap:wrap;padding:14px 5vw;background:#fffdf7;border-bottom:1px solid #ded8c8}.tabs button{border:0;background:transparent;padding:10px 16px;border-radius:6px;color:#344a4e}.tabs button[aria-selected=true]{background:#206e78;color:#fff}.layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:38px;max-width:1500px;margin:auto;padding:30px 4vw}aside{align-self:start;position:sticky;top:20px;max-height:88vh;overflow:auto}.board-button,aside a{display:block;width:100%;padding:9px 12px;background:transparent;border:0;text-align:left;text-decoration:none;font-size:14px;color:#43595d;border-radius:5px}.board-button[aria-pressed=true]{background:#e0e7dd;color:#174d54;font-weight:600}.reading{max-width:830px}.reading h1{font-size:30px;margin:20px 0}.reading h2{font-size:24px;line-height:1.35;margin:45px 0 18px;scroll-margin-top:20px}.reading p{margin:0 0 20px}.reading code{overflow-wrap:anywhere;font-size:14px;background:#eae7db;padding:2px 4px}main{min-width:0}main h2{font-size:26px;margin:0 0 6px}.subtitle{margin:0 0 22px;color:#526769}.board-image{display:block;width:100%;height:auto;border-radius:8px;background:#e6e0d1}.board-actions{display:flex;gap:24px;margin:14px 0 25px;font-size:14px}.catalog{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;padding:0;list-style:none}.catalog li{padding:14px 0;border-top:1px solid #dcd6c6;font-size:14px}.catalog strong{display:block;color:#7b603d;font-size:12px}.note{padding:18px 20px;background:#e9e3d4;margin:24px 0;font-size:14px}.table-wrap{overflow:auto;margin:25px 0}table{width:100%;border-collapse:collapse;font-size:14px}td,th{text-align:left;vertical-align:top;padding:12px 10px;border-bottom:1px solid #cfcbbb}th{color:#1b5e66}footer{font-size:13px;color:#657579;margin:45px 0}.geometry{width:100%;height:auto}.mobile-menu{display:none}button:focus-visible,a:focus-visible{outline:3px solid #b87522;outline-offset:3px}[hidden]{display:none!important}@media(max-width:850px){.layout{grid-template-columns:1fr;padding:22px 5vw}aside{position:static;max-height:none;display:flex;overflow:auto;gap:6px}.board-button,aside a{width:auto;min-width:170px;background:#ece8dd}.catalog{grid-template-columns:1fr}.reading h2{font-size:22px}header{padding-top:28px}.tabs{gap:0}.tabs button{padding:9px 11px;font-size:14px}}@media print{header,.tabs,aside,.board-actions{display:none}.layout{display:block;padding:0}.reading[hidden]{display:block!important}.reading h2{break-before:page}.board-image{break-inside:avoid}}'''
    data = json.dumps(CATALOG,ensure_ascii=False).replace('</','<\\/')
    page = f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Expedition · Masterprojekt</title><style>{css}</style></head><body>
<header><div class="eyebrow">GradeCrew · Gestaltungsbuch · 08. Oktober 2026</div><h1>Das verschwundene<br>Leuchtfeuer</h1><p>Eine kleine Küstenwelt. Große, klare Wege. Fragen, die etwas verändern. Der visuelle Neuentwurf vor dem nächsten Unreal-Bau.</p><div class="facts"><span>244 Entwurfsmotive</span><span>{wc:,} Wörter</span><span>7 Lern- und 5 Logikstationen</span><span>10 Minuten als Testziel</span></div></header>
<nav class="tabs" aria-label="Inhalte"><button aria-selected="true" data-tab="boards">Bildwelt</button><button aria-selected="false" data-tab="text-0">Spielbuch</button><button aria-selected="false" data-tab="text-1">Drehbuch</button><button aria-selected="false" data-tab="text-2">Bauvertrag</button><button aria-selected="false" data-tab="text-3">Bildprüfung</button></nav>
<div class="layout"><aside id="board-nav"><button class="board-button" data-board="00" aria-pressed="true">00 · Vier Zielansichten</button>{nav}</aside><aside id="chapter-nav" hidden>{chapter_nav}</aside><main>
<section id="boards"><h2 id="board-title">Vier Zielansichten</h2><p class="subtitle" id="board-subtitle">Ort · Waldweg · Strand · Ruine</p><img class="board-image" id="board-image" src="boards/00-master.png" alt="Vier generierte Zielansichten einer eigenen Küstenwelt"><div class="board-actions"><a id="full-image" href="boards/00-master.png" target="_blank" rel="noopener">Tafel in Originalgröße</a><a href="Expedition-Masterprojekt.pdf">Gesamtes Buch als PDF</a></div><div class="note">Entwurfsbilder, kein neuer spielbarer Build. Mengen, Rätselzustände und Bedienung werden durch das Textbuch festgelegt. Abweichungen stehen unter „Bildprüfung“.</div><ol class="catalog" id="catalog"><li><strong>00.01</strong>Küstenort: klarer erster Begegnungsraum</li><li><strong>00.02</strong>Wald: gerahmter Hauptweg</li><li><strong>00.03</strong>Strand: Steg und nächste Treppe</li><li><strong>00.04</strong>Ruine: breite Mittelachse und Finale</li></ol></section>
{sections}<section id="geometry-section" hidden><h2>R4 · Verbindliche Mosaikgeometrie</h2><p>Nur C passt in Umriss und Linienfortsetzung. Die Rasterstudien ersetzen diese Geometrie nicht.</p>{geometry_svg()}</section><footer>Eigene Entwürfe mit eingebautem image_gen. Keine zusätzlichen Spielbibliotheken. Dokumentation lokal und auf dem Aufgabenbranch; kein Deployment. <a href="prompts.json">Generierungsprompts</a> · <a href="verification.json">Prüfprotokoll</a></footer></main></div>
<script>const catalog={data};const esc=s=>s.replace(/[&<>"']/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));
function selectTab(id){{document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===id));document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!==id);document.getElementById('board-nav').hidden=id!=='boards';document.getElementById('chapter-nav').hidden=id==='boards';document.querySelectorAll('#chapter-nav a').forEach(a=>a.hidden=!document.querySelector('#'+id+' '+a.getAttribute('href')));document.getElementById('geometry-section').hidden=id!=='text-2';}}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.tab)));
document.querySelectorAll('[data-board]').forEach(b=>b.addEventListener('click',()=>{{const id=b.dataset.board;document.querySelectorAll('[data-board]').forEach(x=>x.setAttribute('aria-pressed',x===b));const item=catalog.find(x=>x.id===id);const url='boards/'+(id==='00'?'00-master':id)+'.png';document.getElementById('board-image').src=url;document.getElementById('board-image').alt=item?item.title:'Vier große Zielansichten';document.getElementById('full-image').href=url;document.getElementById('board-title').textContent=item?item.title:'Vier Zielansichten';document.getElementById('board-subtitle').textContent=item?'Tafel '+id+' · 20 Studien mit Bauzweck':'Ort · Waldweg · Strand · Ruine';document.getElementById('catalog').innerHTML=(item?item.items:['Küstenort: klarer erster Begegnungsraum','Wald: gerahmter Hauptweg','Strand: Steg und nächste Treppe','Ruine: breite Mittelachse und Finale']).map((s,i)=>'<li><strong>'+id+'.'+String(i+1).padStart(2,'0')+'</strong>'+esc(s)+'</li>').join('');}}));
selectTab('boards');</script></body></html>'''
    (ROOT/'index.html').write_text(page)

def make_pdf():
    from reportlab.pdfgen import canvas
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, KeepTogether
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.colors import HexColor
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Book','/System/Library/Fonts/Supplemental/Arial.ttf'))
    pdfmetrics.registerFont(TTFont('BookBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
    pdfmetrics.registerFontFamily('Book',normal='Book',bold='BookBold',italic='Book',boldItalic='BookBold')
    color = HexColor('#24363a'); teal = HexColor('#206e78')
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='BookBody',fontName='Book',fontSize=10.7,leading=15.5,textColor=color,spaceAfter=10))
    styles.add(ParagraphStyle(name='BookHeading',fontName='BookBold',fontSize=20,leading=25,textColor=teal,spaceAfter=18,keepWithNext=True))
    styles.add(ParagraphStyle(name='BookSmall',fontName='Book',fontSize=8.8,leading=12,textColor=color,spaceAfter=6))
    styles.add(ParagraphStyle(name='Cover',fontName='BookBold',fontSize=34,leading=39,textColor=color,spaceAfter=24))
    width = A4[0]-38*mm
    def clean(s):
        s = s.replace('–','-').replace('—','-').replace('\u2011','-')
        s = html.escape(s)
        s = re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
        s = re.sub(r'`([^`]+)`',r'\1',s)
        s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1 (\2)',s)
        return s
    def p(s,style='BookBody'):
        return Paragraph(clean(s),styles[style])
    class BookDoc(SimpleDocTemplate):
        def afterFlowable(self,flowable):
            if isinstance(flowable,Paragraph) and flowable.style.name=='BookHeading':
                title=flowable.getPlainText();key='outline-'+str(self.page)+'-'+hashlib.sha1(title.encode()).hexdigest()[:8]
                self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,0,False)
    def footer(c,doc):
        c.setFillColor(HexColor('#647579'));c.setFont('Book',8)
        c.drawString(19*mm,12*mm,'GradeCrew · Expedition · Gestaltungsstand 08.10.2026')
        c.drawRightString(A4[0]-19*mm,12*mm,str(doc.page))
    def image_fit(path):
        from PIL import Image as PILImage
        with PILImage.open(path) as im:w,h=im.size
        return Image(str(path),width=width,height=width*h/w)
    doc=BookDoc(str(ROOT/'Expedition-Masterprojekt.pdf'),pagesize=A4,rightMargin=19*mm,leftMargin=19*mm,topMargin=19*mm,bottomMargin=20*mm,title='Expedition - Das verschwundene Leuchtfeuer',author='GradeCrew')
    story=[p('GRADECREW · MASTERPROJEKT','BookSmall'),Spacer(1,12*mm),p('Das verschwundene Leuchtfeuer','Cover'),p('Visuelle Grundlage und vollständiges Spielbuch für die neue Unreal-Expedition.'),image_fit(ROOT/'boards/00-master.png'),Spacer(1,12*mm),p('244 Entwurfsmotive · 50 Kernkapitel · sieben Schulstationen und fünf Logikstationen'),p('Ungefähr zehn aktive Minuten als Testziel. Entwurfsstand, kein neuer spielbarer Build. 08. Oktober 2026.','BookSmall'),PageBreak(),p('Leseroute','BookHeading')]
    for name in FILES:
        for kind,value in blocks((ROOT/name).read_text()):
            if kind=='h2':story.append(p(value,'BookSmall'))
    story += [Spacer(1,5*mm),p('Danach: vier Zielansichten, zwölf Übersichtstafeln mit ihren vollständigen Motivkatalogen und die exakte Mosaikgeometrie. Die PDF-Lesezeichen führen direkt zu Kapiteln und Tafeln.','BookSmall')]
    for name in FILES:
        for kind,value in blocks((ROOT/name).read_text()):
            if kind=='h1':continue
            if kind=='h2':story += [PageBreak(),p(value,'BookHeading')]
            elif kind=='table':
                cells=[[p(c,'BookSmall') for c in r] for r in value]
                cols=len(value[0]); weights=[1]*cols
                if cols==3:weights=[1.5,.6,3]
                if cols==4:weights=[.6,1.1,1.7,1.8]
                tw=[width*v/sum(weights) for v in weights]
                t=Table(cells,colWidths=tw,repeatRows=1,hAlign='LEFT')
                t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),HexColor('#e6eddf')),('LINEBELOW',(0,0),(-1,-1),.35,HexColor('#d1d7c8')),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
                story += [t,Spacer(1,8*mm)]
            else:story.append(p(value))
    story += [PageBreak(),p('Vier große Zielansichten','BookHeading'),image_fit(ROOT/'boards/00-master.png'),Spacer(1,10*mm),p('01 Küstenort · 02 Waldweg · 03 Strand · 04 Ruine'),p('Die Material- und Formrichtung ist verbindlicher Bezug. Unpassende Mengen und Kamerawinkel werden beim eigenen Modell- und Levelbau korrigiert.','BookSmall')]
    for b in CATALOG:
        story += [PageBreak(),p(f"Tafel {b['id']} - {b['title']}",'BookHeading'),image_fit(ROOT/'boards'/f"{b['id']}.png"),Spacer(1,8*mm),p('20 Entwurfsstudien. Der folgende Katalog nennt die gewünschte Funktion; Abweichungen der generierten Motive sind im Kapitel Bildprüfung aufgeführt.','BookSmall'),PageBreak(),p(f"Motivkatalog {b['id']}",'BookHeading')]
        story += [p(f"{b['id']}.{i+1:02} - {item}",'BookBody') for i,item in enumerate(b['items'])]
    from reportlab.graphics.shapes import Drawing,Polygon,Line,String,Path as DrawPath
    d=Drawing(width,150)
    g=json.loads((ROOT/'mosaic-geometry.json').read_text())
    geo=[('Ziel',g['target'],g['targetLineEnds'])]+[(k,v['outline'],v['ends']) for k,v in g['candidates'].items()]
    for i,(label,pts,ends) in enumerate(geo):
        x0=i*width/4+8;y0=125;scale=29
        poly=[z for x,y in pts for z in (x0+x*scale,y0-y*scale)]
        d.add(Polygon(poly,fillColor=HexColor('#e9dcc4'),strokeColor=color,strokeWidth=1))
        a,b=ends;d.add(Line(x0+a[0]*scale,y0-a[1]*scale,x0+b[0]*scale,y0-b[1]*scale,strokeColor=teal,strokeWidth=2))
        d.add(String(x0,12,label,fontName='BookBold',fontSize=11,fillColor=color))
    story += [PageBreak(),p('R4 - Exakte Baugeometrie','BookHeading'),d,p('A passt im Umriss, aber seine Linie hat falsche Anschlussstellen. B hat einen zusätzlichen Vorsprung. C passt im Umriss und verbindet die richtigen Anschlussstellen. Nur C in der angegebenen Orientierung ist gültig.'),p('Normierte Koordinaten und alle zwölf Kandidat-/Drehkonfigurationen stehen in mosaic-geometry.json. Das ist eine überprüfte Entwurfsregel, keine bereits gebaute Rätselgeometrie.'),p('Sicherung und Prüfumfang','BookHeading'),p('Quellen, Bilder und Generierungsprompts liegen im eigenen GradeCrew-Aufgabenbranch. Designprüfungen umfassen Bilddateien, Kataloganzahl, mathematische Beispiele, Symbolpermutationen und Mosaikdefinition. Runtime, Maus, Touch, tatsächliche Laufzeit, GradeCrew-Livebetrieb und finale Modellqualität bleiben eigene nächste Abnahmen.','BookSmall')]
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    from pypdf import PdfReader
    reader=PdfReader(ROOT/'Expedition-Masterprojekt.pdf')
    return len(reader.pages)

if __name__=='__main__':
    report=verify_design()
    make_reader(report)
    report['pdfPages']=make_pdf()
    (ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ('motifs','readableWordCount','pdfPages','mosaicConfigurationsChecked')},ensure_ascii=False))
