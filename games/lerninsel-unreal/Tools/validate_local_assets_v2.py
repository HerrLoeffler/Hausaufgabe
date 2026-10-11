"""Independent Blender background reopen/FBX round-trip smoke check."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parents[1]/'Content/Art/LocalAssetsV2'
report={'source_opened':bpy.data.filepath,'checks':[],'warnings':[],'unreal_import_tested':False}
assert bpy.data.collections.get('LI_Local_Fox_v2')
assert bpy.data.collections.get('LI_Local_Kit_v2')
cup=bpy.data.objects['SM_Prop_MeasuringCup_1L']
capacity=math.pi*cup['inner_radius_m']**2*cup['water_column_m']*1000
assert abs(capacity-1)<1e-9
report['checks'].append({'cup_capacity_litres':capacity})
secret_fields_nonempty=0
for scene in bpy.data.scenes:
    for key in scene.keys():
        if any(x in key.lower() for x in ['api_key','secret','token','password']) and scene[key]:secret_fields_nonempty+=1
assert secret_fields_nonempty==0
report['checks'].append({'nonempty_saved_scene_credential_fields':secret_fields_nonempty})
for file in ['Characters/SM_Fox_LOD0.fbx','Props/SM_Prop_MeasuringCup_1L.fbx','Props/SM_Gate_Arch.fbx']:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(OUT/'Export'/file))
    added=set(bpy.data.objects)-before;meshes=[o for o in added if o.type=='MESH' and not o.name.startswith('UCX_')]
    assert meshes
    pts=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
    height=max(p.z for p in pts)-min(p.z for p in pts)
    triangles=0
    for o in meshes:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
    if 'Fox_LOD0' in file:
        assert .89<height<.98 and 0<triangles<=6000,(height,triangles)
        if triangles!=6000:report['warnings'].append({'asset':file,'source_triangles':6000,'roundtrip_triangles':triangles,'exact_topology_preserved':False,'status':'difference retained as open export limitation, not claimed lossless'})
    if 'MeasuringCup' in file:assert .17<height<.20,height
    report['checks'].append({'fbx':file,'mesh_objects':len(meshes),'triangles':triangles,'height_m':height})
    for o in added:bpy.data.objects.remove(o,do_unlink=True)
report['passed']=True
(OUT/'roundtrip_validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
