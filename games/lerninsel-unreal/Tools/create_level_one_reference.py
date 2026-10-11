"""Create only the isolated Level1 map and its original sky material."""
import unreal
tools=unreal.AssetToolsHelpers.get_asset_tools()
path='/Game/Materials/Level1Reference/M_ReferenceSky'
mat=unreal.load_asset(path)
if not mat:
    mat=tools.create_asset('M_ReferenceSky','/Game/Materials/Level1Reference',unreal.Material,unreal.MaterialFactoryNew())
edit=unreal.MaterialEditingLibrary
edit.delete_all_material_expressions(mat)
mat.set_editor_property('two_sided',True)
mat.set_editor_property('shading_model',unreal.MaterialShadingModel.MSM_UNLIT)
mat.set_editor_property('used_with_instanced_static_meshes',True)
vertex=edit.create_material_expression(mat,unreal.MaterialExpressionVertexColor,-200,0)
edit.connect_material_property(vertex,'',unreal.MaterialProperty.MP_EMISSIVE_COLOR)
edit.recompile_material(mat)
unreal.EditorAssetLibrary.save_loaded_asset(mat)
text_path='/Game/Materials/Level1Reference/M_ReferenceText'
text=unreal.load_asset(text_path)
if not text:
    default=unreal.get_default_object(unreal.TextRenderComponent).get_editor_property('text_material')
    assert default
    text=unreal.EditorAssetLibrary.duplicate_asset(default.get_path_name().split('.')[0],text_path)
assert isinstance(text,unreal.Material)
text.set_editor_property('shading_model',unreal.MaterialShadingModel.MSM_UNLIT)
text.set_editor_property('two_sided',True)
color=edit.create_material_expression(text,unreal.MaterialExpressionVertexColor,-200,300)
edit.connect_material_property(color,'',unreal.MaterialProperty.MP_EMISSIVE_COLOR)
edit.recompile_material(text)
unreal.EditorAssetLibrary.save_loaded_asset(text)
levels=unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
name='/Game/Maps/Lerninsel_Level1Ref'
assert levels.load_level(name) if unreal.EditorAssetLibrary.does_asset_exist(name) else levels.new_level(name)
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
mode=unreal.load_class(None,'/Script/Lerninsel.IslandLevelOneGameMode')
assert mode
settings=unreal.GameplayStatics.get_all_actors_of_class(world,unreal.WorldSettings)
assert len(settings)==1
settings[0].set_editor_property('default_game_mode',mode)
actors=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
def one(cls,pos,rotation=unreal.Rotator(0,0,0)):
    existing=next((a for a in actors.get_all_level_actors() if isinstance(a,cls)),None)
    return existing or actors.spawn_actor_from_class(cls,unreal.Vector(*pos),rotation)
sun=one(unreal.DirectionalLight,(0,0,1800),unreal.Rotator(-42,-28,0))
light=sun.get_component_by_class(unreal.DirectionalLightComponent)
light.set_mobility(unreal.ComponentMobility.MOVABLE)
light.set_editor_property('intensity',4.2)
light.set_editor_property('light_color',unreal.Color(255,244,221,255))
light.set_editor_property('light_source_angle',2.0)
sky=one(unreal.SkyLight,(0,0,1500))
ambient=sky.get_component_by_class(unreal.SkyLightComponent)
ambient.set_mobility(unreal.ComponentMobility.MOVABLE)
ambient.set_editor_property('source_type',unreal.SkyLightSourceType.SLS_SPECIFIED_CUBEMAP)
ambient.set_editor_property('cubemap',unreal.load_asset('/Engine/MapTemplates/Sky/DaylightAmbientCubemap'))
ambient.set_editor_property('intensity',1.4)
ambient.set_editor_property('lower_hemisphere_is_black',False)
one(unreal.PlayerStart,(-2800,0,90))
assert levels.save_current_level()
unreal.log('LERNINSEL_LEVEL1_MAP_READY isolated native mode, normal maps unchanged')
unreal.SystemLibrary.quit_editor()
