import unreal
from pathlib import Path
root=Path(unreal.Paths.project_dir())
source=root/'Content/Art/LocalAssetsV2/Export/Characters/SM_Fox_ReferenceSculpt.fbx'
task=unreal.AssetImportTask()
task.filename=str(source)
task.destination_path='/Game/Art/FoxV2'
task.destination_name='SM_Fox_Design'
task.automated=True;task.replace_existing=True;task.save=True
options=unreal.FbxImportUI()
options.import_mesh=True;options.import_as_skeletal=False
options.import_materials=False;options.import_textures=False;options.import_animations=False
options.automated_import_should_detect_type=False
options.mesh_type_to_import=unreal.FBXImportType.FBXIT_STATIC_MESH
options.static_mesh_import_data.combine_meshes=True
options.static_mesh_import_data.generate_lightmap_u_vs=False
options.static_mesh_import_data.auto_generate_collision=False
options.static_mesh_import_data.import_uniform_scale=1.0
task.options=options
unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
mesh=unreal.load_asset('/Game/Art/FoxV2/SM_Fox_Design')
if not isinstance(mesh,unreal.StaticMesh):raise RuntimeError('Fox design import failed')
unreal.EditorAssetLibrary.save_loaded_asset(mesh)
unreal.log('FOX_DESIGN_IMPORTED '+str(mesh.get_bounds()))
unreal.SystemLibrary.quit_editor()
