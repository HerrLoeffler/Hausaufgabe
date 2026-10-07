import unreal
m=unreal.load_asset('/Game/Materials/M_Expedition')
unreal.log('EXP_MATERIAL '+str(m))
unreal.log('EXP_PARAMETERS '+str(unreal.MaterialEditingLibrary.get_vector_parameter_names(m)))
unreal.log('EXP_INPUT '+str(unreal.MaterialEditingLibrary.get_material_property_input_node(m,unreal.MaterialProperty.MP_BASE_COLOR)))
unreal.SystemLibrary.quit_editor()
