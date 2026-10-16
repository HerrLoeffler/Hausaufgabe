from PIL import Image,ImageDraw
from pathlib import Path
P=Path(__file__).parent;files=sorted(Path('/private/tmp/gc-level-class-correction-review').glob('page-*.jpg'))
for part in range(0,len(files),16):
 canvas=Image.new('RGB',(1600,2200),'#dfe5ec');d=ImageDraw.Draw(canvas)
 for j,f in enumerate(files[part:part+16]):
  im=Image.open(f);im.thumbnail((375,515));x=(j%4)*400+(400-im.width)//2;y=(j//4)*550+26;canvas.paste(im,(x,y));d.text((j%4*400+12,j//4*550+8),f.stem,fill='black')
 canvas.save(P/'preview'/f'correction-contact-{part//16+1}.jpg')
print(len(files),'pages rendered')
