"""Exercise the pinned MCP server against this task's disposable Blender scene."""
import asyncio
import json
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
PROMPT = 'Okay, dann fang an, das Ganze umzusetzen und wie du schon geschrieben hast, kannst du ja mit Zoll versuchen, die Modellierung zu starten und wenn du an einem bestimmten Punkt merkst, dass es nicht funktioniert, müssen wir eben auf Astra switchen. Genau.'

async def main():
    server = StdioServerParameters(
        command=str(ROOT / '.gradecrew-tools/mcp-venv/bin/mcp-for-blender'),
        env={'BLENDER_HOST':'127.0.0.1', 'BLENDER_PORT':'9877',
             'BLENDER_MCP_SAFE_MODE':'1', 'DISABLE_TELEMETRY':'true'},
    )
    evidence = {'transport':'stdio MCP to local Blender addon', 'port':9877, 'safe_mode':True}
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            info = await session.initialize()
            evidence['server'] = info.serverInfo.model_dump()
            inventory = await session.list_tools()
            evidence['tools'] = [x.name for x in inventory.tools]
            before = await session.call_tool('get_scene_info', {'fields':['location','settings'],'user_prompt':PROMPT})
            evidence['before'] = before.model_dump(mode='json')
            code = f'''import bpy, json
cube=bpy.data.objects.get('Cube')
assert cube is not None, 'Expected disposable factory scene'
cube.name='GC_ConnectionProof'
cube.location.x=0.35
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=8
scene.render.resolution_x=256
scene.render.resolution_y=256
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath={str(OUT/'connection-proof.png')!r}
bpy.ops.wm.save_as_mainfile(filepath={str(OUT/'connection-proof.blend')!r})
bpy.ops.render.render(write_still=True)
print('GC_PROOF_OK',json.dumps({{"blender":bpy.app.version_string,"object":cube.name,"x":cube.location.x}}))
'''
            result = await session.call_tool('execute_blender_code', {'code':code,'user_prompt':PROMPT})
            evidence['execution'] = result.model_dump(mode='json')
            text='\n'.join(getattr(x,'text','') for x in result.content)
            assert not result.isError and 'GC_PROOF_OK' in text, text
            after = await session.call_tool('get_scene_info', {'query':'GC_ConnectionProof','fields':['location','settings'],'user_prompt':PROMPT})
            evidence['after'] = after.model_dump(mode='json')
    (OUT/'mcp-proof.json').write_text(json.dumps(evidence,indent=2)+'\n')
    print(json.dumps({'passed':True,'tools':len(evidence['tools']),'render':str(OUT/'connection-proof.png')}))

asyncio.run(main())
