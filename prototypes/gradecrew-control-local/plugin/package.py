"""Build an allowlisted local plugin package; never include private .local state."""
from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1]
dest=root/'.distribution'/'gradecrew-central'
dest.mkdir(parents=True,exist_ok=True)
files=['plugin.json','mcp.json','server.mjs','data/catalog.json','coordination.json','public/shared.mjs','public/app.mjs','public/style.css','public/index.html']
files += ['plugin/'+n for n in ['mcp.mjs','connection.mjs','client.mjs','taxonomy.mjs','start.sh','bridge.mjs','view.mjs','ui.html']]
for name in files:
 target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,target)
m=json.loads((dest/'mcp.json').read_text())
m['mcpServers']['gradecrew-central']['env']={'GC_CONTROL_STATE_DIR':str(root/'.local')}
(dest/'mcp.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
market=root/'.distribution'/'.agents'/'plugins';market.mkdir(parents=True,exist_ok=True)
(market/'marketplace.json').write_text(json.dumps({'name':'gradecrew-local','interface':{'displayName':'GradeCrew – lokale Plugins'},'plugins':[{'name':'gradecrew-central','source':{'source':'local','path':'./gradecrew-central'},'policy':{'installation':'AVAILABLE','authentication':'ON_INSTALL'},'category':'Productivity'}]},ensure_ascii=False,indent=2)+'\n')
print(root/'.distribution')
