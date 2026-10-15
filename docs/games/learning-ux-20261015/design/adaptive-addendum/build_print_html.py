from pathlib import Path
import re,html,json,base64,hashlib
P=Path(__file__).parent;ROOT=P.parents[1];md=(ROOT/'ERGAENZUNG-PUNKTE-ARBEITSWEISEN-20261016.md').read_text();lines=md.splitlines();out=[];toc=[];i=0
inline=lambda s:html.escape(s)
def fmt(s):
 s=html.escape(s);s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s);s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s);s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'<a href="\2">\1</a>',s);return s
while i<len(lines):
 s=lines[i].strip()
 if not s:i+=1;continue
 m=re.match(r'^(#{1,4}) (.*)',s)
 if m:
  n=len(m[1]);key='s'+str(i);out.append(f'<h{n} id="{key}">{fmt(m[2])}</h{n}>')
  if n==2:toc.append(f'<li><a href="#{key}">{fmt(m[2])}</a></li>')
  i+=1;continue
 if s.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   cells=lines[i].strip().strip('|').split('|')
   if not all(re.fullmatch(r'\s*:?-+:?\s*',c) for c in cells):rows.append(cells)
   i+=1
  out.append('<table><thead><tr>'+''.join('<th>'+fmt(c.strip())+'</th>' for c in rows[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+fmt(c.strip())+'</td>' for c in row)+'</tr>' for row in rows[1:])+'</tbody></table>');continue
 if s.startswith('```'):
  b=[];i+=1
  while i<len(lines) and not lines[i].startswith('```'):b.append(lines[i]);i+=1
  out.append('<pre>'+html.escape('\n'.join(b))+'</pre>');i+=1;continue
 if re.match(r'^[-*] ',s):out.append('<p class="item">• '+fmt(s[2:])+'</p>');i+=1;continue
 if re.match(r'^\d+\. ',s):out.append('<p class="item">'+fmt(s)+'</p>');i+=1;continue
 if s.startswith('>'):out.append('<blockquote>'+fmt(s.lstrip('> '))+'</blockquote>');i+=1;continue
 if re.match(r'^[-*_]{3,}$',s):out.append('<hr>');i+=1;continue
 b=[s];i+=1
 while i<len(lines) and lines[i].strip() and not re.match(r'^(#{1,4} |\||>|```|[-*] |\d+\. )',lines[i].strip()):b.append(lines[i].strip());i+=1
 out.append('<p>'+fmt(' '.join(b))+'</p>')
def data(file):return 'data:image/svg+xml;base64,'+base64.b64encode(file.read_bytes()).decode()
style='''body{font-family:Arial,sans-serif;color:#202b3c;line-height:1.55;max-width:850px;margin:60px auto;padding:0 24px}h1,h2,h3,h4{font-family:"Trebuchet MS",Arial,sans-serif;line-height:1.18;break-after:avoid}h1{font-size:42px}h2{font-size:28px;margin:48px 0 20px}h3{font-size:20px;color:#285ac9;margin:28px 0 12px}p{margin:0 0 14px}a{color:#285ac9}nav{padding:24px;background:#edf3fd}nav li{margin:8px 0}table{width:100%;border-collapse:collapse;font-size:.83em;line-height:1.4;margin:20px 0;table-layout:auto}th,td{padding:10px;border-bottom:1px solid #dfe5ec;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#edf3fd;color:#285ac9}thead{display:table-header-group}tr{break-inside:avoid}code{color:#4c14d4;overflow-wrap:anywhere}pre{white-space:pre-wrap;background:#edf3fd;padding:16px}blockquote{border-left:3px solid #285ac9;padding:12px 18px;background:#edf3fd}figure{margin:30px 0;break-before:page;break-inside:avoid}figure img{display:block;max-width:100%;max-height:690px;margin:20px auto}figcaption{font-size:.9em}.note{color:#5e6b7b;font-size:.85em}.brand{width:110px} @page{size:A4;margin:18mm 17mm}@media print{body{max-width:none;margin:0;padding:0;font-size:11pt}nav{break-after:page}h1{font-size:32pt}h2{font-size:22pt}h3{font-size:15pt}table{font-size:8.5pt}figure img{max-height:205mm}a{text-decoration:none}.note{font-size:9pt}}'''
views=''.join('<figure><h3>Konzeptansicht '+str(i+1)+': '+html.escape(m['title'])+'</h3><p class="note">'+m['device']+' · Konzept / Vorschlag · kein Live-Screen</p><img alt="'+html.escape(m['title'])+'" src="'+data(P/'mockups'/m['file'])+'"><figcaption>'+html.escape(m['explain'])+'</figcaption></figure>' for i,m in enumerate(json.loads((P/'mockups/manifest.json').read_text())))
provenance='Das unveränderte GradeCrew-Zeichen stammt aus dem im Hauptbuch belegten Brand-Core-Commit c458dd1a82f82873b52877b9d914d24efd0b27c5. Die beiden neuen nativen SVG-Ansichten sind Konzeptvorschläge dieses Auftrags. Keine öffentliche freie Markenlizenz, neue Runtimefähigkeit oder erprobte Punkteskala wird behauptet. Der 61-seitige Masterplan bleibt unverändert.'
body='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GradeCrew Lernspiele - Nachtrag Punkte und Arbeitsweisen</title><style>'+style+'</style></head><body><img class="brand" alt="Vorhandenes GradeCrew-Zeichen" src="'+data(P.parent/'assets/brand-icon-v1.svg')+'"><p class="note">GC-GAMES-LEARNING-UX-01 · Nachtrag 16.10.2026 · Satzstand 16.10.2026 · Vorschlag zur Prüfung</p><nav aria-label="Inhaltsverzeichnis"><h2>Inhalt</h2><ol>'+''.join(toc)+'</ol><p class="note">Die verbindliche Seitenzählung und PDF-Lesezeichen stehen in der separat gesetzten PDF. Diese HTML-Fassung ist eine selbständige Druck- und Lesefassung; ihr Umbruch hängt vom Browser ab.</p></nav>'+''.join(out)+'<h2>Designatlas</h2><p>Zwei statische Konzeptansichten, keine umgesetzte App. Fiktive Beispiele; QR-Platzhalter ohne Beitrittsfunktion.</p>'+views+'<h2>Gestaltungsgrundlage und Assetprovenienz</h2>'+''.join('<p>'+fmt(p)+'</p>' for p in provenance.strip().split('\n\n'))+'</body></html>'
file=ROOT/'final/GradeCrew-Spiele-Nachtrag-Adaptive-Runden-20261016.html';file.write_text(body)
print(json.dumps({'html':str(file),'source_sha256':hashlib.sha256(md.encode()).hexdigest(),'html_sha256':hashlib.sha256(body.encode()).hexdigest(),'bytes':len(body.encode()),'embedded_views':2},ensure_ascii=False))
