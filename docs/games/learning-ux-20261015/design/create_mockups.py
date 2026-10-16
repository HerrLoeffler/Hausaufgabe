from pathlib import Path
import html, json
P=Path(__file__).parent
C={'ink':'#202b3c','muted':'#5e6b7b','bg':'#f6f7f9','line':'#dfe5ec','blue':'#285ac9','soft':'#edf3fd','green':'#267049','purple':'#713ac9','amber':'#8a5b05','teal':'#087b87'}
logo=(P/'assets/brand-icon-v1.svg').read_text().split('>',2)[-1].rsplit('</svg>',1)[0]
# Preserve authoritative paths by embedding original SVG markup, rather than redrawing the mark.
logo=(P/'assets/brand-icon-v1.svg').read_text(); logo=logo[logo.index('<svg'):]
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
  self.text(28,self.h-20,'Planansicht · 15.10.2026 · Kein Live-Screen',12,fill=C['muted']);self.a.append('</svg>');(P/'mockups'/n).write_text(''.join(self.a))
meta=[]
def save(s,n,title,device,explain):s.save(n);meta.append(dict(file=n,title=title,device=device,explain=explain))
# 1 hub
s=S(1180,880);s.shell('Womit möchtest du üben?','Ein Spiel wählen. Mit einem Thema oder deinem eigenen Test starten.')
s.pill(32,224,'Alle Spiele',w=120);s.pill(166,224,'Meine Tests',w=120);s.text(945,245,'Für die Klasse starten',16,True,C['blue'])
games=[('±','Fast Quiz','Mathematik','Rechnen, verstehen, ausprobieren.',C['blue']),('Aa','Fehlerjagd','Deutsch','Fehler entdecken und begründen.',C['purple']),('ab','Vocab Rush','Sprachen','Wörter aktiv erinnern und anwenden.',C['teal']),('⌁','Wissensreise','Dein Fach','Eine Route durch deinen eigenen Test.',C['green'])]
for i,(icon,name,subject,desc,color) in enumerate(games):
 x=32+(i%2)*570;y=282+(i//2)*245;s.rect(x,y,546,220);s.rect(x,y,8,220,color,4);s.rect(x+24,y+24,62,62,C['soft'],12);s.text(x+37,y+65,icon,28,True,color);s.text(x+105,y+43,subject,15,True,color);s.text(x+105,y+78,name,27,True);s.text(x+24,y+124,desc,18);s.button(x+24,y+150,184,'Spiel auswählen')
s.text(32,815,'Zuletzt verwendet: Mein Übungstest · 8 Aufgaben · weiter üben',17)
save(s,'01-hub-desktop.svg','Der gemeinsame Spiele-Hub','Desktop','Eine gemeinsame Marke, vier klare Fachprofile. Eine primäre Auswahl pro Spiel führt zum einfachen Start; die genaue Auswahl folgt bei Bedarf.')
#2 simple start tablet
s=S(900,1000);s.shell('Einfach starten','Fast Quiz · Mathematik')
s.rect(32,231,836,596);s.text(60,271,'Was möchtest du üben?',24,True);s.pill(60,296,'Thema',w=100);s.pill(174,296,'Eigener Test',w=130);s.field(60,373,780,'Thema','Brüche addieren');s.field(60,473,376,'Dauer','5 Minuten');s.field(464,473,376,'Schwierigkeit','Gleiche Nenner');s.text(60,595,'Beispiel: ¼ + ¼ = ?',22,True);s.lines(60,630,['Du übst einen Rechenschritt. Hilfe ist jederzeit verfügbar.','Keine Schulnote. Dein Lernfortschritt gehört dir.'],17);s.button(60,725,215,'Übungsrunde starten');s.button(294,725,256,'Mit Remy beschreiben',False)
s.text(45,880,'Genau auswählen: Lehrplan, Schulart, Jahrgang, Kompetenz',17,True,C['blue']);s.text(45,918,'Einstellungen bleiben änderbar, bevor die Runde beginnt.',17,fill=C['muted'])
save(s,'02-einfachstart-ipad.svg','Ein schneller Start mit wenigen Entscheidungen','iPad','Thema oder eigener Test, Dauer und greifbare Schwierigkeit. Die umfangreiche Lehrplanauswahl liegt hinter einem zweiten Einstieg.')
#3 remy desktop
s=S(1180,880);s.shell('Mit Remy vorbereiten','Beschreiben ist optional. Du prüfst den Vorschlag vor dem Start.')
s.rect(32,232,530,558);s.text(60,272,'Was soll geübt werden?',23,True);s.rect(60,297,474,170,C['soft'],12);s.lines(78,333,['Wir üben fünf Minuten Brüche addieren.','Bitte mit gleichen Nennern anfangen.','Nutze meinen eigenen Übungstest.'],20);s.field(60,510,474,'Material','Mein Übungstest · 8 Aufgaben');s.button(60,628,230,'Vorschlag vorbereiten');s.text(60,723,'Kein Chat nötig: Felder direkt ausfüllen.',16,fill=C['muted'])
s.rect(589,232,559,558);s.text(617,272,'So habe ich dich verstanden',23,True);s.pill(617,297,'Bitte prüfen',w=140)
for i,(a,b) in enumerate([('Spiel','Fast Quiz'),('Thema','Brüche addieren'),('Dauer','5 Minuten'),('Schwierigkeit','Gleiche Nenner, ein Rechenschritt'),('Quelle','Eigener Test; 6 passende Aufgaben')]):s.text(617,370+i*54,a,15,False,C['muted']);s.text(762,370+i*54,b,17,True)
s.button(617,691,230,'Vorschlag verwenden');s.text(868,721,'Ändern',17,True,C['blue']);save(s,'03-remy-vorschau-desktop.svg','Remy übersetzt einen Wunsch in prüfbare Felder','Desktop','Die Parameter stehen vor dem Start offen. Materialauswahl und Anpassungen bleiben sichtbar; Mehrdeutigkeit erzeugt eine Rückfrage statt stiller Annahmen.')
#4 advanced
s=S(1180,940);s.shell('Genau auswählen','Lehrplan ist eine Hilfe zur Auswahl. Ein eigener Test bleibt möglich.')
s.rect(32,234,1116,526);s.field(60,275,335,'Bundesland','Bayern');s.field(422,275,335,'Schulart','Mittelschule');s.field(784,275,335,'Jahrgang','6');s.field(60,380,510,'Fach','Mathematik');s.field(598,380,521,'Bereich','Zahlen und Operationen');s.field(60,485,1059,'Kompetenz','Brüche addieren und den Rechenweg erklären');s.text(60,600,'Die Auswahl ist ein Filter, keine starre Schwierigkeitsstufe.',19,True);s.text(60,635,'Schwierigkeit an Vorwissen, Aufgabenbeispiel und Hilfe prüfen.',18);s.pill(60,675,'Quelle: Lehrplanbezug vor Freigabe fachlich prüfen',w=470)
s.rect(32,784,1116,94,'#e8f0f7');s.text(60,820,'Materialquelle wechseln',20,True);s.text(60,850,'Thema  /  vorhandener Test  /  mit Remy vorbereiteter eigener Test',18);s.button(885,807,234,'Auswahl übernehmen');save(s,'04-lehrplan-desktop.svg','Die genaue Auswahl bleibt verfügbar','Desktop','Abhängige Filter werden schrittweise eingeblendet. Bei einem Wechsel werden unpassende Folgewerte erklärt, statt verdeckt weiterverwendet.')
#5 difficulty
s=S(900,1000);s.shell('Welche Herausforderung passt?','Eine Stufe beschreibt die Aufgabe, nicht deinen Wert.')
for i,(title,lines,ex) in enumerate([('Gleiche Nenner',['Ein Rechenschritt · anschauliche Hilfe'],'¼ + ¼ = ?'),('Verschiedene Nenner',['Gleichnamig machen · Hinweise auf Wunsch'],'½ + ¼ = ?'),('Zwei Rechenschritte',['Selbst den Weg wählen · Beispielhilfe'],'½ + ¼ + ¼ = ?')]):
 y=236+i*188;s.rect(32,y,836,166,'white',14,C['blue'] if i==0 else C['line']);s.text(60,y+39,title,25,True);s.text(60,y+75,lines[0],18);s.text(60,y+124,ex,21,True,C['blue']);s.pill(684,y+17,'Ausgewählt' if i==0 else 'Ansehen',w=155)
s.rect(32,817,836,105,'#e8f0f7');s.lines(60,854,['Du kannst leichter weiterüben, ohne Punkte zu verlieren.','Hilfe und Zeitdruck werden getrennt eingestellt.'],18);save(s,'05-schwierigkeit-ipad.svg','Schwierigkeit wird an Beispielen verständlich','iPad','Anstelle von Level 3 stehen konkrete Zahlenräume, Schritte und Hilfen. Lernende können zurückwechseln; Geschwindigkeit ist eine eigene Option.')
#6 lobby board
s=S(1180,900);s.shell('Gemeinsam starten','Lehrkraftansicht · Klassenrunde vorbereiten')
s.rect(32,235,704,550);s.text(62,280,'Deine Klasse wartet',27,True);s.text(62,320,'Fast Quiz · Eigener Übungstest · 5 Minuten',19);s.rect(62,350,643,82,C['soft']);s.text(87,383,'Material geprüft',20,True,C['green']);s.text(87,412,'6 passende Aufgaben · Lösungen bleiben verborgen',17)
for i,(a,b) in enumerate([('Teilnahme','Mit Alias beitreten'),('Wettbewerb','Aus · gemeinsam üben'),('Darstellung','Board ohne Namen oder Rangliste')]):s.text(62,480+i*59,a,16,False,C['muted']);s.text(260,480+i*59,b,18,True)
s.button(62,690,220,'Runde starten');s.button(303,690,200,'Board öffnen',False)
s.rect(763,235,385,550,'#202b3c');s.text(793,280,'Für das Board',22,True,'white');s.rect(824,323,260,260,'white',12);# intentionally nonfunctional QR motif
for x,y in [(844,343),(1004,343),(844,503)]:s.rect(x,y,60,60,C['ink'],0);s.rect(x+10,y+10,40,40,'white',0);s.rect(x+20,y+20,20,20,C['ink'],0)
s.text(808,621,'QR-Platzhalter',21,True,'white');s.text(808,661,'Code: DEMO',24,True,'white');s.lines(793,708,['Kein echter Beitrittscode.','Keine Schülerdaten in der Planung.'],15,25,'white');save(s,'06-lobby-board-desktop.svg','Eine gemeinsame Runde mit sicherem Board','Desktop / Board','Die Lehrkraft prüft Material und Modus. Board und Beitritt zeigen nur die benötigten Angaben; der QR ist ausdrücklich ein nicht funktionaler Platzhalter.')
#7 student phone
s=S(470,1020);s.shell('Fast Quiz','5-Minuten-Runde · noch 4:32',True);s.rect(26,229,418,604);s.pill(48,250,'Gleiche Nenner',w=205);s.text(48,327,'Wie viel ist',22);s.text(48,394,'¼ + ¼ ?',46,True);s.text(48,438,'Wähle dein Ergebnis.',18,fill=C['muted'])
for x,y,t in [(48,470,'½'),(252,470,'¼'),(48,549,'¾'),(252,549,'1')]:s.rect(x,y,170,60,'white',9,C['line']);s.text(x+67,y+40,t,29,True)
s.button(48,659,374,'Antwort prüfen');s.button(48,724,374,'Einen Hinweis zeigen',False);s.text(32,879,'Hilfe: Denke an zwei gleich große Viertel.',17);s.text(32,922,'Pause oder Runde verlassen',16,True,C['blue']);save(s,'07-aufgabe-phone.svg','Die Aufgabe hat auf dem Handy Vorrang','Phone','Große Antwortflächen, getrenntes Prüfen und sichtbare Hilfe. Keine Rangliste oder hektische Animation neben der eigentlichen Lernaufgabe.')
#8 completion
s=S(900,1000);s.shell('Das hast du geübt','Dein Lernabschluss · ohne Schulnote')
s.rect(32,238,836,258);s.text(60,282,'Brüche addieren',28,True);s.text(60,335,'4 von 6 Aufgaben selbst gelöst',27,True,C['green']);s.lines(60,380,['Bei 2 Aufgaben hat dir ein Hinweis geholfen.','Als Nächstes lohnt sich: gleiche Nenner erkennen.'],19)
s.rect(32,522,836,245);s.text(60,566,'Dein nächster kleiner Schritt',24,True);s.text(60,614,'3 Aufgaben mit demselben Nenner, ohne Zeitdruck.',20);s.button(60,671,270,'Passend weiter üben');s.button(354,671,240,'Aufgaben ansehen',False)
s.lines(45,825,['Punkte zeigen deinen Spielverlauf. Sie werden nicht automatisch','zu einer Schulnote. Ob und was die Lehrkraft sehen darf,','muss vor der Runde verständlich sein.'],18,29);save(s,'08-abschluss-ipad.svg','Der Abschluss führt zurück ins Lernen','iPad','Ergebnis, genutzte Hilfe und konkreter nächster Übungsschritt stehen zusammen. Spielpunkte werden sprachlich und fachlich von Noten getrennt.')
#9 states
s=S(1180,900);s.shell('Material auswählen','Verständliche Zustände, die einen nächsten Schritt anbieten.')
for i,(title,lines,button,color) in enumerate([('Noch kein eigener Test',['Wähle ein Thema oder bereite mit Remy','einen eigenen Übungstest vor.'],'Thema wählen',C['blue']),('Nicht alles passt ins Spiel',['2 Aufgaben brauchen eine lange Antwort.','6 Aufgaben sind für Fast Quiz geeignet.'],'Passende Aufgaben nutzen',C['amber']),('Verbindung unterbrochen',['Deine letzte Eingabe bleibt hier erhalten.','Prüfe die Verbindung und versuche es erneut.'],'Erneut versuchen',C['purple'])]):
 x=32+i*379;s.rect(x,238,356,500);s.rect(x,238,356,8,color,4);s.text(x+24,300,title,22,True);s.lines(x+24,354,lines,16,29);s.button(x+24,447,308,button);s.text(x+24,554,'Alternativer Weg',16,True,C['muted']);s.text(x+24,589,'Zur Materialauswahl',18,True,C['blue']);s.lines(x+24,646,['Keine technischen Fehlercodes','und keine verlorenen Einstellungen.'],15,26)
s.text(32,805,'Fehlertexte erklären: Was ist passiert? Was bleibt erhalten? Was kann ich jetzt tun?',18);save(s,'09-material-zustaende-desktop.svg','Leere und fehlerhafte Zustände bleiben handlungsfähig','Desktop','Kein Zustand endet in einer Sackgasse. Ungeeignete Aufgaben werden erklärt, statt still verworfen; Rückweg und Wiederholen bleiben sichtbar.')
#10 knowledge test reuse
s=S(900,1040);s.shell('Dein Test wird zur Wissensreise','Eigene Inhalte · passende Stationen · transparente Anpassung')
s.rect(32,234,836,222);s.field(60,275,780,'Materialquelle','Mein Übungstest · 8 Aufgaben');s.text(60,385,'Auch ein mit Remy erzeugter eigener Test kann die Quelle sein.',18);s.text(60,420,'Vor dem Start Aufgaben und Anpassungen prüfen.',18,True,C['blue'])
s.rect(32,482,836,330);s.text(60,526,'Deine Route',25,True)
for i,(a,b) in enumerate([('Start','Vorwissen aktivieren'),('Station 1','Begriffe zuordnen'),('Station 2','Begründen und anwenden'),('Abschluss','Gezielt weiterüben')]):
 y=570+i*54;s.rect(60,y-21,24,24,C['green'] if i==0 else C['soft'],12);s.text(103,y,a,17,True);s.text(260,y,b,18)
s.rect(32,839,836,128,'#e8f0f7');s.text(60,877,'Feedback passt zum Lernformat',22,True);s.lines(60,913,['Keine manuelle Antwortbewertung.','Offene Reflexion bleibt unbewertet; Hilfe bleibt verfügbar.'],17,28);save(s,'10-wissensreise-ipad.svg','Eigene Tests erhalten eine nachvollziehbare Route','iPad','Wissensreise verwendet eigene Tests statt einer festen Themeninsel. Aufgabentypen und Feedback werden je Station geprüft. Es gibt keine manuelle Antwortbewertung; offene Reflexion bleibt unbewertet.')
# 11 German task
s=S(900,1000);s.shell('Fehlerjagd Deutsch','Wortarten · 5-Minuten-Runde · noch 4:32')
s.rect(32,236,836,487);s.pill(60,258,'Ein Lernschritt',w=170);s.text(60,334,'Welches Wort ist ein Verb?',28,True)
s.text(60,387,'Wähle ein Wort im Satz.',18,fill=C['muted'])
for x,w,t in [(60,100,'Die'),(174,150,'Klasse'),(338,160,'plant'),(512,110,'eine'),(636,180,'Reise.')]:
 s.rect(x,425,w,62,C['soft'],9,C['line']);s.text(x+16,466,t,25,True)
s.button(60,546,264,'Auswahl prüfen');s.button(345,546,270,'Einen Hinweis zeigen',False);s.text(60,660,'Hier beschreibt das Verb, was die Klasse tut.',20)
s.rect(32,753,836,157,'#e8f0f7');s.text(60,795,'Eine klare Aufgabe pro Schritt',22,True);s.lines(60,834,['Erst die Wortart erkennen, dann eine Begründung üben.','Rechtschreibung und Satzglieder sind eigene Lernziele.'],18,29);save(s,'11-deutsch-aufgabe-ipad.svg','Deutsch: eine Fähigkeit gezielt üben','iPad','Das Eingabeformat folgt dem Fach: Wörter markieren statt vier abstrakte Antwortkarten. Die Hilfe richtet den Blick auf die Handlung; Satzglieder und Rechtschreibung werden nicht gleichzeitig geprüft.')
# 12 Vocab task
s=S(470,1020);s.shell('Vocab Rush','Englisch · Erinnern mit Kontext',True);s.rect(26,234,418,597);s.pill(48,253,'Ohne Zeitdruck',w=180);s.text(48,331,'Wie heißt das auf Englisch?',23,True);s.text(48,390,'eine Reise',34,True);s.text(48,445,'We are planning a _____.',23);s.field(48,506,374,'Deine Antwort','Wort eingeben');s.button(48,631,374,'Antwort prüfen');s.button(48,696,374,'Einen Hinweis zeigen',False);s.text(48,790,'Lernrichtung: Deutsch → Englisch',16,True,C['blue']);s.lines(32,880,['Bedeutung zuerst. Schreibweise gezielt','nach Bedarf weiter üben.'],18,29);save(s,'12-vocab-aufgabe-phone.svg','Englisch: erinnern statt nur wiedererkennen','Phone','Freie Eingabe mit Kontext fordert aktiven Abruf. Sprachrichtung und orthografische Strenge werden vor dem Start getrennt erklärt; Audio wird hier nicht als vorhandene Fähigkeit behauptet.')
(P/'mockups/manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
# Convenient editable gallery; purpose is visual review, not a functioning app.
(P/'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><title>GradeCrew Spiele: Konzeptatlas</title><style>body{font-family:system-ui;background:#f6f7f9;color:#202b3c;margin:3rem auto;max-width:1200px}h1{font-size:3rem}figure{margin:4rem 0}img{max-width:100%;max-height:85vh;border:1px solid #dfe5ec}figcaption{max-width:70ch;line-height:1.6}</style><h1>Spiele einfacher beginnen</h1><p>Konzeptatlas · Vorschläge vom 15.10.2026 · keine Live-Oberflächen</p>'+''.join(f'<figure><h2>{i+1}. {m["title"]}</h2><img src="mockups/{m["file"]}" alt="{esc(m["title"])}"><figcaption>{m["device"]}. {m["explain"]}</figcaption></figure>' for i,m in enumerate(meta)))
print('Created',len(meta),'concept views')
