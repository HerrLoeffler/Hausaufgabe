from pathlib import Path
import shutil,json
from PIL import Image
r=Path('outputs/gradecrew-kollegium-20261028');a=r/'revision-v5';b=r/'revision-v6'
shutil.copytree(a/'safe',b/'safe',dirs_exist_ok=True)
shutil.copytree(a/'assets',b/'assets',dirs_exist_ok=True)
for f in ['prepare-focus-crops.py','add-timing.py','native-appear-timing.xml','native-fade-timing.xml','native-zoom-timing.xml']:shutil.copy2(a/'build'/f,b/'build'/f)
meta=json.loads((a/'build/safe-captures.json').read_text())
for row in meta:row['safeFile']=row['safeFile'].replace('revision-v5','revision-v6')
for name in ['21-live-remy-grundangaben-mikro','22-live-wuensche-mikro']:
 im=Image.open(b/'captures'/(name+'.jpg'));f=b/'safe'/(name+'.png');im.save(f);meta.append({'safeFile':str(f.resolve()),'size':list(im.size),'source':str((b/'captures'/(name+'.jpg')).resolve()),'sourceOrigin':'https://hausaufgabe-staging.web.app/','physicalHeaderRemoval':True})
(b/'build/safe-captures.json').write_text(json.dumps(meta,indent=2))
c=json.loads((a/'build/tutorial-config.json').read_text())
c[0]['phases'].insert(1,{'label':'Klasse und Thema einsprechen','file':'21-live-remy-grundangaben-mikro','focus':[112,272,955,68],'crop':[108,245,960,99],'extra':'Mikrofon öffnen, Angaben sprechen, mit Pfeil übernehmen'})
c[0]['note']+=' Oben das Mikrofon für Grundangaben nutzen. Sprechbeispiel: Mathematik, Klasse 7, Prozentrechnung, zehn Aufgaben, mittlere Schwierigkeit. Danach mit dem Pfeil übernehmen und die eingetragenen Felder prüfen. Die aktuelle Aufnahme zeigt den echten sichtbaren Mikrofonzugang, keine laufende Aufnahme.'
c[2]['phases'][2]={'label':'Testinhalte genauer diktieren','file':'22-live-wuensche-mikro','focus':[55,285,500,185],'crop':[52,280,510,198],'extra':'Unter „Eigene Wünsche“: Mikrofon öffnen und präzisieren'}
c[2]['note']+=' Unter Eigene Wünsche nochmals präzise Inhalte diktieren. Sprechbeispiel: Zwei Aufgaben zum Grundwert, drei zum Prozentwert, eine Sachaufgabe zum Rabatt. Keine Zinsrechnung. Das ist ein gesprochener Inhaltswunsch, keine Audioaufgabe für Lernende. Mikrofone wurden bei der Aufnahme nicht aktiviert.'
(b/'build/tutorial-config.json').write_text(json.dumps(c,indent=2,ensure_ascii=False))
s=(a/'build/build-v5.mjs').read_text().replace("'revision-v5'","'revision-v6'").replace("revision-v4/files/GradeCrew_Kollegium_20261028_v4_final.pptx","revision-v5/files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx").replace("'  /  10'","'  /  12'")
s=s.replace("rect(s,pre+'zoom-border',z.x,z.y,z.w,z.h);",'')
s=s.replace("const p=await PresentationFile.importPptx", "const p=await PresentationFile.importPptx")
s=s.replace("await(await PresentationFile.exportPptx(p)).save", "await appendEnd(p);\nawait(await PresentationFile.exportPptx(p)).save")
s += '\nfor(const n of [11,12]){const blob=await p.export({slide:p.slides.items[n-1],format:\'png\',scale:1});await fs.writeFile(path.join(b,\'preview\',`slide-${n}.png`),new Uint8Array(await blob.arrayBuffer()));}\n'
(b/'build/build-v6.mjs').write_text(s)
s=(a/'build/graft-cover.py').read_text().replace('revision-v4/files/GradeCrew_Kollegium_20261028_v4_final.pptx','revision-v5/files/GradeCrew_Kollegium_20261028_v5_Tutorial.pptx');(b/'build/graft-cover.py').write_text(s)
node=Path('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')
if not(b/'build/node_modules').exists():(b/'build/node_modules').symlink_to(node)
