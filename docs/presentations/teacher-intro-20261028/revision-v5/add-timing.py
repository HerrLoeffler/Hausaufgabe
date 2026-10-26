from zipfile import ZipFile,ZIP_DEFLATED
from pathlib import Path
from lxml import etree
from copy import deepcopy
import sys,json,re
b=Path(__file__).resolve().parent
P='http://schemas.openxmlformats.org/presentationml/2006/main';ns={'p':P}
def load(kind):return etree.fromstring((b/f'native-{kind}-timing.xml').read_bytes())
templates={kind:load(kind)for kind in ['appear','fade','zoom']}
def effect(kind,spid,exit=False):
 t=templates[kind];node=deepcopy(t.xpath('.//p:cTn[@nodeType="clickEffect"]/..',namespaces=ns)[0]);ct=node[0]
 if exit:
  ct.set('presetClass','exit');ct.set('presetID','1')
  for v in node.xpath('.//p:strVal[@val="visible"]',namespaces=ns):v.set('val','hidden')
 for x in node.xpath('.//p:spTgt',namespaces=ns):x.set('spid',str(spid))
 return node

def apply(r):
 current=None
 for el in r.find('p:cSld/p:spTree',ns):
  cn=el.find('.//p:cNvPr',ns)
  if cn is None:continue
  m=re.match(r'(phase\d+)-',cn.get('name',''))
  if m:current=m[1]
  elif el.tag=='{'+P+'}pic' and current:
   off=el.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}off')
   suffix='zoom' if off is not None and int(off.get('x'))>3000000 else 'context'
   cn.set('name',current+'-'+suffix)
 names={e.get('name'):e.get('id')for e in r.xpath('.//p:cNvPr',namespaces=ns)}
 phases={}
 for name,spid in names.items():
  m=re.match(r'phase(\d+)-',name or '')
  if m:phases.setdefault(int(m[1]),[]).append((name,spid))
 if not phases:return None
 timing=deepcopy(templates['appear']);main=timing.xpath('.//p:cTn[@nodeType="mainSeq"]/p:childTnLst',namespaces=ns)[0];prototype=deepcopy(main[0]);main.clear();timing.remove(timing.find('p:bldLst',ns));prev=[]
 for k,items in sorted(phases.items()):
  phase=deepcopy(prototype);effects=phase.xpath('./p:cTn/p:childTnLst/p:par/p:cTn/p:childTnLst',namespaces=ns)[0];effects.clear()
  for name,spid in prev:effects.append(effect('appear',spid,True))
  for j,(name,spid)in enumerate(items):
   kind='zoom'if name.endswith('-zoom')else'appear'
   n=effect(kind,spid);n[0].set('nodeType','clickEffect'if j==0 else'withEffect');effects.append(n)
  main.append(phase);prev=items
 # IDs are global within each slide's timing tree.
 for i,ct in enumerate(timing.xpath('.//p:cTn',namespaces=ns),1):ct.set('id',str(i))
 old=r.find('p:timing',ns)
 if old is not None:r.remove(old)
 ext=r.find('p:extLst',ns)
 if ext is not None:r.insert(list(r).index(ext),timing)
 else:r.append(timing)
 return {'phases':len(phases),'targets':sum(map(len,phases.values())),'shapeIds':{str(k):[sid for _,sid in v]for k,v in phases.items()}}
input=Path(sys.argv[1])if len(sys.argv)>1 else b/'pilot-candidate.pptx';output=Path(sys.argv[2])if len(sys.argv)>2 else b/'pilot-animated.pptx'
with ZipFile(input)as z:data={n:z.read(n)for n in z.namelist()}
report={}
for name in data:
 if re.fullmatch(r'ppt/slides/slide\d+\.xml',name):
  root=etree.fromstring(data[name]);rec=apply(root)
  if rec:report[name]=rec;data[name]=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(output,'w',ZIP_DEFLATED)as z:
 for n,v in data.items():z.writestr(n,v)
(b/'timing-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
