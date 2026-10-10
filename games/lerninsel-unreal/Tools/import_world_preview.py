"""Import the Blender world into a copy of the playable map for local review."""
from pathlib import Path
import unreal


root = Path(unreal.Paths.project_dir())
source = root / "Content/Art/LerninselWorldV1/Export/Lerninsel_World_Prototype_V1.fbx"
if not source.is_file():
    raise FileNotFoundError(source)

task = unreal.AssetImportTask()
task.filename = str(source)
task.destination_path = "/Game/Art/LerninselWorldV1"
task.destination_name = "SM_Lerninsel_World_Prototype_V1"
task.automated = True
task.replace_existing = True
task.save = True
options = unreal.FbxImportUI()
options.import_mesh = True
options.import_as_skeletal = False
options.import_materials = True
options.import_textures = False
options.import_animations = False
options.automated_import_should_detect_type = False
options.mesh_type_to_import = unreal.FBXImportType.FBXIT_STATIC_MESH
options.static_mesh_import_data.combine_meshes = True
options.static_mesh_import_data.generate_lightmap_u_vs = True
options.static_mesh_import_data.auto_generate_collision = False
options.static_mesh_import_data.import_uniform_scale = 1.0
task.options = options
unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])

mesh_path = "/Game/Art/LerninselWorldV1/SM_Lerninsel_World_Prototype_V1"
mesh = unreal.load_asset(mesh_path)
if not isinstance(mesh, unreal.StaticMesh):
    raise RuntimeError(f"World mesh import failed: {mesh_path}")
unreal.EditorAssetLibrary.save_loaded_asset(mesh)
unreal.log(f"WORLD_MESH_IMPORTED bounds={mesh.get_bounds()}")

tools = unreal.EditorAssetLibrary
preview_map = "/Game/Maps/Lerninsel_Weltvorschau"
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
if not tools.does_asset_exist(preview_map):
    if not levels.new_level(preview_map):
        raise RuntimeError("Could not create an isolated world-preview map")
else:
    if not levels.load_level(preview_map):
        raise RuntimeError(f"Could not open preview map: {preview_map}")

actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
existing = [a for a in actors.get_all_level_actors() if a.get_actor_label() == "Lerninsel World V1 (visual only)"]
for actor in existing:
    actors.destroy_actor(actor)
world = actors.spawn_actor_from_object(mesh, unreal.Vector(0, 0, 0))
if not world:
    raise RuntimeError("Could not place imported world mesh")
world.set_actor_label("Lerninsel World V1 (visual only)")
world.set_actor_enable_collision(False)
component = world.get_component_by_class(unreal.StaticMeshComponent)
if component:
    component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
    component.set_mobility(unreal.ComponentMobility.STATIC)

def spawn_light(cls, label, location):
    found = next((a for a in actors.get_all_level_actors() if isinstance(a, cls)), None)
    result = found or actors.spawn_actor_from_class(cls, unreal.Vector(*location), unreal.Rotator(0, 0, 0))
    if result:
        result.set_actor_label(label)
    return result

sun = spawn_light(unreal.DirectionalLight, "World Preview Sun", (0, 0, 15000))
if sun:
    light = sun.get_component_by_class(unreal.DirectionalLightComponent)
    light.set_mobility(unreal.ComponentMobility.MOVABLE)
    light.set_editor_property("intensity", 3.2)
    light.set_editor_property("light_color", unreal.Color(255, 241, 214, 255))
    light.set_editor_property("light_source_angle", 3.0)
sky = spawn_light(unreal.SkyLight, "World Preview Sky", (0, 0, 12000))
if sky:
    ambient = sky.get_component_by_class(unreal.SkyLightComponent)
    ambient.set_mobility(unreal.ComponentMobility.MOVABLE)
    ambient.set_editor_property("source_type", unreal.SkyLightSourceType.SLS_SPECIFIED_CUBEMAP)
    ambient.set_editor_property("cubemap", unreal.load_asset("/Engine/MapTemplates/Sky/DaylightAmbientCubemap"))
    ambient.set_editor_property("intensity", 1.7)
    ambient.set_editor_property("lower_hemisphere_is_black", False)
spawn_light(unreal.SkyAtmosphere, "World Preview Atmosphere", (0, 0, 0))
spawn_light(unreal.PlayerStart, "World Preview Start", (-1600, 0, 90))

if not levels.save_current_level():
    raise RuntimeError("Could not save isolated preview map")
unreal.log("WORLD_PREVIEW_MAP_READY /Game/Maps/Lerninsel_Weltvorschau")
unreal.SystemLibrary.quit_editor()
