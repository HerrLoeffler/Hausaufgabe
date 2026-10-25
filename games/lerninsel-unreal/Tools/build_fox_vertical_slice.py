import bpy
import math
import os
from mathutils import Vector

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Content/Art/FoxVerticalSlice"))
os.makedirs(OUT, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def mat(name, color, rough=.72, metallic=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF"); p.inputs["Base Color"].default_value=(*color,1); p.inputs["Roughness"].default_value=rough; p.inputs["Metallic"].default_value=metallic
    return m

stone=mat("Limestone · warm grey",(.49,.46,.39)); stone_hi=mat("Limestone · carved edge",(.66,.60,.48)); fox=mat("Fox · russet",(.70,.22,.075)); fox_light=mat("Fox · copper cheek",(.86,.36,.10)); cream=mat("Fox · warm cream",(.91,.79,.61)); dark=mat("Fox · dark paws and nose",(.105,.082,.063)); eye=mat("Fox · amber eyes",(.92,.52,.12),.26); rope=mat("Gate · braided hemp",(.40,.24,.105)); wood=mat("Gate · dark cedar",(.23,.12,.07)); leaf_a=mat("Leaves · gold",(.85,.49,.075)); leaf_b=mat("Leaves · orange",(.75,.20,.045)); leaf_c=mat("Leaves · olive",(.27,.37,.10)); grass=mat("Ground · meadow",(.22,.31,.14)); moss=mat("Ground · fern",(.36,.43,.19)); path=mat("Path · pale sand",(.68,.56,.39)); water=mat("Water · turquoise",(.06,.37,.42),.22)

def smooth(obj, material):
    obj.data.materials.append(material)
    if obj.type=='MESH':
        for p in obj.data.polygons:p.use_smooth=False
    return obj

def uv(name, loc, scale, material, seg=12, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;return smooth(o,material)

def loft_x(name, loc, sections, material, sides=8):
    """Faceted tapered fox anatomy; each section is x, y, z, half-width, half-height."""
    verts=[];faces=[]
    for x,y,z,width,height in sections:
        for i in range(sides):
            a=2*math.pi*i/sides
            verts.append((x,y+math.cos(a)*width,z+math.sin(a)*height))
    for row in range(len(sections)-1):
        for i in range(sides):
            a=row*sides+i;b=row*sides+(i+1)%sides
            c=(row+1)*sides+i;d=(row+1)*sides+(i+1)%sides
            faces.extend(((a,c,b),(b,c,d)))
    start=len(verts);verts.append(sections[0][:3])
    end=len(verts);verts.append(sections[-1][:3]);last=(len(sections)-1)*sides
    for i in range(sides):
        faces.extend(((start,(i+1)%sides,i),(end,last+i,last+(i+1)%sides)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(material);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.location=loc
    return obj

def cube(name, loc, scale, material, bevel=.08):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);smooth(o,material)
    if bevel:
        mod=o.modifiers.new("Soft worn edges","BEVEL");mod.width=bevel;mod.segments=3
        o.modifiers.new("Weighted stone corners","WEIGHTED_NORMAL")
    return o

def cyl(name, a, b, radius, material, vertices=20):
    a,b=Vector(a),Vector(b);d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=d.length,location=(a+b)*.5)
    o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y');return smooth(o,material)

def curve(name, points, bevel, material, cyclic=False):
    c=bpy.data.curves.new(name,"CURVE");c.dimensions='3D';c.bevel_depth=bevel;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,v in zip(s.points,points):p.co=(*v,1)
    s.use_cyclic_u=cyclic;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material);return o

# Quiet autumn courtyard: a readable approach, a single stone fox, and one meaningful gate.
cube("Courtyard · moss lawn",(0,0,-.25),(22,16,.5),grass,.4)
cube("Approach · pale stone path",(0,-3.3,.015),(14,3.2,.09),path,.06)
for x in [-5.5,-3.7,-1.9,0,1.9,3.7,5.5]:
    for j in range(2):cube("Path · irregular paving",(x,-3.3+j*.9,.08),(1.45,.72,.09),stone_hi if (j+int(x*10))%3==0 else path,.09)
# Old cedar gate with rounded carved sandstone frame.
for x in [-3.2,3.2]:
    cube("Gate · sandstone pier",(x,2.9,2.25),(.8,.9,4.5),stone,.24)
    cube("Gate · carved pier cap",(x,2.9,4.62),(1.2,1.2,.38),stone_hi,.12)
cube("Gate · lintel",(0,2.9,4.45),(7.7,1,1.0),stone,.32)
curve("Gate · arch carved into face",[(-2.25,2.36,.25),(-2.25,2.36,2.6),(-1.6,2.36,3.35),(0,2.36,3.65),(1.6,2.36,3.35),(2.25,2.36,2.6),(2.25,2.36,.25)],.075,stone_hi)
for x in [-1.7,-1.15,-.6,0,.6,1.15,1.7]:cube("Gate · cedar slat",(x,3.12,1.63),(.20,.3,2.8),wood,.055)
cube("Gate · crossbar",(0,2.91,2.2),(3.75,.45,.28),wood,.07)
# The rope is visibly attached to the fox's mouth and the latch, so the later action reads clearly.
curve("Gate · rope from mouth to latch",[(.70,.02,1.92),(.76,.72,1.9),(.82,1.48,1.75),(1.05,2.15,1.50),(1.58,2.64,1.54)],.055,rope)
cube("Gate · latch block",(1.65,2.78,1.5),(.58,.35,.32),wood,.09)
cyl("Gate · latch peg",(1.72,2.59,1.34),(1.72,2.59,1.72),.075,stone_hi)

# Fox parts share the original prototype's action-ready component vocabulary and origins.
# The body stays seated until the answer, then all these meshes can animate independently.
uv("FoxBody",(-.05,0,.93),(1.03,.46,.52),fox)
uv("FoxChest",(.53,0,1.12),(.43,.42,.67),cream)
uv("FoxHead",(.62,0,1.78),(.57,.46,.48),fox_light)
uv("FoxCheek_L",(.82,-.29,1.57),(.34,.22,.27),cream)
uv("FoxCheek_R",(.82,.29,1.57),(.34,.22,.27),cream)
# Long tapered muzzle and jaw, oriented toward the gate (+Y).
loft_x("FoxMuzzle",(.91,0,1.64),[(-.15,0,.01,.075,.060),(-.07,0,.01,.080,.055),(.02,0,0,.065,.044),(.12,0,-.02,.043,.032),(.20,0,-.03,.017,.016)],cream,8)
uv("FoxJaw",(.91,0,1.49),(.24,.22,.075),cream,8,6)
uv("FoxNose",(1.12,0,1.61),(.055,.075,.05),dark,8,6)
for side in [-1,1]:
    # Tall fox ears taper via bevelled cone, with inset copper inner ear.
    bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=.19,radius2=.008,depth=.62,location=(.43,side*.29,2.34));smooth(bpy.context.object,fox);bpy.context.object.name="FoxEar"
    uv("FoxInnerEar",(.45,side*.39,2.40),(.075,.035,.22),dark,6,4)
    uv("FoxEye",(.86,side*.405,1.91),(.075,.04,.095),eye,8,6)
    uv("FoxPupil",(.89,side*.443,1.91),(.026,.018,.055),dark,6,4)
for x in [-.53,.38]:
    for side in [-1,1]:
        uv("FoxLeg",(x,side*.29,.40),(.16,.16,.39),dark,24,16)
        uv("FoxFoot",(x+.08,side*.30,.13),(.25,.19,.15),dark,24,16)
loft_x("FoxTail",(-1.08,0,.83),[(.22,0,-.02,.07,.06),(.10,0,0,.12,.09),(-.08,0,.05,.17,.12),(-.27,0,.08,.16,.12),(-.45,0,.09,.12,.10),(-.58,0,.09,.05,.05)],fox,10)
loft_x("FoxTailTip",(-1.79,0,1.03),[(.08,0,0,.08,.07),(.01,0,0,.07,.06),(-.06,0,.01,.04,.04),(-.11,0,.01,.01,.01)],cream,8)
# Preserve exact component silhouettes in both states: statue is a material-state change,
# not a stack of loosely fitted grey blobs over the living fox.
living_parts=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith('Fox')]
for original in living_parts:
    statue=original.copy();statue.data=original.data.copy();statue.name='StatueFox · '+original.name
    bpy.context.collection.objects.link(statue);statue.data.materials.clear();statue.data.materials.append(stone)
    original.hide_render=True
# Thin etched cracks and a couple of tiny lichen patches signal long dormancy.
curve("Fox statue · hairline crack",[(.2,-.454,1.28),(.28,-.469,1.16),(.22,-.469,1.03),(.30,-.46,.95)],.013,stone_hi)
uv("Lichen · fox shoulder",(.05,-.45,1.27),(.11,.018,.045),moss,20,12)
uv("Lichen · tail",(-1.0,-.304,.97),(.12,.018,.04),moss,20,12)
# A low stone plinth makes the fox silhouette readable against the path.
cube("Fox · worn pedestal",(-.30,0,.04),(3.75,2.05,.30),stone,.19)
for x in [-1.75,1.2]:cube("Fox pedestal · carved foot",(x,0,.26),(.2,1.62,.19),stone_hi,.055)

# Autumn garden frame; trees sit outside the approach and leave the gate silhouette open.
for x,y,h,canopy in [(-8,2,6,leaf_b),(8,2.7,7,leaf_a),(-7,6,7,leaf_a),(7,7,6,leaf_b),(-9,-1,5,leaf_c),(9,-1,5,leaf_c)]:
    cyl("Garden · old tree trunk",(x,y,.0),(x,y,h*.56),.23,wood,16)
    for dx,dy,dz in [(-1.2,0,.65),(1.15,.2,.9),(.1,-.85,.8)]:cyl("Garden · branch",(x,y,h*.43),(x+dx,y+dy,h*.72+dz),.105,wood,14)
    for dx,dy,dz,r in [(0,0,h*.76,1.8),(-1.0,.1,h*.66,1.2),(.9,.25,h*.73,1.25),(.1,-.8,h*.72,1.05)]:uv("Garden · autumn canopy",(x+dx,y+dy,dz),(r,r*.86,r*.82),canopy,32,20)
for i in range(44):
    a=i*2.399; r=5.4+(i%7)*.49;x=math.cos(a)*r;y=math.sin(a)*r*.72
    if -4<x<4 and y<1.7:continue
    uv("Garden · low fern mound",(x,y,.10),(.38,.32,.21),moss,20,12)
# Small turquoise basin just inside the gate provides a color echo, not another objective.
cyl("Courtyard · spring basin",(5.3,3.2,.08),(5.3,3.2,.72),.87,stone,48)
cyl("Courtyard · clear spring",(5.3,3.2,.73),(5.3,3.2,.76),.64,water,48)

# Camera and soft late-afternoon lighting for a usable first quality review render.
world=bpy.context.scene.world;world.color=(.20,.25,.27)
world.use_nodes=True;world.node_tree.nodes["Background"].inputs["Color"].default_value=(.20,.29,.34,1);world.node_tree.nodes["Background"].inputs["Strength"].default_value=.42
bpy.ops.object.light_add(type='AREA',location=(-5,-7,12));key=bpy.context.object;key.name="Late afternoon · broad softbox";key.data.energy=2100;key.data.shape='DISK';key.data.size=8;key.rotation_euler=(Vector((0,1,1.7))-key.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='AREA',location=(7,0,8));fill=bpy.context.object;fill.name="Gate · warm rim";fill.data.energy=1250;fill.data.color=(1,.63,.31);fill.data.size=6;fill.rotation_euler=(Vector((0,1,1.5))-fill.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(7,-13,6.5));cam=bpy.context.object;cam.name="Review camera · fox and readable gate";cam.rotation_euler=(Vector((0,1.8,2.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=16;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,"FoxCourtyard_Review.png")
scene.camera.data.lens=48

# Save editable Blender source and export object-separated static meshes for Unreal import.
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,"FoxCourtyard.blend"))
def export_group(path, prefix):
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:
        if o.type=='MESH' and (o.name.startswith(prefix) if prefix else not o.name.startswith(('Fox','StatueFox'))) and not o.name.startswith('StatueFox'):o.select_set(True)
    bpy.context.view_layer.objects.active=next((o for o in bpy.context.selected_objects),None)
    bpy.ops.export_scene.fbx(filepath=path,use_selection=True,apply_scale_options='FBX_SCALE_UNITS',object_types={'MESH'},mesh_smooth_type='FACE',add_leaf_bones=False)

export_group(os.path.join(OUT,"Fox_AnimatedParts.fbx"),"Fox")
export_group(os.path.join(OUT,"FoxCourtyard_Set.fbx"),"")
scene.render.filepath=os.path.join(OUT,"FoxCourtyard_Stone.png");bpy.ops.render.render(write_still=True)
for o in bpy.context.scene.objects:
    if o.name.startswith('StatueFox'):o.hide_render=True
    if o.name.startswith('Fox') and not o.name.startswith('StatueFox'):o.hide_render=False
scene.render.filepath=os.path.join(OUT,"FoxCourtyard_Awakened.png");bpy.ops.render.render(write_still=True)
print("FOX_SLICE_READY",OUT)
