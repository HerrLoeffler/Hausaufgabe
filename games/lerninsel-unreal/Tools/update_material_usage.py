import unreal
for name in ['M_Island','M_Glow','M_Glass']:
    material = unreal.load_asset('/Game/Materials/' + name)
    if not material:
        raise RuntimeError('Missing own material ' + name)
    material.set_editor_property('used_with_instanced_static_meshes', True)
    unreal.MaterialEditingLibrary.recompile_material(material)
    if not unreal.EditorAssetLibrary.save_loaded_asset(material):
        raise RuntimeError('Cannot save own material ' + name)
unreal.log('LERNINSEL_MATERIAL_USAGE_SAVED')
