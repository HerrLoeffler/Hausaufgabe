from pathlib import Path
from PIL import Image
import json,hashlib
b=Path(__file__).resolve().parent.parent
config=json.loads((b/'build/tutorial-config.json').read_text());out=b/'safe/crops';out.mkdir(exist_ok=True);rows=[]
for c in config:
 for i,p in enumerate(c['phases'],1):
  source=b/'safe'/(p['file']+'.png');im=Image.open(source);x,y,w,h=p['crop']
  assert x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,(source,p['crop'],im.size)
  f=out/f"slide-{c['number']}-step-{i}.png";im.crop((x,y,x+w,y+h)).save(f)
  rows.append({'slide':c['number'],'step':i,'source':source.name,'physicalCrop':p['crop'],'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(b/'build/focus-crops.json').write_text(json.dumps(rows,indent=2));print('Crops',len(rows))
