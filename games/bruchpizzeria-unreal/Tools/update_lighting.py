import unreal
maps=unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
if not maps.load_level('/Game/Maps/Pizzeria'):raise RuntimeError('Kitchen map missing')
actors=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
for actor in actors.get_all_level_actors():
    if isinstance(actor,unreal.SkyLight):
        comp=actor.get_component_by_class(unreal.SkyLightComponent)
        comp.set_editor_property('source_type',unreal.SkyLightSourceType.SLS_SPECIFIED_CUBEMAP)
        comp.set_editor_property('cubemap',unreal.load_asset('/Engine/MapTemplates/Sky/DaylightAmbientCubemap'))
        comp.set_editor_property('intensity',2.0)
        comp.set_editor_property('lower_hemisphere_is_black',False)
    elif isinstance(actor,unreal.DirectionalLight):
        actor.get_component_by_class(unreal.DirectionalLightComponent).set_editor_property('intensity',2.2)
    elif isinstance(actor,unreal.PointLight):
        actor.get_component_by_class(unreal.PointLightComponent).set_editor_property('intensity',80.0)
arena_class=unreal.load_class(None,'/Script/Bruchpizzeria.PizzaArena')
for actor in actors.get_all_level_actors():
    if actor.get_class().get_name()=="PizzaArena":actors.destroy_actor(actor)
arena=actors.spawn_actor_from_class(arena_class,unreal.Vector(0,0,0))
arena.set_actor_label('La Piccola - authored native kitchen')
maps.save_current_level()
unreal.log('PIZZA_LIGHTING_SAVED: specified daylight ambient; original room regenerated')
unreal.SystemLibrary.quit_editor()
