#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
python3 - "$root" <<'PY'
import sys,json,time,subprocess
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError,HTTPError
root=Path(sys.argv[1]);url='http://127.0.0.1:18771/'
def owned():
    try:
        with urlopen(url+'probe-status.json',timeout=2) as response:
            return json.load(response).get('project')=='gradecrew-lerninsel-browser-prototype'
    except HTTPError:
        raise RuntimeError('Port 18771 wird von einer anderen Seite verwendet. Kein fremder Server wurde beendet.')
    except URLError:
        return False
if not owned():
    (root/'evidence').mkdir(exist_ok=True)
    with (root/'evidence/server.log').open('ab') as log:
        process=subprocess.Popen([sys.executable,'-m','http.server','18771','--bind','127.0.0.1','--directory',str(root/'dist')],stdout=log,stderr=log,start_new_session=True)
    for _ in range(30):
        if owned():break
        if process.poll() is not None:raise RuntimeError('Der lokale Server konnte nicht starten. Siehe evidence/server.log.')
        time.sleep(.1)
    else:raise RuntimeError('Der lokale Server antwortet noch nicht.')
subprocess.run(['open',url],check=True)
print('Lerninsel-Browserprobe: '+url)
PY
