"""Local Blender MCP production study. No network, generators or purchased assets.

Run in the live Blender context; preserves all existing objects and writes a
versioned copy. The seated fox is a sculpt source, NOT an animation-ready rig.
"""
import bpy, math, random, json, os
from mathutils import Vector
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'Content/Art/LocalAssetsV2'
OUT.mkdir(parents=True, exist_ok=True)
SCENE = bpy.context.scene
random.seed(107)
if bpy.data.collections.get('LI_Local_Fox_v2'):
    raise RuntimeError('LI_Local_Fox_v2 already exists. Inspect before rebuilding.')
C = bpy.data.collections.new('LI_Local_Fox_v2')
SCENE.collection.children.link(C)

def put(o):
    for c in list(o.users_collection): c.objects.unlink(o)
    C.objects.link(o)
    return o

def mat(name, rgb, rough=.72, metallic=0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color=(*rgb,1); m.use_nodes=True
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metallic
    return m

ORANGE=mat('LI_Fox_Russet',(0.36,.075,.009))
GOLD=mat('LI_Fox_GuardHair',(.53,.14,.020))
CREAM=mat('LI_Fox_Ivory',(.86,.78,.61))
PALE=mat('LI_Fox_IvoryHighlight',(.98,.90,.74))
DARK=mat('LI_Fox_Charcoal',(.037,.026,.020))
EAR=mat('LI_Fox_InnerEar',(.13,.065,.042))
NOSE=mat('LI_Fox_Nose',(.014,.013,.012),.34)
AMBER=mat('LI_Fox_Iris',(.35,.145,.027),.27)
GLINT=mat('LI_Fox_EyeGlint',(.95,.93,.85),.12)
STONE=mat('LI_Fox_Stone',(.40,.36,.28),.93)
ROOT=bpy.data.objects.new('SM_Fox_Local_Master',None); C.objects.link(ROOT)
FOX=[]

def mesh(name,verts,faces,materials,smooth=True):
    d=bpy.data.meshes.new(name); d.from_pydata(verts,[],faces); d.update()
    o=bpy.data.objects.new(name,d); C.objects.link(o)
    for m in materials: d.materials.append(m)
    for p in d.polygons: p.use_smooth=smooth
    return o

def ell(name,loc,scale,material=ORANGE,seg=32,rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,radius=1,location=loc)
    o=put(bpy.context.object); o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    return o

def active(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.context.view_layer.objects.active=o

def foxpart(o):
    o.parent=ROOT; FOX.append(o); return o

def tube(name,points,radii,material,sides=12):
    pts=[Vector(p) for p in points]; vs=[]; fs=[]; previous=None
    for j,p in enumerate(pts):
        t=(pts[min(j+1,len(pts)-1)]-pts[max(0,j-1)]).normalized()
        ref=previous if previous is not None else (Vector((1,0,0)) if abs(t.x)<.9 else Vector((0,1,0)))
        u=(ref-t*ref.dot(t)).normalized(); v=t.cross(u).normalized();previous=u
        rx,ry=radii[j] if isinstance(radii[j],tuple) else (radii[j],radii[j])
        for k in range(sides):
            a=2*math.pi*k/sides; vs.append(p+u*rx*math.cos(a)+v*ry*math.sin(a))
    for j in range(len(pts)-1):
        for k in range(sides):
            a=j*sides+k;b=j*sides+(k+1)%sides;fs.append((a,b,b+sides,a+sides))
    vs.extend([pts[0],pts[-1]]); a=len(vs)-2;b=a+1
    for k in range(sides):
        fs.append((a,(k+1)%sides,k))
        fs.append((b,(len(pts)-1)*sides+k,(len(pts)-1)*sides+(k+1)%sides))
    return mesh(name,vs,fs,[material])

# A connected sculpt base. Union removes the seams between construction volumes.
parts=[]
parts.append(ell('construct_torso',(0,.09,.57),(.195,.215,.35)))
parts.append(ell('construct_hips',(0,.19,.28),(.235,.245,.245)))
parts.append(ell('construct_shoulders',(0,-.022,.79),(.155,.162,.225)))
parts.append(ell('construct_neck',(0,-.055,.93),(.128,.140,.205)))
parts.append(tube('construct_skull',[(0,.005,1.07),(0,-.075,1.11),(0,-.155,1.102),(0,-.235,1.064)],[(.102,.10),(.135,.119),(.111,.098),(.063,.055)],ORANGE,32))
for s in [-1,1]:
    parts.append(ell('construct_haunch',(s*.181,.19,.227),(.126,.193,.191)))
    parts.append(ell('construct_hind_paw',(s*.20,.036,.055),(.079,.13,.048)))
    parts.append(tube('construct_foreleg',[(s*.10,-.025,.79),(s*.112,-.10,.60),(s*.105,-.145,.44),(s*.106,-.18,.17),(s*.11,-.23,.061)], [.061,.055,.040,.031,.045],ORANGE,16))
    parts.append(ell('construct_front_paw',(s*.11,-.255,.05),(.054,.098,.043)))
    parts.append(tube('construct_cheek',[(s*.09,-.16,1.045),(s*.148,-.13,1.027),(s*.18,-.055,.986)],[.043,.039,.002],CREAM,16))
parts.append(tube('construct_muzzle',[(0,-.192,1.066),(0,-.267,1.047),(0,-.356,1.02),(0,-.432,1.018)],[(.100,.073),(.081,.063),(.051,.040),(.026,.027)],ORANGE,24))
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0]
bpy.ops.object.join(); body=bpy.context.object; body.name='SM_Fox_ContinuousSculpt'
rem=body.modifiers.new('Union_anatomy','REMESH');rem.mode='VOXEL';rem.voxel_size=.006
bpy.ops.object.modifier_apply(modifier=rem.name)
sm=body.modifiers.new('Relax_sculpt','SMOOTH');sm.factor=.72;sm.iterations=5
bpy.ops.object.modifier_apply(modifier=sm.name)
body.data.materials.clear()
for m in [ORANGE,CREAM,DARK,GOLD]:body.data.materials.append(m)
for f in body.data.polygons:
    p=body.matrix_world@f.center; x,y,z=p
    white=(y<0 and .958<z<1.063 and abs(x)>.078) or (y<-.14 and .985<z<1.065) or (y<-.13 and .49<z<1.005 and abs(x)<(.083+.025*math.sin(z*8))) or (z<1.065 and y<-.265)
    black=(z<.305 and y<-.095) or (z<.105 and abs(x)>.13)
    f.material_index=2 if black else 1 if white else 0
    f.use_smooth=True
foxpart(body)

# Tapered pointed ear shells with a recessed triangular inner surface.
for s in [-1,1]:
    ear=tube('SM_Fox_Ear_'+str(s),[(s*.112,-.074,1.18),(s*.140,-.056,1.235),(s*.151,-.034,1.30),(s*.164,-.016,1.365),(s*.174,-.004,1.423)],[(.066,.030),(.074,.028),(.055,.023),(.026,.012),(.001,.001)],ORANGE,20)
    foxpart(ear)
    patch=mesh('SM_Fox_InnerEar_'+str(s),[(s*.087,-.100,1.212),(s*.194,-.080,1.235),(s*.17,-.019,1.398),(s*.143,-.069,1.295)],[(0,1,3),(1,2,3),(2,0,3)],[EAR])
    sol=patch.modifiers.new('SolidInnerEar','SOLIDIFY');sol.thickness=.003
    active(patch);bpy.ops.object.modifier_apply(modifier=sol.name)
    foxpart(patch)

# Almond eyes, eyelid geometry and a small moist triangular nose.
for s in [-1,1]:
    inv=body.matrix_world.inverted()
    hit,p,n,idx=body.ray_cast(inv@Vector((s*.098,-2,1.126)),Vector((0,1,0)))
    if not hit:raise RuntimeError('Eye surface ray missed sculpt')
    p=body.matrix_world@p;n=(body.matrix_world.to_3x3()@n).normalized()
    for label,offset,scale,material in [('Socket',-.001,(.028,.006,.014),DARK),('Iris',.004,(.009,.003,.011),AMBER),('Pupil',.007,(.004,.002,.008),NOSE)]:
        o=foxpart(ell('SM_Fox_Eye'+label+'_'+str(s),p+n*offset,scale,material,24,12))
        o.rotation_euler=n.to_track_quat('Y','Z').to_euler()
    o=foxpart(ell('SM_Fox_Catchlight_'+str(s),p+n*.011+Vector((-.003,0,.005)),(.002,.0015,.002),GLINT,12,8))
    foxpart(tube('SM_Fox_MouthCorner_'+str(s),[(0,-.429,.998),(s*.03,-.382,.988),(s*.064,-.292,.994),(s*.096,-.249,1.013)],[.0018,.0023,.0026,.001],DARK,6))
nose=foxpart(ell('SM_Fox_Nose',(0,-.441,1.027),(.034,.023,.024),NOSE,24,16))
for v in nose.data.vertices:
    if v.co.z<0:v.co.x*=.57
for s in [-1,1]:foxpart(ell('SM_Fox_Nostril_'+str(s),(s*.018,-.460,1.032),(.008,.003,.006),DARK,16,10))

# A broad tapered tail flowing around the seated body, not a constant-radius tube.
tail=tube('SM_Fox_BrushTail',[(.07,.31,.25),(.23,.38,.21),(.42,.35,.17),(.52,.22,.15),(.55,.035,.16),(.46,-.17,.16),(.31,-.29,.13),(.19,-.33,.12)], [.072,.12,.155,.167,.15,.12,.077,.006],ORANGE,24)
tail.data.materials.append(CREAM)
for f in tail.data.polygons:
    if f.center.y<-.12:f.material_index=1
foxpart(tail)
sub=tail.modifiers.new('TailContour','SUBSURF');sub.levels=2;active(tail);bpy.ops.object.modifier_apply(modifier=sub.name)

# Each tuft is a closed tapered spindle laid along the actual sculpt surface.
# The geometry has root width, a raised ridge and a pointed end; no flat cards.
def fur_on(o,name,count,length,width):
    vs=[];fs=[];mi=[]
    polys=list(o.data.polygons)
    for j in range(count):
        f=random.choice(polys); p=o.matrix_world@f.center;n=(o.matrix_world.to_3x3()@f.normal).normalized()
        if n.z<-.6 or p.z<.065:continue
        if o==body and p.y<-.32:continue
        if o==body and min((p-Vector((sg*.113,-.231,1.128))).length for sg in [-1,1])<.043:continue
        flow=Vector((0,.18,-1))
        if o==tail:flow=Vector((-.35,-.75,-.12))
        d=flow-n*flow.dot(n)
        if d.length<.05:d=Vector((1,0,0)).cross(n)
        d.normalize();d=(d+n*.15).normalized();u=d.cross(n).normalized()
        le=length*random.uniform(.60,1.4);w=width*random.uniform(.65,1.2)
        if o==body and p.z>1.075:le*=.30
        if o==body and .965<p.z<1.075:le*=.60
        if o==body and p.z<.30:le*=.45
        start=p-n*.0018;mid=p+d*(le*.38)+n*(w*.45);end=p+d*le+n*(w*.22)
        idx=len(vs)
        # diamond cross-sections: buried root, raised midsection, pointed tip
        vs += [start-u*w*.55,start+n*w*.20,start+u*w*.55,start-n*w*.4,
               mid-u*w*.44,mid+n*w*.28,mid+u*w*.44,mid-n*w*.28,end]
        local=[(0,3,2,1)]
        for k in range(4):local += [(k,(k+1)%4,4+(k+1)%4,4+k),(4+k,4+(k+1)%4,8)]
        fs.extend([tuple(idx+i for i in face) for face in local])
        material= f.material_index
        if o==tail:material=1 if p.y<-.10 else 0
        if material==0 and random.random()<.27:material=3
        mi.extend([material]*len(local))
    fur=mesh(name,vs,fs,[ORANGE,CREAM,DARK,GOLD],False)
    for f,i in zip(fur.data.polygons,mi):f.material_index=i
    foxpart(fur);return fur
fur_on(body,'SM_Fox_LayeredBodyFur',6500,.057,.009)
fur_on(tail,'SM_Fox_LayeredTailFur',2400,.055,.012)
# Fine toe definition; cheek tufts are part of the continuous sculpt.
for s in [-1,1]:
    for i in range(3):
        x=s*.11+(i-1)*.017
        foxpart(tube('SM_Fox_ToeSeam_%s_%s'%(s,i),[(x,-.341,.045),(x,-.315,.062),(x,-.29,.068)],[.001,.0016,.0006],DARK,6))

# Simple UVs now; no borrowed image textures. Detailed groom is a study LOD.
for o in FOX:
    if o.type!='MESH':continue
    active(o)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.1519,island_margin=.01)
    bpy.ops.object.mode_set(mode='OBJECT')
ROOT.location=(12,0,0)
ROOT['status']='Local sculpt study; unrigged; reference comparison pending'
ROOT['source']='Blender bpy only; no Rodin or cloud generation'

# Only the newly authored study is rendered; all original objects remain in the scene.
SCENE['LI_original_render_visibility']=json.dumps({o.name:o.hide_render for o in SCENE.objects if not any(c.name.startswith('LI_Local_') for c in o.users_collection)})
for o in SCENE.objects:
    if not any(c.name.startswith('LI_Local_') for c in o.users_collection):o.hide_render=True

# Dedicated presentation setup in the same scene, apart from existing artwork.
STUDIO=bpy.data.collections.new('LI_Local_Studio_v2');SCENE.collection.children.link(STUDIO)
def studio(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    STUDIO.objects.link(o);return o
floor=mat('LI_Studio_Limestone',(.34,.31,.245))
bpy.ops.mesh.primitive_plane_add(size=200,location=(12,0,-.125))
bg=studio(bpy.context.object);bg.name='LI_Studio_Backdrop';bg.data.materials.append(mat('LI_Studio_BackdropMat',(.145,.165,.155)))
bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=1.5,depth=.09,location=(12,0,-.065))
ped=studio(bpy.context.object);ped.name='Studio_plinth';ped.data.materials.append(floor)
bev=ped.modifiers.new('RoundedBase','BEVEL');bev.width=.035;bev.segments=3
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(14.05,-3.25,1.65));cam=studio(bpy.context.object);cam.name='LI_Fox_ReviewCamera';aim(cam,(12,-.035,.71));cam.data.type='ORTHO';cam.data.ortho_scale=1.90;SCENE.camera=cam
for name,loc,energy,size,col in [('Key',(10,-3,4),170,3,(1,.84,.67)),('Fill',(14,-1,2),70,2,(.72,.84,1)),('Rim',(12,2,3),220,2,(1,.8,.54))]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=studio(bpy.context.object);o.name='LI_'+name;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;o.data.color=col;aim(o,(12,0,.65))
SCENE.render.resolution_x=1300;SCENE.render.resolution_y=1300;SCENE.render.resolution_percentage=100
SCENE.render.image_settings.file_format='PNG';SCENE.render.film_transparent=False
SCENE.render.filepath=str(OUT/'Fox_Local_v2.png')
SCENE.unit_settings.system='METRIC';SCENE.unit_settings.scale_length=1
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
active(body)
helper_path=Path(__file__).with_name('review_local_assets_v2.py')
helper={'__file__':str(helper_path)}
exec(compile(helper_path.read_text(),str(helper_path),'exec'),helper)
helper['safe_save']()
print(json.dumps({'file':bpy.data.filepath,'fox_parts':len(FOX),'vertices':sum(len(o.data.vertices) for o in FOX),'render':SCENE.render.filepath}))
