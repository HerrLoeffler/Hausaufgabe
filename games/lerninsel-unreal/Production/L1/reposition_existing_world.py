import unreal
levels=unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
assert levels.load_level('/Game/Maps/Lerninsel_Weltvorschau')
actors=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
world=[a for a in actors.get_all_level_actors() if a.get_actor_label()=='Lerninsel World V1 (visual only)']
assert len(world)==1, 'Expected exactly one existing visual island'
world[0].set_actor_location(unreal.Vector(0,14000,0),False,False)
assert levels.save_current_level()
unreal.log('L1_WORLD_REPOSITIONED existing actor; Y14000; gameplay unchanged')
unreal.SystemLibrary.quit_editor()
