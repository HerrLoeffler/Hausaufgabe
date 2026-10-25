"""Procedural Blender-only supporting kit for Lerninsel. No cloud calls.
Run after build_local_fox_v2.py in the same active scene.
"""
import bpy, math, random, json, bmesh
from mathutils import Vector
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'Content/Art/LocalAssetsV2'
SCENE=bpy.context.scene;random.seed(107)
if bpy.data.collections.get('LI_Local_Kit_v2'):raise RuntimeError('Kit exists: inspect before rebuilding')
KIT=bpy.data.collections.new('LI_Local_Kit_v2');SCENE.collection.children.link(KIT)
ASSETS=[];ROOT=None;COL=None

def mat(name,c,rough=.7,metal=0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*c,1)
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    return m
M={k:mat('LI_'+k,c) for k,c in {'Sand':(.53,.36,.18),'Grass':(.13,.25,.071),'Water':(.033,.38,.49),'Stone':(.35,.32,.25),'Wood':(.20,.085,.026),'Rope':(.43,.28,.12),'Interactive':(.035,.37,.46),'Ivory':(.89,.80,.60),'Ink':(.023,.035,.034),'LeafGold':(.64,.31,.025),'LeafOrange':(.54,.095,.012),'LeafGreen':(.13,.32,.09)}.items()}
M['Metal']=mat('LI_Metal',(.085,.105,.10),.4,.65)
M['Glass']=mat('LI_Glass',(.65,.80,.75),.12)
p=next(n for n in M['Glass'].node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Transmission Weight'].default_value=.65;p.inputs['Alpha'].default_value=.22
if hasattr(M['Glass'],'surface_render_method'):
    modes=[i.identifier for i in M['Glass'].bl_rna.properties['surface_render_method'].enum_items]
    if 'DITHERED' in modes:M['Glass'].surface_render_method='DITHERED'

def asset(name,category):
    global ROOT,COL
    COL=bpy.data.collections.new('LI_'+name);KIT.children.link(COL)
    ROOT=bpy.data.objects.new(name,None);COL.objects.link(ROOT)
    ROOT['category']=category;ROOT['status']='model draft; Unreal import unverified'
    ASSETS.append(ROOT);return ROOT
def add(o,name,ma):
    for c in list(o.users_collection):c.objects.unlink(o)
    COL.objects.link(o);o.name=name;o.parent=ROOT
    if ma:o.data.materials.append(ma)
    return o
def active(o):
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
def box(name,loc,size,ma,bevel=.008):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=add(bpy.context.object,name,ma);o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        b=o.modifiers.new('Soft_edges','BEVEL');b.width=bevel;b.segments=2
        bpy.ops.object.modifier_apply(modifier=b.name)
        for p in o.data.polygons:p.use_smooth=True
        n=o.modifiers.new('Weighted_normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=n.name)
    return o
def sphere(name,loc,scale,ma,sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=add(bpy.context.object,name,ma);o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cylinder(name,loc,r,depth,ma,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc);o=add(bpy.context.object,name,ma)
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    return o
def tube(name,points,radii,ma,sides=10):
    pts=list(map(Vector,points));vs=[];fs=[];previous=None
    for j,p in enumerate(pts):
        t=(pts[min(j+1,len(pts)-1)]-pts[max(0,j-1)]).normalized()
        ref=previous if previous is not None else (Vector((1,0,0)) if abs(t.x)<.9 else Vector((0,1,0)))
        u=(ref-t*ref.dot(t)).normalized();v=t.cross(u).normalized();previous=u
        for k in range(sides):
            a=2*math.pi*k/sides;vs.append(p+radii[j]*(u*math.cos(a)+v*math.sin(a)))
    for j in range(len(pts)-1):
        for k in range(sides):
            a=j*sides+k;b=j*sides+(k+1)%sides;fs.append((a,b,b+sides,a+sides))
    vs.extend([pts[0],pts[-1]])
    for k in range(sides):fs.extend([(len(vs)-2,(k+1)%sides,k),(len(vs)-1,(len(pts)-1)*sides+k,(len(pts)-1)*sides+(k+1)%sides)])
    return mesh(name,vs,fs,ma)
def mesh(name,vs,fs,ma):
    d=bpy.data.meshes.new(name);d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);COL.objects.link(o);o.parent=ROOT;d.materials.append(ma)
    for p in d.polygons:p.use_smooth=True
    return o
def lathe(name,profile,ma,segments=48):
    vs=[];fs=[]
    for r,z in profile:
        for i in range(segments):
            a=i*2*math.pi/segments;vs.append((r*math.cos(a),r*math.sin(a),z))
    for j in range(len(profile)):
        jj=(j+1)%len(profile)
        for i in range(segments):fs.append((j*segments+i,j*segments+(i+1)%segments,jj*segments+(i+1)%segments,jj*segments+i))
    return mesh(name,vs,fs,ma)
def text(name,value,loc,size,ma):
    d=bpy.data.curves.new(name,'FONT');d.body=value;d.size=size;d.align_x='CENTER';d.extrude=.0004;d.resolution_u=3
    o=bpy.data.objects.new(name,d);COL.objects.link(o);o.parent=ROOT;o.location=loc;o.rotation_euler=(math.pi/2,0,0);d.materials.append(ma)
    active(o);bpy.ops.object.convert(target='MESH');o=bpy.context.object
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=.0000001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free()
    return o
def collider(o,name=None):
    c=o.copy();c.data=o.data.copy();COL.objects.link(c);c.name=name or 'UCX_'+ROOT.name+'_01';c.hide_render=True;c.display_type='WIRE';c['collision_proxy']=True;return c
def finish(root,display_scale=1):
    # Conservative single convex collision box for solid static kit items.
    # Arch piers and cup already have individually authored proxies.
    decorative=any(tag in root.name for tag in ['PerspectiveArc','RopeLoop','GrassTuft','FlowerPatch','Shell'])
    if not decorative and not any(o.name.startswith('UCX_') for o in root.children):
        bpy.context.view_layer.update()
        pts=[o.matrix_world@Vector(c) for o in root.children if o.type=='MESH' and 'water' not in o.name.lower() for c in o.bound_box]
        if pts:
            lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
            proxy=box('UCX_'+root.name+'_01',(hi+lo)/2,hi-lo,None,0)
            if root.name.startswith('SM_Env_Tree'):
                proxy.location.x=0;proxy.location.y=0;proxy.dimensions.x=.23;proxy.dimensions.y=.23
                active(proxy);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
            proxy.hide_render=True;proxy.display_type='WIRE';proxy['collision_proxy']=True
    # Local modelling coordinates stay untouched; only the catalogue placement changes.
    idx=len(ASSETS)-1;root.location=(18+(idx%6)*3.4,5+(idx//6)*4.2,0);root.scale=(display_scale,)*3
    root['display_scale']=display_scale

# Water task: the SAME 1 L cup can be carried between both puzzles.
a=asset('SM_Prop_MeasuringCup_1L','Props');r=math.sqrt(.001/(math.pi*.16))
cup=lathe('Cup_hollow_body',[(.0001,0),(.051,0),(.051,.172),(.047,.179),(r,.172),(r,.012),(.0001,.012)],M['Glass'],64)
tube('Cup_large_handle',[(.046,0,.145),(.084,0,.15),(.09,0,.13),(.09,0,.052),(.077,0,.033),(.049,0,.043)],[.008]*6,M['Interactive'],12)
lathe('Cup_thick_rim',[(.046,.171),(.053,.171),(.053,.181),(.046,.181)],M['Interactive'],64)
for i in range(1,11):
    z=.012+i*.016
    box('Cup_mark_%02d'%i,(0,-.052,z),(.031,.0015,.0018),M['Ink'],.0003)
    text('Cup_fraction_%02d'%i,str(i)+'/10',(.020,-.053,z-.0035),.0065,M['Ink'])
text('Cup_capacity','1 L',(0,-.055,.174),.008,M['Ink'])
water=cylinder('Cup_Water_3of10',(0,0,.012+.048/2),r-.0005,.048,M['Water'],64);water['fill_fraction']=.3;water['capacity_litres']=1
proxy=cylinder('Cup_collision',(0,0,.088),.053,.176,None,16);proxy.name='UCX_SM_Prop_MeasuringCup_1L_01';proxy.hide_render=True;proxy.display_type='WIRE'
a['inner_radius_m']=r;a['water_column_m']=.16;a['capacity_litres']=1;finish(a,5)
for handle in [False,True]:
    a=asset('SM_Prop_Bucket_'+('Handle' if handle else 'Open'),'Props')
    lathe('Bucket_open_shell',[(.001,0),(.13,0),(.17,.29),(.153,.295),(.114,.021),(.001,.021)],M['Wood'])
    for z in [.05,.245]:lathe('Bucket_band',[(.13+z*.135,z),(.14+z*.135,z),(.142+z*.135,z+.018),(.132+z*.135,z+.018)],M['Metal'])
    if handle:
        pts=[(.164*math.cos(t),0,.28+.165*math.sin(t)) for t in [i*math.pi/16 for i in range(17)]]
        tube('Bucket_pivot_handle',pts,[.008]*17,M['Metal'],8)
    finish(a,2.3)
for amount in [100,200]:
    a=asset('SM_Prop_Inflow_'+str(amount)+'ml','Props')
    box('Tap_plinth',(0,0,.26),(.30,.28,.52),M['Stone'],.025)
    tube('Tap_spout',[(0,0,.55),(0,0,.67),(0,-.18,.69),(0,-.24,.64)],[.028]*4,M['Metal'])
    cylinder('Tap_action_top',(0,0,.73),.08,.025,M['Interactive'])
    text('Tap_volume',str(amount)+' ml',(0,-.151,.31),.045,M['Ink'])
    for i in range(amount//100):sphere('Tap_drop_'+str(i),((i-(amount//100-1)/2)*.07,-.17,.43),(.019,.009,.029),M['Interactive'])
    finish(a,1.5)
a=asset('SM_Prop_Drain_100ml','Props');box('Drain_body',(0,0,.09),(.27,.24,.18),M['Stone'],.025)
tube('Drain_lever',[(0,0,.18),(0,0,.26),(.12,0,.26)],[.015]*3,M['Interactive'])
text('Drain_volume','-100 ml',(0,-.126,.08),.038,M['Ink']);finish(a,2)
a=asset('SM_Prop_WaterTrough','Props')
box('Trough_base',(0,0,.055),(1.2,.65,.11),M['Stone'],.035)
for x in [-.565,.565]:box('Trough_end',(x,0,.24),(.07,.65,.37),M['Stone'],.025)
for y in [-.29,.29]:box('Trough_side',(0,y,.24),(1.1,.07,.37),M['Stone'],.025)
box('Trough_water',(0,0,.24),(1.06,.50,.018),M['Water'],.01)
text('Trough_target','1 L',(0,-.332,.25),.12,M['Ink']);finish(a)

# Each gate animation part has a physically meaningful pivot.
a=asset('SM_Gate_Arch','Props')
for x in [-.95,.95]:
    for i in range(5):box('Arch_pier',(x,0,.20+i*.39),(.40,.45,.37),M['Stone'],.025)
for i in range(9):
    a0=i*math.pi/9+.007;a1=(i+1)*math.pi/9-.007
    vs=[]
    for y in [-.23,.23]:
        for rx,rz in [(.77,.54),(1.14,.87)]:
            for angle in [a0,a1]:vs.append((rx*math.cos(angle),y,1.82+rz*math.sin(angle)))
    o=mesh('Arch_wedge',vs,[(0,2,3,1),(4,5,7,6),(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3)],M['Stone'])
    active(o);mod=o.modifiers.new('Stone_edge','BEVEL');mod.width=.013;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
for i,x in enumerate([-.95,.95]):
    o=box('UCX_SM_Gate_Arch_%02d'%i,(x,0,.95),(.40,.45,1.90),None,0);o.hide_render=True;o.display_type='WIRE'
finish(a,.8)
a=asset('SM_Gate_Door','Props');a['pivot']='left hinge at local x=0'
for i in range(8):box('Door_wood_plank',(i*.18+.09,0,.92),(.165,.095,1.82),M['Wood'],.009)
for z in [.30,1.48]:box('Door_iron_strap',(.72,-.065,z),(1.44,.045,.075),M['Metal'],.008)
for z in [.30,1.48]:cylinder('Door_hinge',(0,0,z),.042,.18,M['Metal'])
finish(a,.8)
a=asset('SM_Gate_Latch','Props')
box('Latch_backplate',(0,0,.09),(.34,.035,.18),M['Metal'],.01)
bolt=box('Bolt_sliding',(0,-.04,.09),(.36,.05,.046),M['Interactive'],.008);bolt['motion_axis']='X'
finish(a,3)
a=asset('SM_Gate_RopeLoop','Props');a['pivot']='top rope attachment'
pts=[(.09*math.sin(i*2*math.pi/32),0,-.12+.12*math.cos(i*2*math.pi/32)) for i in range(33)]
tube('RopeLoop_animated',pts,[.014]*33,M['Rope'],10);finish(a,3)
a=asset('SM_Env_FencePanel','Environment')
for x in [-.65,.65]:box('Fence_post',(x,0,.48),(.10,.12,.96),M['Wood'],.012)
for z in [.35,.7]:box('Fence_rail',(0,0,z),(1.4,.08,.09),M['Wood'],.01)
finish(a)
for i,word in enumerate(['laufen','der','Fuchs']):
    a=asset('SM_Puzzle_WordStone_%02d'%(i+1),'Puzzles');box('Whole_selectable_stone',(0,0,.10),(.65,.46,.20),M['Stone'],.07)
    label=text('Word_label',word,(0,-.13,.211),.095,M['Ink']);label.rotation_euler=(0,0,0)
    a['selection']='Replace the WHOLE stone material with LI_Interactive; no checkmark';finish(a,1.7)

# Environment pieces: reusable terrain, shore, rocks, shrubs and three trees.
for name,ma in [('IslandGrass',M['Grass']),('ShoreSand',M['Sand']),('Transition',M['Sand'])]:
    a=asset('SM_Env_'+name,'Environment');o=sphere('Terrain_piece',(0,0,-.18),(1.55,1.2,.30),ma,3)
    if name=='Transition':sphere('Grass_cap',(-.35,0,-.035),(1.1,1.0,.16),M['Grass'],2)
    finish(a,.8)
for i in range(3):
    a=asset('SM_Env_Rock_%02d'%(i+1),'Environment');o=sphere('Rock',(0,0,.23),(.40+i*.06,.30,.27+i*.03),M['Stone'],2)
    for v in o.data.vertices:
        v.co*=random.uniform(.91,1.09)
    finish(a,1.5)
def leaf_cluster(center,radius,ma,count=60):
    vs=[];fs=[]
    for i in range(count):
        d=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-.7,1))).normalized()
        offset=Vector((d.x*radius[0],d.y*radius[1],d.z*radius[2])) if isinstance(radius,tuple) else d*radius
        p=Vector(center)+offset*random.uniform(.93,1.02) if isinstance(radius,tuple) else Vector(center)+offset*random.uniform(.35,1)
        u=d.cross(Vector((0,0,1)))
        if u.length<.001:u=Vector((1,0,0))
        u.normalize();v=d.cross(u).normalized();le=random.uniform(.06,.11);w=le*.45;j=len(vs)
        vs.extend([p-v*le,p-u*w,p+v*le,p+u*w,p+d*.018])
        fs.extend([(j,j+1,j+4),(j+1,j+2,j+4),(j+2,j+3,j+4),(j+3,j,j+4)])
    return mesh('Leaves',vs,fs,ma)
for i in range(3):
    a=asset('SM_Env_Bush_%02d'%(i+1),'Environment')
    for j in range(5):
        center=(math.cos(j*1.7)*.19,math.sin(j*1.7)*.15,.22+(j%2)*.13)
        sphere('Bush_inner_volume',center,(.20,.18,.20),M['LeafGreen'],1)
        leaf_cluster(center,.23,M['LeafGreen'] if i!=1 else M['LeafGold'],45)
    finish(a,1.7)
for i in range(3):
    a=asset('SM_Env_Tree_%02d'%(i+1),'Environment');h=2.6+i*.35
    tube('Tree_trunk',[(0,0,0),(.03,0,h*.3),(-.04,.025,h*.6),(0,0,h*.87)],[.11,.09,.065,.01],M['Wood'],12)
    for j in range(7):
        angle=j*2.40;z=h*(.52+.045*j);end=(math.cos(angle)*.63,math.sin(angle)*.52,z+.35)
        tube('Tree_branch',[(0,0,z-.35),tuple(Vector(end)*Vector((.48,.48,1))),end],[.05,.026,.004],M['Wood'],8)
        color=M[['LeafGreen','LeafGold','LeafOrange'][i]]
        sphere('Crown_inner_volume',end,(.41,.35,.31),color,2)
        leaf_cluster(end,(.41,.35,.31),color,50)
    finish(a,.70)
a=asset('SM_Env_GrassTuft','Environment')
for i in range(17):
    x=random.uniform(-.12,.12);y=random.uniform(-.12,.12)
    tube('Grass_blade',[(x,y,0),(x+.025,y,.14),(x+.07,y+.03,random.uniform(.18,.29))],[.008,.007,.0005],M['Grass'],4)
finish(a,3)
a=asset('SM_Env_FlowerPatch','Environment')
for i in range(7):
    x=random.uniform(-.18,.18);y=random.uniform(-.18,.18);z=random.uniform(.18,.32)
    tube('Flower_stem',[(x,y,0),(x,y,z)],[.004,.003],M['Grass'],6)
    sphere('Flower_center',(x,y,z),(.018,.018,.012),M['LeafGold'],1)
    for j in range(6):sphere('Flower_petal',(x+.022*math.cos(j*math.pi/3),y+.022*math.sin(j*math.pi/3),z),(.024,.015,.007),M['Ivory'],1)
finish(a,2.5)
a=asset('SM_Env_Sign','Environment');box('Sign_post',(0,0,.40),(.07,.07,.8),M['Wood'],.009);box('Sign_board',(0,-.035,.77),(.65,.06,.27),M['Wood'],.02)
text('Sign_text','Fuchshof',(0,-.07,.74),.095,M['Ivory']);finish(a,1.3)
a=asset('SM_Env_BridgeModule','Environment')
for j in range(9):box('Bridge_plank',(0,j*.17,.075),(.95,.16,.10),M['Wood'],.012)
for x in [-.36,.36]:box('Bridge_beam',(x,.68,-.015),(.10,1.6,.09),M['Wood'],.008)
finish(a,.95)
a=asset('SM_Env_PathModule','Environment')
for j in range(3):box('Path_slab',((j%2)*.05,j*.42,.045),(.67,.36,.09),M['Stone'],.045)
finish(a)
a=asset('SM_Env_Shell','Environment')
for j in range(9):
    an=-.9+j*.225
    tube('Shell_rib',[(0,0,.01),(.05*math.sin(an),.05*math.cos(an),.035),(.12*math.sin(an),.12*math.cos(an),.01)],[.005,.010,.006],M['Ivory'],8)
finish(a,5)
a=asset('SM_Env_Driftwood','Environment');tube('Driftwood',[(0,0,.06),(.26,.03,.07),(.51,-.015,.08),(.66,.03,.10)],[.045,.057,.043,.008],M['Wood'],10);finish(a,1.8)
a=asset('SM_Env_Lantern','Environment')
box('Lantern_base',(0,0,.025),(.17,.17,.05),M['Metal'],.012)
box('Lantern_glass',(0,0,.17),(.13,.13,.25),M['Glass'],.008)
for x in [-.07,.07]:
    for y in [-.07,.07]:box('Lantern_frame',(x,y,.17),(.015,.015,.26),M['Metal'],.003)
box('Lantern_cap',(0,0,.31),(.18,.18,.04),M['Metal'],.012)
cylinder('Lantern_candle',(0,0,.105),.024,.12,M['Ink'])
finish(a,3)

# Perspective puzzle fragments and clear large logic blocks.
for i in range(3):
    a=asset('SM_Puzzle_PerspectiveArc_%02d'%(i+1),'Puzzles')
    pts=[(.5*math.cos(t),0,.55+.5*math.sin(t)) for t in [i*2*math.pi/3+j*2*math.pi/3/24 for j in range(25)]]
    tube('Arc_fragment',pts,[.026]*25,M['Interactive'],10);a['assembly']='Three arcs align as one ring only from the gameplay viewpoint';finish(a)
a=asset('SM_Puzzle_ViewpointMarker','Puzzles');lathe('Ground_marker',[(.38,0),(.46,0),(.46,.025),(.38,.025)],M['Interactive']);finish(a)
for i,symbol in enumerate(['+','=','?']):
    a=asset('SM_Puzzle_LogicBlock_%02d'%(i+1),'Puzzles');box('Logic_block',(0,0,.25),(.48,.38,.5),M['Stone'],.04);text('Logic_symbol',symbol,(0,-.195,.18),.23,M['Ivory']);finish(a)
a=asset('SM_Puzzle_Station','Puzzles');box('Station_base',(0,0,.45),(.65,.44,.9),M['Stone'],.055);box('Station_panel',(0,-.23,.68),(.55,.04,.35),M['Interactive'],.025);text('Station_hint','Entdecken',(0,-.254,.64),.071,M['Ivory']);finish(a)

a=asset('SM_Env_WallModule','Environment')
for row in range(3):
    for j in range(3):
        box('Wall_stone',((j-1)*.38+(row%2)*.065,0,.16+row*.31),(.365,.30,.295),M['Stone'],.025)
finish(a,1.1)

# Build UVs and consistently oriented closed faces, then export per-asset files.
records=[]
for root in ASSETS:
    objects=list(root.children)
    for o in objects:
        if o.type!='MESH' or o.name.startswith('UCX_'):continue
        bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free()
        active(o);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.02);bpy.ops.object.mode_set(mode='OBJECT')
    loc=root.location.copy();scale=root.scale.copy();root.location=(0,0,0);root.scale=(1,1,1)
    bpy.context.view_layer.update();bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
    for o in objects:o.select_set(True)
    dest=OUT/'Export'/root['category'];dest.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.fbx(filepath=str(dest/(root.name+'.fbx')),use_selection=True,object_types={'EMPTY','MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,use_mesh_modifiers=True,bake_anim=False,add_leaf_bones=False)
    root.location=loc;root.scale=scale
    tri=0
    for o in objects:
        if o.type=='MESH' and not o.name.startswith('UCX_'):
            o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
    records.append({'asset':root.name,'category':root['category'],'triangles':tri,'parts':len(objects),'fbx':str(dest/(root.name+'.fbx')),'status':'draft; no Unreal import/animation validation'})
(OUT/'asset_manifest.json').write_text(json.dumps(records,indent=2))
helper_path=Path(__file__).with_name('review_local_assets_v2.py')
helper={'__file__':str(helper_path)}
exec(compile(helper_path.read_text(),str(helper_path),'exec'),helper)
helper['safe_save']()
print(json.dumps({'assets':len(records),'total_triangles':sum(r['triangles'] for r in records),'manifest':str(OUT/'asset_manifest.json')}))
