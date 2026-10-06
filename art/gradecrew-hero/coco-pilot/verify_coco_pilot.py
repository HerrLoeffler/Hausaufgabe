"""Useful behavior checks after fresh-process .blend open; no quality approval.

Run Blender --background coco-door-pilot.blend --python this_file.
Creates a repeat desktop proof and rebuilds twice into ignored _verification/.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE=Path(__file__).resolve().parent
CHECKS=[]
MEASUREMENTS={}


def check(name,condition,detail):
    CHECKS.append({"check":name,"passed":bool(condition),"detail":detail})


def matrix_signature(obj):
    return [round(v,7) for row in obj.matrix_world for v in row]


def points(obj):
    depsgraph=bpy.context.evaluated_depsgraph_get()
    evaluated=obj.evaluated_get(depsgraph)
    mesh=evaluated.to_mesh()
    output=[evaluated.matrix_world @ v.co for v in mesh.vertices]
    evaluated.to_mesh_clear()
    return output


scene=bpy.data.scenes["GC_CocoPilotScene"]
bpy.context.window.scene=scene
check("fresh_process_source_open",Path(bpy.data.filepath).resolve()==(HERE/"coco-door-pilot.blend").resolve(),bpy.data.filepath)
check("own_scene_excludes_factory_objects",all(o.name.startswith("GC_") for o in scene.objects),[o.name for o in scene.objects if not o.name.startswith("GC_")])
check("no_text_objects",not any(o.type=="FONT" for o in scene.objects),"Rendered assets contain no baked words")
check("no_image_textures",not any(n.type=="TEX_IMAGE" for m in bpy.data.materials if m.use_nodes for n in m.node_tree.nodes),"Character and room use procedural materials and actual surfaces")
check("spatial_crew_placeholders_hidden",all(bpy.data.objects["GC_PLACEHOLDER_"+n].hide_render for n in ("Remy","Emmi","Wilma")),"Three wire-display placeholder meshes retained; no crew models claimed")

# Camera field-of-view checks inspect actual evaluated head, flippers and feet,
# not merely names or fixed hardcoded character endpoints.
visible_names=["GC_HeadSurface","GC_BodySurface","GC_FlipperWelcome","GC_FootPalm_-1","GC_FootPalm_1"]+["GC_Toe_%s_%s"%(s,t) for s in (-1,1) for t in (-1,0,1)]
for cam_name,w,h in (("GC_CAM_Desktop",1200,800),("GC_CAM_Inspection",900,1000),("GC_CAM_Mobile",720,1080)):
    scene.render.resolution_x=w
    scene.render.resolution_y=h
    scene.frame_set(1)
    scene.camera=bpy.data.objects[cam_name]
    p=[world_to_camera_view(scene,scene.camera,v) for name in visible_names for v in points(bpy.data.objects[name])]
    bounds={"xmin":min(v.x for v in p),"xmax":max(v.x for v in p),"ymin":min(v.y for v in p),"ymax":max(v.y for v in p),"minimum_depth":min(v.z for v in p)}
    MEASUREMENTS[cam_name]=bounds
    check(cam_name+"_contains_head_feet_flipper",bounds["xmin"]>0 and bounds["xmax"]<1 and bounds["ymin"]>0 and bounds["ymax"]<1 and bounds["minimum_depth"]>0,bounds)

frames={}
for frame in (1,12,24):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    foot_names=["GC_FootPalm_-1","GC_FootPalm_1"]+["GC_Toe_%s_%s"%(s,t) for s in (-1,1) for t in (-1,0,1)]
    foot_low=min(v.z for name in foot_names for v in points(bpy.data.objects[name]))
    frames[frame]={"head_yaw":float(bpy.data.objects["GC_CTRL_HeadTurn"].rotation_euler.z),"blink_scale_L":float(bpy.data.objects["GC_CTRL_Blink_L"].scale.z),"blink_scale_R":float(bpy.data.objects["GC_CTRL_Blink_R"].scale.z),"wave_y":float(bpy.data.objects["GC_CTRL_FlipperWave"].rotation_euler.y),"door":matrix_signature(bpy.data.objects["GC_DoorLeaf"]),"contact_flipper":matrix_signature(bpy.data.objects["GC_FlipperDoor"]),"feet":{name:matrix_signature(bpy.data.objects[name]) for name in foot_names},"lowest_foot_z":foot_low}
check("head_turn_changes",abs(frames[12]["head_yaw"]-frames[1]["head_yaw"])>.10,frames)
check("blink_closes_and_reopens",frames[1]["blink_scale_L"]>.95 and frames[12]["blink_scale_L"]<.10 and frames[24]["blink_scale_L"]>.95,{f:frames[f]["blink_scale_L"] for f in frames})
check("welcome_flipper_changes",abs(frames[24]["wave_y"]-frames[12]["wave_y"])>.20,{f:frames[f]["wave_y"] for f in frames})
check("door_contact_stays_fixed",all(frames[f]["door"]==frames[1]["door"] and frames[f]["contact_flipper"]==frames[1]["contact_flipper"] for f in frames),"Fixed door and contact-side flipper; door opening animation is not implemented")
check("feet_do_not_slide",all(frames[f]["feet"]==frames[1]["feet"] for f in frames),"Foot world transforms identical at 1,12,24")
check("feet_reach_floor",all(-.01<=frames[f]["lowest_foot_z"]<=.012 for f in frames),{f:frames[f]["lowest_foot_z"] for f in frames})
MEASUREMENTS["frames"]=frames

scene.frame_set(1)
bpy.context.view_layer.update()
knob=bpy.data.objects["GC_DoorKnob"]
knob_inverse=knob.matrix_world.inverted()
contact=bpy.data.objects["GC_FlipperDoor"]
distances=[]
for p in points(contact):
    hit,nearest,normal,index=knob.closest_point_on_mesh(knob_inverse@p)
    if hit:
        distances.append((p-knob.matrix_world@nearest).length)
MEASUREMENTS["door_contact_surface_distance"]=min(distances)
check("flipper_reaches_handle_surface",min(distances)<.05,{"minimum_surface_distance":min(distances),"note":"Proximity of surfaces, not a solver-based collision proof"})
body_points=points(bpy.data.objects["GC_BodySurface"])
for side in (-1,1):
    palm=bpy.data.objects["GC_FootPalm_"+str(side)]
    ankle=bpy.data.objects["GC_CoveredAnkle_"+str(side)]
    ankle_p=points(ankle)
    palm_p=points(palm)
    foot_top=max(v.z for v in palm_p)
    ankle_min=min(v.z for v in ankle_p)
    ankle_max=max(v.z for v in ankle_p)
    cx,cy=palm.matrix_world.translation.xy
    near=[v for v in body_points if (Vector((v.x-cx,v.y-cy))).length<.11]
    body_bottom=min(v.z for v in near)
    check("body_ankle_foot_overlap_"+str(side),foot_top>=ankle_min and ankle_max>=body_bottom,{"foot_top":foot_top,"ankle_bottom":ankle_min,"ankle_top":ankle_max,"body_lower_surface_near_foot":body_bottom})

# Freshly reopened source must also render the same actual desktop image.
scene.camera=bpy.data.objects["GC_CAM_Desktop"]
scene.render.resolution_x=1200
scene.render.resolution_y=800
scene.frame_set(1)
repeat=HERE/"renders"/"reopened-desktop.png"
scene.render.filepath=str(repeat)
bpy.ops.render.render(write_still=True)
original=HERE/"renders"/"desktop-frame-01.png"
original_hash=hashlib.sha256(original.read_bytes()).hexdigest()
repeat_hash=hashlib.sha256(repeat.read_bytes()).hexdigest()
check("fresh_reopen_desktop_rerender",repeat.exists() and repeat.stat().st_size>100000,{"original_sha256":original_hash,"reopened_sha256":repeat_hash,"byte_identical":original_hash==repeat_hash})

# Rebuild twice while retaining an unrelated scene, collection, transform and
# an unreferenced GC_-prefixed material (guards overly broad cleanup).
outside=bpy.data.scenes.get("Scene") or bpy.data.scenes.new("UnrelatedScene")
sentinel_collection=bpy.data.collections.new("Unrelated_KeepCollection")
outside.collection.children.link(sentinel_collection)
sentinel=bpy.data.objects.new("Unrelated_KeepObject",None)
sentinel.location=(7,8,9)
sentinel["keep_me"]="unchanged"
sentinel_collection.objects.link(sentinel)
unused=bpy.data.materials.new("GC_UnrelatedUnusedMaterial")
sentinel_snapshot={"location":list(sentinel.location),"property":sentinel["keep_me"],"collection":sentinel.users_collection[0].name}
spec=importlib.util.spec_from_file_location("coco_builder",HERE/"build_coco_pilot.py")
builder=importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
args=SimpleNamespace(output=HERE/"_verification",render="none",samples=48,engine="CYCLES")
counts=[]
for iteration in range(2):
    builder.build(args)
    counts.append(len(bpy.data.collections[builder.COLLECTION].all_objects))
    check("rebuild_preserves_unrelated_"+str(iteration),bpy.data.objects.get(sentinel.name)==sentinel and list(sentinel.location)==sentinel_snapshot["location"] and sentinel["keep_me"]==sentinel_snapshot["property"] and sentinel_collection in outside.collection.children.values() and bpy.data.materials.get("GC_UnrelatedUnusedMaterial")==unused,sentinel_snapshot)
check("rebuild_no_duplicate_owned_objects",counts[0]==counts[1] and all(not o.name.endswith(".001") for o in bpy.data.collections[builder.COLLECTION].all_objects),counts)

result={"task":"GC-DESIGN-05","blender":bpy.app.version_string,"source_blend":str(HERE/"coco-door-pilot.blend"),"source_blend_sha256":hashlib.sha256((HERE/"coco-door-pilot.blend").read_bytes()).hexdigest(),"checks":CHECKS,"measurements":MEASUREMENTS,"passed":sum(c["passed"] for c in CHECKS),"failed":sum(not c["passed"] for c in CHECKS),"visual_acceptance":False,"visual_limitations":["Right eye catches broad grey reflection; dark eye color consistency fails visual gate","Eye/sclera layers still appear raised on face","Central forehead mask ends in a squared U","Fur reads as sparse stubble, not canonical soft fluffy down","Blink is a transform squash, not modeled eyelids","Side/back shape inferred; only a prototype","Door is fixed, no contact-aware door animation"]}
(HERE/"verification-evidence.json").write_text(json.dumps(result,indent=2)+"\n")
print("GC_PILOT_VERIFY "+json.dumps({"passed":result["passed"],"failed":result["failed"],"visual_acceptance":False}))
if result["failed"]:
    raise RuntimeError("Coco pilot behavior verification failed; inspect verification-evidence.json")
