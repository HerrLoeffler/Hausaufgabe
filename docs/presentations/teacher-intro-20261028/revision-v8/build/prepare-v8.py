from pathlib import Path
from PIL import Image
import shutil,json
r=Path('outputs/gradecrew-kollegium-20261028');b=r/'revision-v8';e=r/'plan-20261028/evidence'
crops={'remy-angaben':('remy-current-headerfree.png',(20,129,425,495)),'remy-optionen':('remy-current-headerfree.png',(435,129,1180,572)),'emmi-gesamt':('emmi-current-headerfree.png',(20,145,1180,435)),'emmi-aufgabe':('emmi-current-headerfree.png',(750,505,1180,575)),'aufgabe-pruefen':('emmi-current-headerfree.png',(320,500,1200,737)),'feedback':('remy-current-headerfree.png',(5,675,130,730))}
for name,(file,box)in crops.items():Image.open(e/file).crop(box).save(b/'assets'/(name+'.png'))
for f in ['native-appear-timing.xml','native-fade-timing.xml','native-zoom-timing.xml','add-timing.py']:shutil.copy2(r/'revision-v7/build'/f,b/'build'/f)
s=(r/'revision-v7/build/graft-cover.py').read_text().replace('revision-v6/files/GradeCrew_Kollegium_20261028_v6_Tutorial.pptx','revision-v7/files/GradeCrew_Kollegium_20261028_v7_Tutorial.pptx').replace("for number in [1,2,11,12]:visit(f'ppt/slides/slide{number}.xml')","visit('ppt/slides/slide1.xml')")
(b/'build/graft-cover.py').write_text(s)
node=Path('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')
if not(b/'build/node_modules').exists():(b/'build/node_modules').symlink_to(node)
