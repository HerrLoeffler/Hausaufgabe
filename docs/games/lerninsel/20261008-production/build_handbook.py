from pathlib import Path
from xml.sax.saxutils import escape
import json,re,math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parent
fonts=Path('/Users/Shared/Epic Games/UE_5.8/Engine/Content/Slate/Fonts')
pdfmetrics.registerFont(TTFont('Island',str(fonts/'Roboto-Regular.ttf')))
pdfmetrics.registerFont(TTFont('IslandBold',str(fonts/'Roboto-Bold.ttf')))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Prose',fontName='Island',fontSize=10.5,leading=15,spaceAfter=8,textColor=HexColor('#263f35')))
styles.add(ParagraphStyle(name='Head',fontName='IslandBold',fontSize=19,leading=25,spaceBefore=14,spaceAfter=11,textColor=HexColor('#7d442d')))
styles.add(ParagraphStyle(name='Sub',fontName='IslandBold',fontSize=13,leading=18,spaceBefore=9,spaceAfter=7,textColor=HexColor('#385c48')))
tmp=root/'tmp';tmp.mkdir(exist_ok=True)
W,H=A4
story=[Paragraph('Lerninsel · Bau- und Spielhandbuch',styles['Head']),Paragraph('Ego-Prototyp für Klasse5–6 mit Zusatzaufgaben. Vier Hauptmechaniken, ein lebensnaher Mess-Eimer, umfangreiche Form- und Zustandsstudien.',styles['Prose']),Paragraph('08.10.2026 · GC-GAMES-ESCAPE-VISUAL-01 · DraftPR175 · branch_only',styles['Prose']),Paragraph('Dieses Buch verbindet den vorhandenen ausführlichen Entwurf mit den neuen Produktionsentscheidungen. Der Atlas enthält240 zusätzliche Motive auf12Tafeln. Einzelstudien sind Bildfelder, keine fertigen Engine-Assets. Reale Spielaufnahmen und Testergebnisse sind getrennte Nachweise.',styles['Prose']),Paragraph('Lesereihenfolge: Bauvertrag → Bildprüfung → ursprüngliches Spielbuch → Tafeln → einzelne Objekt- und Zustandsstudien. Der aktuelle Bauvertrag ersetzt die alten Achtelwerte im ersten Wasser-/Küstenprototyp durch ausdrücklich erklärte Zehntel.',styles['Prose']),PageBreak()]
for name,path in [('Verbindlicher Bauvertrag',root/'bauvertrag.md'),('Bildprüfung und Grenzen',root/'pruefung.md'),('Ausführliches ursprüngliches Spielbuch',root.parent/'20261007/spielbuch.md')]:
 story.append(Paragraph(name,styles['Head']))
 for line in path.read_text().splitlines():
  if not line.strip():continue
  if line.startswith('# '):continue
  text=escape(re.sub(r'[*`]', '',line.strip()))
  if line.startswith('## '):story.append(Paragraph(text[3:],styles['Head']))
  elif line.startswith('### '):story.append(Paragraph(text[4:],styles['Sub']))
  else:story.append(Paragraph(text,styles['Prose']))
 story.append(PageBreak())
SimpleDocTemplate(str(tmp/'text.pdf'),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=50,bottomMargin=48).build(story)
boards=json.loads((root/'katalog.json').read_text())
c=canvas.Canvas(str(tmp/'atlas.pdf'),pagesize=A4,pageCompression=1)
def footer(label):
 c.setFillColor(HexColor('#5f7165'));c.setFont('Island',9);c.drawString(42,27,label);c.drawRightString(W-42,27,'Vorlage · keine Runtime-Abnahme')
def para(text,x,y,width,font='Prose'):
 p=Paragraph(escape(text),styles[font]);_,h=p.wrap(width,H);p.drawOn(c,x,y-h);return y-h-9
families={
 '01':('Baumfamilien','Gestaffelte Kronen, sichtbare Verzweigung und klare Familien. Orange im Garten, lime am Übergang, rosa sparsam am Satzplatz. Eine Nahansicht verändert nicht automatisch den Grundmodelltyp.','Kronen dürfen Wörter, Tore und die Hauptlandmarke nicht verdecken. Blattmassen statt gleichförmiger Kugeln; Wurzeln außerhalb der notwendigen Gehfläche.'),
 '02':('Landschaft','Ruhige Stein-/Sand-/Grasflächen und klare Randgruppen. Absätze und Fugen werden geometrisch aufgebaut, nicht als Antwortzeichen benutzt.','Die Hauptwege sind sicher begehbar. Kein Sprung über eine notwendige Wurzel, keine dekorative Schrift auf einer Lernplatte.'),
 '03':('Architektur','Sockel, Kanten, Rahmen und Rost-/Kupferteile gehören zur selben Maßstabsfamilie. Tore zeigen geschlossen, animierend und dauerhaft offen getrennt.','Ein festes Kollisionsvolumen sperrt bis Ende der Öffnung. Der Turm besitzt acht Fenster, im Prototyp vier Hauptsignale.'),
 '04':('Verbpfad','Wortkontext und Auswahl sind getrennt. Probe0/2, Hauptweg0/4/8. Jeder aktive Schritt braucht mittigen Kontakt und0,30s Mindestdauer.','Maximal zwei Probeauswahlen; im Hauptfeld genau ein Schritt pro Reihe. Fehler dauerhaft durch Form/Text anzeigen, Rücknahme bleibt erreichbar.'),
 '05':('Satzweg','Vier Satzglied-IDs werden genau einmal gesetzt. Alle sechs Aussagesatzvarianten mit öffnet an Position2 sind erlaubt. Die Wortbank bleibt vollständig.','Unvollständige und doppelte Folgen öffnen nichts. V1 ist eine Frage, V3/V4 verletzen den Auftrag. Nach Erfolg bleibt das Gate dauerhaft offen.'),
 '06':('Bruchleitung','Ein Ganzes ist1L. Exakte Zehntelsummen: RouteA10, RouteB8, RouteC7. Anfang0 und Ende10, drei Knoten desselben Astes.','Gezeichnete Werte und Teilstriche sind keine Daten. Quersprünge zählen nicht, Rücknahme entfernt nur die letzte Kante, falsche Mengen öffnen nichts.'),
 '07':('Mess-Eimer','Kapazität1L, Ziel3/10=300ml. Ein Hub100ml in0,6s. Zylindrischer Messraum mit zehn gleichen Volumenabschnitten und elf Teilstrichen.','2/10 und4/10 müssen normal wiederaufnehmbar und korrigierbar sein. Pause verwirft eine unbestätigte Portion. Der Tragegriff bleibt im sichtbaren Maßstab.'),
 '08':('Felsfenster','Vier bekannte Werte1/10,1/5,2/5,1/2; genau drei auswählen. Nur0/2/3 ergeben ein Ganzes. Entdeckungen und Lösung bleiben getrennt.','Menge alleine bestätigt nichts. Sichere Position und tatsächliche Blickprojektion sind zusätzliche Bedingungen. Formstücke sitzen auf echten Trägern.'),
 '09':('Raumzusammenhang','Vier Hauptaufgaben bilden den Prototyp; acht Gebiete sind das spätere Inselziel. Haupt- und Nebenwege sowie Turmbeziehungen bleiben klar.','Eine Konzeptlegende mit gebaut beweist keinen implementierten Raum. Rückkehr darf nicht durch eine verlorene Pflichtvoraussetzung versperrt werden.'),
 '10':('Eingabe','Native Widgets besitzen Pflichtantworten und Pointerlebenszyklus. Weltbewegung stoppt beim Fokus; E und Escape haben eindeutige Rollen.','Klick, Drag und Kamerablick dürfen sich nicht gegenseitig auslösen. Native Eventroute zusätzlich zu Regellogik testen; iPad braucht echte Geräteprüfung.'),
 '11':('Fehlerzustand','Vorwahl, falsch, unvollständig, bestätigt und wiederhergestellt sind unterschiedliche Zustände. Bestätigte Weltfolgen sind unveränderlich.','Kein allgemeines grünes Symbol für einen falschen Schritt. Keine automatische Lösung nach Fehlversuchen. Ungültiger Transform verliert nicht den gültigen Fortschritt.'),
 '12':('Licht und Material','Warmer heller Stein, orange/lime/rosa Vegetation, blaues Meer und zurückhaltendes mint Signal. Matte Messflächen und klare Schatten.','Lesbarkeit aus echter Ego-Perspektive prüfen. Bildwerte fürFOV oder Teilungen nicht übernehmen; native FOV75/85 und Datengeometrie bleiben maßgeblich.')}
for b in boards:
 image=root/b['path'];reader=ImageReader(str(image));iw,ih=reader.getSize()
 c.setFillColor(HexColor('#f7f2e7'));c.rect(0,0,W,H,fill=1,stroke=0)
 y=para(f'Tafel {b["id"]} · {b["title"]}',42,H-42,W-84,'Head');y=para(b['purpose'],42,y,W-84)
 targetW=W-68;targetH=targetW*ih/iw;c.drawImage(reader,34,y-targetH-8,width=targetW,height=targetH)
 y=para('Zwanzig nummerierte Studien. Der folgende Atlas ordnet jede einer Funktion, einem Datenvertrag und einer Abnahme zu. Varianten wählen, nicht blind zwanzig Modelle bauen.',42,y-targetH-30,W-84)
 footer(f'Übersicht {b["id"]}');c.showPage()
 for index,m in enumerate(b['motifs']):
  c.setFillColor(HexColor('#f7f2e7'));c.rect(0,0,W,H,fill=1,stroke=0)
  y=para(f'{m["id"]} · {m["description"]}',42,H-42,W-84,'Head')
  c.setFont('Island',10);c.setFillColor(HexColor('#52735d'));c.drawString(42,y-8,f'Bildfamilie: {families[b["id"]][0]} · Studie {index+1} von20')
  # Embed and clip the original board in the PDF. No raster image is edited or exported.
  col=index%5;row=index//5;cellW=iw/5;cellH=ih/4;cropW=cellW-10;cropH=cellH-35
  boxW=300;boxH=boxW*cropH/cropW;bx=(W-boxW)/2;by=y-35-boxH;factor=boxW/cropW
  cropLeft=col*cellW+5;cropTop=row*cellH+5;cropBottom=ih-(cropTop+cropH)
  c.saveState();clip=c.beginPath();clip.rect(bx,by,boxW,boxH);c.clipPath(clip,stroke=0);c.drawImage(reader,bx-cropLeft*factor,by-cropBottom*factor,width=iw*factor,height=ih*factor);c.restoreState()
  y=by-18
  y=para('Bauzweck',42,y,W-84,'Sub');y=para(m['description']+'. Diese Ansicht legt die Form oder einen konkreten Handlungsmoment fest. Sie ist keine neue Pflichtaufgabe und kein fertiger Meshnachweis.',42,y,W-84)
  y=para('Verbindlicher Daten- und Zustandsvertrag',42,y,W-84,'Sub');y=para(families[b['id']][1],42,y,W-84)
  y=para('Fehlergrenze und Abnahme',42,y,W-84,'Sub');y=para(families[b['id']][2]+' Schrift, Mengen, Objekt-IDs und Weltfolgen werden aus authored Daten gebaut. Die zugehörige Bildprüfung benennt sichtbare Abweichungen.',42,y,W-84)
  y=para('Übertragung in den Prototyp',42,y,W-84,'Sub');y=para('Erst gleiche Familie und Maßstab wählen, dann Anfangs-/Versuchs-/Fehler-/Erfolgszustand bauen. Im echten Spielviewport Sicht und Bedienung prüfen. Konzeptstudien ersetzen weder Kollision, Pointereingabe, Speichern noch eine Abnahme mit Kindern.',42,y,W-84)
  if y<45: raise RuntimeError('Page overflow '+m['id'])
  footer(m['id']+' · '+b['title']);c.showPage()
c.save()
writer=PdfWriter()
for name in ['text.pdf','atlas.pdf']:
 reader=PdfReader(tmp/name)
 for page in reader.pages:writer.add_page(page)
writer.add_metadata({'/Title':'Lerninsel Bau- und Spielhandbuch','/Author':'GradeCrew','/Subject':'Vier-Rätsel-Prototyp und240 zusätzliche Produktionsmotive'})
with open(root/'lerninsel-bauhandbuch.pdf','wb') as out:writer.write(out)
reader=PdfReader(root/'lerninsel-bauhandbuch.pdf');assert len(reader.pages)>=260
(root/'handbuch-verifikation.json').write_text(json.dumps({'pages':len(reader.pages),'motif_pages':240,'overview_pages':12,'concept_motifs_total':261,'source':'originalSpielbuch + newBauvertrag + Bildprüfung + authoredMotifAtlas','raster_images_edited':False,'final_art_acceptance':False},indent=2)+'\n')
print('PDF pages',len(reader.pages))
