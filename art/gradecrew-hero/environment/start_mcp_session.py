import bpy, importlib.util, sys, os, json, uuid
from pathlib import Path
root=Path(__file__).resolve().parents[4]
addon=root/'.gradecrew-tools/mcp-for-blender/addon.py'
spec=importlib.util.spec_from_file_location('gc_blender_mcp',str(addon))
module=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=module
spec.loader.exec_module(module)
module.register()
# Keep this reproducible session pinned; no automatic update check.
if bpy.app.timers.is_registered(module._addon_update_check_on_startup):
    bpy.app.timers.unregister(module._addon_update_check_on_startup)
bpy.context.scene['gc_pipeline_session']=uuid.uuid4().hex
bpy.context.scene.name='GC_ConnectionProofScene'
bpy.context.scene.blendermcp_auto_start_server=False
server=module.BlenderMCPServer(host='127.0.0.1',port=0)
bpy.types.blendermcp_server=server
server.start()
bpy.context.scene.blendermcp_server_running=server.running
if not server.running:
    raise RuntimeError('Could not start isolated Blender test server')
port=server.socket.getsockname()[1]
server.port=port
bpy.context.scene.blendermcp_port=port
receipt={'host':'127.0.0.1','port':port,'pid':os.getpid(),'nonce':bpy.context.scene['gc_pipeline_session']}
Path(__file__).with_name('session-local.json').write_text(json.dumps(receipt)+'\n')
print('GC_MCP_READY',json.dumps({'port':port,'pid':os.getpid()}),flush=True)
