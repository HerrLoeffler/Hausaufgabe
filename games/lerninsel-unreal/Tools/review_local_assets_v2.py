"""Export fox study/LODs; render actual geometry; save without scene credentials.
Functions can be called in short MCP batches so inspection stays interactive.
"""
import bpy, json, math, bmesh, contextlib, io
from mathutils import Vector
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'Content/Art/LocalAssetsV2'
S=bpy.context.scene

def active(o):
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
def tri(o):
    o.data.calc_loop_triangles();return len(o.data.loop_triangles)
def safe_save():
    saved=[]
    try:
        for scene in bpy.data.scenes:
            for p in scene.bl_rna.properties:
                if p.type=='STRING' and not p.is_readonly and any(x in p.identifier.lower() for x in ('api_key','secret','password','token')):
                    value=getattr(scene,p.identifier)
                    if value:saved.append((scene,p.identifier,value));setattr(scene,p.identifier,'')
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Lerninsel_LocalAssets_v2.blend'))
    finally:
        for scene,key,value in saved:setattr(scene,key,value)
    print('Saved versioned project with scene credential fields cleared in the saved copy.')

def fbx(root,path):
    pos=root.location.copy();scale=root.scale.copy();root.location=(0,0,0)
    active(root)
    for o in root.children:o.select_set(True)
    with contextlib.redirect_stdout(io.StringIO()):
        bpy.ops.export_scene.fbx(filepath=str(path),use_selection=True,object_types={'EMPTY','MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,use_mesh_modifiers=True,bake_anim=False,add_leaf_bones=False)
    root.location=pos;root.scale=scale

def fox_exports():
    root=bpy.data.objects['SM_Fox_Local_Master'];root.scale=(.65,)*3
    dest=OUT/'Export/Characters';dest.mkdir(parents=True,exist_ok=True)
    source=list(root.children);count=sum(tri(o) for o in source)
    fbx(root,dest/'SM_Fox_ReferenceSculpt.fbx')
    col=bpy.data.collections.new('LI_Local_Fox_Variants_v2');S.collection.children.link(col)
    report={'master_triangles':count,'seated_height_m':None,'rig':False,'animation_tested':False,'engine_import_tested':False,'variants':[]}
    for label,target in [('LOD0',6000),('LOD1',3000),('Stone',6000)]:
        parent=bpy.data.objects.new('SM_Fox_'+label,None);col.objects.link(parent)
        copies=[]
        for o in source:
            # Thousands of disconnected fur tufts cannot decimate to a mobile budget.
            # Keep the groom in the sculpt source and export explicit smooth-body LODs.
            if 'Layered' in o.name or (label=='Stone' and 'Catchlight' in o.name):continue
            n=o.copy();n.data=o.data.copy();col.objects.link(n);n.parent=None
            # Apply the original child local transform, including the body construction origin.
            n.matrix_world=o.matrix_basis.copy();copies.append(n)
        bpy.ops.object.select_all(action='DESELECT')
        for o in copies:o.select_set(True)
        bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join();joined=bpy.context.object;joined.name='SM_Fox_'+label+'_Mesh'
        n=tri(joined);mod=joined.modifiers.new('Budget_'+str(target),'DECIMATE');mod.ratio=min(1,target/n);mod.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
        if label=='Stone':
            joined.data.materials.clear();joined.data.materials.append(bpy.data.materials['LI_Fox_Stone'])
            for p in joined.data.polygons:p.material_index=0
        joined.parent=parent;parent.location=(12+2*(len(report['variants'])+1),-3,0);parent.scale=(.65,)*3
        parent['status']='unrigged LOD study; silhouette/animation and Unreal checks remain'
        path=dest/(parent.name+'.fbx');fbx(parent,path)
        report['variants'].append({'name':parent.name,'triangles':tri(joined),'fbx':str(path)})
    bpy.context.view_layer.update()
    pts=[o.matrix_world@Vector(c) for o in source for c in o.bound_box]
    report['seated_height_m']=max(p.z for p in pts)-min(p.z for p in pts)
    (OUT/'fox_manifest.json').write_text(json.dumps(report,indent=2));safe_save();print(json.dumps(report))

def render_views(roots,size=480,views=None):
    camera=bpy.data.objects['LI_Fox_ReviewCamera'];S.camera=camera
    old_camera=camera.matrix_world.copy();old_ortho=camera.data.ortho_scale
    oldres=(S.render.resolution_x,S.render.resolution_y);oldpath=S.render.filepath
    visible={o.name:o.hide_render for o in S.objects}
    studio=bpy.data.collections['LI_Local_Studio_v2']
    for o in S.objects:o.hide_render=True
    for o in studio.objects:o.hide_render=False
    S.render.resolution_x=size;S.render.resolution_y=size
    directory=OUT/'Previews';directory.mkdir(exist_ok=True)
    try:
        for root in roots:
            objects=[o for o in root.children if o.type=='MESH' and not o.name.startswith('UCX_')]
            pos=root.location.copy();scale=root.scale.copy();root.location=(12,0,0);root.scale=(1,1,1)
            bpy.context.view_layer.update()
            pts=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
            extent=max(max(p[i] for p in pts)-min(p[i] for p in pts) for i in range(3))
            root.scale=(1.35/max(extent,.01),)*3;bpy.context.view_layer.update()
            pts=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
            root.location.z=-min(p.z for p in pts)+.005;bpy.context.view_layer.update()
            pts=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
            center=Vector(tuple((min(p[i] for p in pts)+max(p[i] for p in pts))/2 for i in range(3)))
            for o in objects:o.hide_render=False
            for label,direction in (views or [('Front',(0,-4,.25)),('Side',(4,0,.25)),('ThreeQuarter',(2.6,-4,2.3))]):
                camera.location=center+Vector(direction);camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=1.85
                S.render.filepath=str(directory/(root.name+'_'+label+'.png'))
                with contextlib.redirect_stdout(io.StringIO()):bpy.ops.render.render(write_still=True)
            for o in objects:o.hide_render=True
            root.location=pos;root.scale=scale
    finally:
        for name,state in visible.items():
            if bpy.data.objects.get(name):bpy.data.objects[name].hide_render=state
        camera.matrix_world=old_camera;camera.data.ortho_scale=old_ortho
        S.render.resolution_x,S.render.resolution_y=oldres;S.render.filepath=oldpath
    print('Rendered',len(views or [1,2,3]),'views each for',len(roots),'assets')

def render_hero():
    root=bpy.data.objects['SM_Fox_Local_Master'];camera=bpy.data.objects['LI_Fox_ReviewCamera'];S.camera=camera
    camera.location=(13.45,-2.7,1.05);target=Vector((12,-.025,.465));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=1.22
    S.render.resolution_x=1300;S.render.resolution_y=1300;S.render.filepath=str(OUT/'Fox_Local_v2.png');bpy.ops.render.render(write_still=True)
    safe_save()

def audit():
    records=[]
    for c in bpy.data.collections:
        if c.name not in ['LI_Local_Fox_v2','LI_Local_Fox_Variants_v2'] and c.name not in bpy.data.collections['LI_Local_Kit_v2'].children:continue
        for o in c.objects:
            if o.type!='MESH':continue
            bm=bmesh.new();bm.from_mesh(o.data)
            records.append({'object':o.name,'triangles':tri(o),'uv_layers':len(o.data.uv_layers),'boundary_edges':sum(e.is_boundary for e in bm.edges),'non_manifold_edges':sum(not e.is_manifold for e in bm.edges),'negative_scale':any(v<0 for v in o.scale)})
            bm.free()
    report={'objects':records,'interpretation':'Foliage uses open two-sided leaf surfaces. Other boundary edges require review; no claim of rig-ready topology. Counts do not test intersections or animation.'}
    (OUT/'geometry_audit.json').write_text(json.dumps(report,indent=2))
    print('Audited',len(records),'mesh objects;',sum(r['negative_scale'] for r in records),'with negative scale;',sum(r['uv_layers']==0 for r in records),'without UVs')
