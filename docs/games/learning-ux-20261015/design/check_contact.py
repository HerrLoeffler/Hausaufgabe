from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
p=Path(__file__).parent
files=sorted((p/'preview').glob('[0-9]*.png'))
canvas=Image.new('RGB',(1800,2100),'#dfe5ec');d=ImageDraw.Draw(canvas)
for i,f in enumerate(files):
 im=Image.open(f).convert('RGB');im.thumbnail((348,636));x=(i%5)*360+(360-im.width)//2;y=(i//5)*700+30;canvas.paste(im,(x,y));d.text((i%5*360+8,(i//5)*700+8),f.stem,fill='black')
canvas.save(p/'preview/mockup-contact-sheet.jpg')
