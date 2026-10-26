from pathlib import Path
from PIL import Image
import json,hashlib
b=Path(__file__).resolve().parent.parent;c=b/'captures';s=b/'safe';s.mkdir(exist_ok=True)
rows=[]
for p in sorted(c.glob('*.jpg')):
 if p.name.startswith('.') or (2<int(p.name[:2])<8):continue
 im=Image.open(p).convert('RGB');top=78 if p.name.startswith(('08-','10-','13-','14-','15-')) else 0
 # Dialog screenshot is cropped to exclude every blurred global-account header.
 if p.name.startswith('11-'):box=(225,155,878,797)
 else:box=(0,top,im.width,im.height)
 out=s/(p.stem+'.png');im.crop(box).save(out)
 rows.append({'source':str(p),'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'physicalCrop':box,'safeFile':str(out),'size':Image.open(out).size,'safeSha256':hashlib.sha256(out.read_bytes()).hexdigest()})
(b/'build/safe-captures.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows,indent=2))
