from pathlib import Path
import html, json
P=Path(__file__).parent; BASE=P.parent
C={'ink':'#202b3c','muted':'#5e6b7b','bg':'#f6f7f9','line':'#dfe5ec','blue':'#285ac9','soft':'#edf3fd','green':'#267049','purple':'#713ac9','amber':'#8a5b05','teal':'#087b87'}
logo=(BASE/'assets/brand-icon-v1.svg').read_text().split('>',2)[-1].rsplit('</svg>',1)[0]
# Preserve authoritative paths by embedding original SVG markup, rather than redrawing the mark.
logo=(BASE/'assets/brand-icon-v1.svg').read_text(); logo=logo[logo.index('<svg'):]
def esc(s):return html.escape(str(s))
class S:
 def __init__(self,w,h):self.w=w;self.h=h;self.a=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',f'<rect width="{w}" height="{h}" fill="{C["bg"]}"/>']
 def rect(self,x,y,w,h,fill='white',r=14,stroke=None):self.a.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}"' if stroke else '')+'/>')
 def text(self,x,y,t,size=20,bold=False,fill=None):self.a.append(f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{fill or C["ink"]}">{esc(t)}</text>')
 def lines(self,x,y,lines,size=18,gap=28,fill=None):
  for i,t in enumerate(lines):self.text(x,y+i*gap,t,size,fill=fill)
 def button(self,x,y,w,label,primary=True):self.rect(x,y,w,48,C['blue'] if primary else 'white',9,None if primary else C['line']);self.text(x+18,y+31,label,17,True,'white' if primary else C['blue'])
 def field(self,x,y,w,label,value):self.text(x,y,label,15,True);self.rect(x,y+13,w,52,'white',9,C['line']);self.text(x+15,y+46,value,18)
 def pill(self,x,y,label,fill=None,w=None):w=w or len(label)*8+24;self.rect(x,y,w,30,fill or C['soft'],15);self.text(x+12,y+21,label,14,True,C['blue'])
 def brand(self,x=28,y=16):
  self.a.append(logo.replace('<svg ',f'<svg x="{x}" y="{y}" ').replace('width="512" height="512"','width="42" height="42"'));self.text(x+55,y+29,'GradeCrew',23,True)
 def shell(self,title,sub,phone=False):
  self.rect(0,0,self.w,78,'white',0);self.brand();self.text(self.w-198,47,'Konzept / Vorschlag',13,True,C['muted']);self.text(32,115,'‹ Spiele',16,False,C['blue']);self.text(32,163,title,30 if phone else 34,True);self.text(32,197,sub,16,fill=C['muted'])
 def save(self,n):
  self.text(28,self.h-20,'Nachtrag · 16.10.2026 · Kein Live-Screen',12,fill=C['muted']);self.a.append('</svg>');(P/'mockups'/n).write_text(''.join(self.a))

meta=[]
def save(s,n,title,device,explain):
 s.save(n);meta.append(dict(file=n,title=title,device=device,explain=explain))

s=S(1200,1160);s.shell('Welche Runde passt heute?','Fast Quiz Mathematik · eigener Übungstest · Klasse 6')
s.text(32,245,'1. Regeln der Runde',23,True)
for i,(title,lines,col) in enumerate([
 ('In Ruhe üben',['Passend zu deinem Lernstand.','Keine Rangliste und kein Punktedruck.'],C['green']),
 ('Gemeinsam antreten',['Gemeinsame Etappen.','Vergleichbare Aufgaben und Regeln.'],C['blue']),
 ('Punkte-Challenge',['Eine angekündigte Leiter.','Punkte und Wechsel vorher ansehen.'],C['purple'])]):
 x=32+i*382;s.rect(x,266,358,166,'white',14,C['blue'] if i==1 else C['line']);s.rect(x,266,358,6,col,3);s.text(x+20,311,title,23,True);s.lines(x+20,348,lines,16,27);s.text(x+20,406,'Ausgewählt' if i==1 else 'Auswählen',16,True,col)
s.text(32,484,'2. Arbeitsweise',23,True);s.text(32,516,'Arbeitsweise ist nicht dasselbe wie Schwierigkeit.',17,fill=C['muted'])
for i,(title,lines) in enumerate([
 ('Im Kopf',['Passende Zahlen, z. B. 240 : 6.','Auch anspruchsvoll möglich.']),
 ('Stift und Block',['Material bereitlegen.','Leichte bis komplexe Aufgaben.']),
 ('Länger nachdenken',['Mehr Zeit zum Verstehen.','Schritte begründen und prüfen.'])]):
 x=32+i*382;s.rect(x,543,358,140,C['soft'] if i==1 else 'white',14,C['blue'] if i==1 else C['line']);s.text(x+20,582,title,23,True);s.lines(x+20,619,lines,16,27)
s.text(32,735,'3. Lernziel und Zeit',23,True);s.field(32,772,550,'Anforderung','Schriftlich multiplizieren · Beispiel ansehen');s.field(610,772,558,'Rundenzeit','5 Minuten');s.field(32,883,550,'Erwartete Bearbeitungszeit','Zum Beispiel ca. 60 Sekunden je Aufgabe');s.field(610,883,558,'Wertung','Vor dem Start gemeinsam ansehen')
s.text(32,1001,'60 Sekunden sind eine Orientierung, keine automatische Abgabefrist.',18,True);s.text(32,1034,'Klasse, Arbeitsweise und Anforderung können unabhängig gewählt werden.',17,fill=C['muted']);s.button(32,1064,282,'Rundenvorschau prüfen')
save(s,'N1-lehrkraft-runden-und-arbeitsweisen.svg','Rundenregeln und Arbeitsweise getrennt wählen','Desktop / Lehrkraft','Drei Rundenpresets werden unabhängig von Arbeitsweise und fachlicher Anforderung gewählt. Die angezeigte Zeit je Aufgabe ist eine Orientierung; die Rundenzeit ist eine eigene Regel. Wertung und Wechsel werden vor dem Start angekündigt.')

s=S(900,1200);s.shell('Mit Stift und Block','Fast Quiz Mathematik · Punkte-Challenge · angekündigte Stufe 3')
s.pill(32,224,'Runde: noch 2:10',w=210);s.text(280,246,'Du hast 90 Punkte erreicht.',19,True)
s.rect(32,280,836,441);s.text(60,322,'Schriftliche Multiplikation',23,True);s.text(60,362,'Hier rechnest du mit zwei Teilprodukten.',20);s.text(60,441,'47 × 28',48,True);s.text(60,483,'Aus deinem Übungstest · gleicher Rechenweg',16,fill=C['muted']);s.field(60,529,780,'Dein Ergebnis','Ergebnis eingeben');s.button(60,637,265,'Antwort prüfen');s.button(347,637,270,'Hinweis ansehen',False)
s.rect(32,752,836,215,'#e8f0f7');s.text(60,793,'So zählt diese Aufgabe',24,True)
for x,n,t in [(60,'60 Punkte','Erster Versuch richtig'),(326,'30 Punkte','Richtig mit Hinweis'),(592,'0 Punkte','Vollständige Lösung')]:
 s.text(x,842,n,26,True,C['blue']);s.text(x,878,t,16)
s.text(60,902,'ohne Hinweis',14,fill=C['muted']);s.text(326,902,'vor der ersten Abgabe',14,fill=C['muted']);s.text(60,944,'Nur die erste Abgabe zählt. Keine geheimen Bonuspunkte.',16)
s.text(32,997,'Orientierung: etwa 60 Sekunden je Aufgabe',23,True);s.lines(32,1035,['Du darfst länger denken. Das ist keine automatische Abgabefrist.','Stift und Block bereitlegen. Tempo wird hier nicht zusätzlich belohnt.'],18,29);s.text(32,1130,'Vollständige Lösung ansehen · dann ohne Wertung weiter üben',17,True,C['blue'])
save(s,'N2-schueler-stift-block-punkte.svg','Zeit zum Denken und eine vorher erklärte Wertung','iPad / Lernende','Punkte-Challenge als ausdrücklich angekündigter Planmodus: Quellenfamilie schriftliche Multiplikation, Stufe 3 bei 90 bereits erreichten Punkten. Die passende Aufgabe 47 × 28 ist mit zwei Teilprodukten lösbar. Erste Abgabe richtig ohne Hinweis: 60 Punkte; Hinweis vor erster Abgabe: 30; vollständige Lösung: keine Wertung. Die Orientierung von 60 Sekunden und der verbleibende Rundentimer sind getrennt. Kein Livevertrag und keine erprobte Punkteskala.')

(P/'mockups/manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
(P/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><title>GradeCrew Nachtrag: Konzeptansichten</title><style>body{font-family:system-ui;color:#202b3c;background:#f6f7f9;margin:3rem auto;max-width:1200px}figure{margin:4rem 0}img{max-width:100%;max-height:90vh}p,figcaption{line-height:1.6;max-width:75ch}</style><h1>Rundenregeln und Arbeitsweisen</h1><p>Nachtrag vom 16.10.2026 · zwei statische Vorschläge · keine Live-App</p>'+''.join(f'<figure><h2>{m["title"]}</h2><img src="mockups/{m["file"]}" alt="{esc(m["title"])}"><figcaption>{m["explain"]}</figcaption></figure>' for m in meta))
