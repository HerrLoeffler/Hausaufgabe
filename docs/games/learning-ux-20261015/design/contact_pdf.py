from PIL import Image,ImageDraw
from pathlib import Path
import sys
files=sorted(Path('/private/tmp/gc-planbook-review').glob('page-*.jpg'))
for part in range(0,len(files),20):
 canvas=Image.new('RGB',(1500,1800),'#dfe5ec');d=ImageDraw.Draw(canvas)
 for j,f in enumerate(files[part:part+20]):
  im=Image.open(f);im.thumbnail((280,405));x=(j%5)*300+(300-im.width)//2;y=(j//5)*450+26;canvas.paste(im,(x,y));d.text((j%5*300+12,j//5*450+8),f.stem,fill='black')
 canvas.save(Path(__file__).parent/'preview'/f'book-contact-{part//20+1}.jpg')
print(len(files),'pages rendered')
