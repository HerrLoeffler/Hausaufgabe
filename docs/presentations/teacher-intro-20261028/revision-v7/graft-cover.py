from zipfile import ZipFile,ZIP_DEFLATED
from pathlib import Path,PurePosixPath
from lxml import etree
import posixpath,json,hashlib
base=Path(__file__).resolve().parent
source=Path('/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/outputs/gradecrew-kollegium-20261028/revision-v6/files/GradeCrew_Kollegium_20261028_v6_Tutorial.pptx')
R='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def relpart(part):
 p=PurePosixPath(part);return str(p.parent/'_rels'/(p.name+'.rels'))
def target(part,t):return posixpath.normpath(posixpath.join(posixpath.dirname(part),t)).lstrip('/')
with ZipFile(source)as z:src={n:z.read(n)for n in z.namelist()}
with ZipFile(base/'artifact-candidate.pptx')as z:dst={n:z.read(n)for n in z.namelist()}
closure=set()
def visit(part):
 if part in closure:return
 closure.add(part)
 rp=relpart(part)
 if rp in src:
  closure.add(rp)
  for rel in etree.fromstring(src[rp]):
   if rel.get('TargetMode')!='External':visit(target(part,rel.get('Target')))
for number in [1,2,11,12]:visit(f'ppt/slides/slide{number}.xml')
# Protect new media if an export reused an original media filename for other content.
for n in list(closure):
 if n.startswith('ppt/media/')and n in dst and dst[n]!=src[n]:
  renamed='ppt/media/v4-export-'+PurePosixPath(n).name;dst[renamed]=dst[n]
  for rp in list(dst):
   if not rp.endswith('.rels')or rp in closure:continue
   owner=str(PurePosixPath(rp).parent.parent/PurePosixPath(rp).name[:-5]);r=etree.fromstring(dst[rp]);changed=False
   for rel in r:
    if rel.get('TargetMode')!='External'and target(owner,rel.get('Target'))==n:
     rel.set('Target',posixpath.relpath(renamed,posixpath.dirname(owner)));changed=True
   if changed:dst[rp]=etree.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
for n in closure:dst[n]=src[n]
# Merge content-type declarations for every preserved dependency.
ct=etree.fromstring(dst['[Content_Types].xml']);srcct=etree.fromstring(src['[Content_Types].xml']);keys={(e.tag,e.get('PartName')or e.get('Extension'))for e in ct}
for e in srcct:
 if e.tag.endswith('Override')and e.get('PartName','').lstrip('/')not in closure:continue
 key=(e.tag,e.get('PartName')or e.get('Extension'))
 if key not in keys:ct.append(e);keys.add(key)
dst['[Content_Types].xml']=etree.tostring(ct,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(base/'candidate-cover-preserved.pptx','w',ZIP_DEFLATED)as z:
 for n,b in dst.items():z.writestr(n,b)
report={'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'byteIdenticalParts':sorted(closure),'count':len(closure),'coverXmlPreserved':all(dst[n]==src[n]for n in closure)}
(base/'cover-preservation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
