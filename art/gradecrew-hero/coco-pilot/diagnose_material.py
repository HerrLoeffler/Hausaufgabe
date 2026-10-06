"""One-variable visual probe: remove velvet sheen/specular, do not save scene."""
from pathlib import Path
import bpy

for name in ("GC_HeadVelvet","GC_BodyVelvet","GC_NavyDown","GC_IvoryDown"):
    bs=bpy.data.materials[name].node_tree.nodes.get("Principled BSDF")
    bs.inputs["Sheen Weight"].default_value=0
    bs.inputs["Specular IOR Level"].default_value=.15
scene=bpy.data.scenes["GC_CocoPilotScene"]
bpy.context.window.scene=scene
scene.camera=bpy.data.objects["GC_CAM_Inspection"]
scene.render.resolution_x=540
scene.render.resolution_y=640
scene.render.filepath=str(Path(__file__).resolve().parent/"renders"/"diagnostic-no-sheen.png")
bpy.ops.render.render(write_still=True)
