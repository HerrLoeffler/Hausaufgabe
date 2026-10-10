"""Assemble QA contact sheets from actual Blender renders (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image, ImageDraw
OUT=Path(__file__).resolve().parents[1]/'Content/Art/LocalAssetsV2'
rows=json.loads((OUT/'asset_manifest.json').read_text())
for page in range((len(rows)+11)//12):
    group=rows[page*12:(page+1)*12]
    canvas=Image.new('RGB',(1200,((len(group)+3)//4)*325),(32,37,39));draw=ImageDraw.Draw(canvas)
    for i,r in enumerate(group):
        im=Image.open(OUT/'Previews'/(r['asset']+'_ThreeQuarter.png')).convert('RGB').resize((292,292))
        x=(i%4)*300;y=(i//4)*325;canvas.paste(im,(x,y))
        draw.text((x+7,y+294),r['asset'].replace('SM_',''),fill='white')
        draw.text((x+7,y+310),str(r['triangles'])+' triangles',fill=(160,175,180))
    canvas.save(OUT/('Catalogue_%02d.png'%(page+1)))
canvas=Image.new('RGB',(1600,830),(32,37,39));draw=ImageDraw.Draw(canvas)
for i,label in enumerate(['SM_Fox_Local_Master','SM_Fox_LOD0','SM_Fox_LOD1','SM_Fox_Stone']):
    for view,y in [('ThreeQuarter',0),('Side',425)]:
        im=Image.open(OUT/'Previews'/(label+'_'+view+'.png')).convert('RGB').resize((400,400))
        canvas.paste(im,(i*400,y))
    draw.text((i*400+8,402),label,fill='white')
canvas.save(OUT/'Fox_Comparison.png')
print('Updated contact sheets from',len(rows),'kit assets and four fox outputs.')
