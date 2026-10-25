"""Supported app-server JSON-RPC only; never reads private session/auth databases."""
import json, os, queue, shutil, subprocess, threading

class RPC:
 def __init__(self, cwd, on_event, on_request, binary=None):
  self.pending={};self.lock=threading.Lock();self.sequence=0;self.on_event=on_event;self.on_request=on_request
  binary=binary or shutil.which('codex')
  if not binary:raise RuntimeError('Codex ist auf diesem Rechner nicht erreichbar')
  args=[binary,'app-server','--listen','stdio://']
  # Narrow this service only; do not edit user config or managed requirements.
  overrides={'features.shell_tool':False,'features.apps':False,'features.plugins':False,'features.remote_plugin':False,'features.multi_agent':False,'web_search':'disabled','mcp_servers':{},'notify':[]}
  for key,value in overrides.items():args+=['-c',key+'='+ ('{}' if value=={} else json.dumps(value))]
  self.process=subprocess.Popen(args,cwd=cwd,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,bufsize=1)
  threading.Thread(target=self._read,daemon=True).start()
  self.info=self.call('initialize',{'clientInfo':{'name':'gradecrew_central','title':'GradeCrew Firmenzentrale','version':'0.2'},'capabilities':{'experimentalApi':True}})
  self.send({'method':'initialized','params':{}})
 def send(self, value):
  with self.lock:
   self.process.stdin.write(json.dumps(value)+'\n');self.process.stdin.flush()
 def call(self, method, params, timeout=35):
  with self.lock:self.sequence+=1;ident=self.sequence;q=queue.Queue();self.pending[ident]=q
  try:
   self.send(dict(id=ident,method=method,params=params));value=q.get(timeout=timeout)
   if 'error' in value:raise RuntimeError(str(value['error'].get('message','Codex-Verbindung beendet')))
   return value.get('result',{})
  except queue.Empty:raise TimeoutError('Codex-Antwort ausgeblieben; Start nicht automatisch wiederholen')
  finally:
   with self.lock:self.pending.pop(ident,None)
 def respond(self, ident, result):self.send({'id':ident,'result':result})
 def _read(self):
  try:
   for line in self.process.stdout:
    try:value=json.loads(line)
    except ValueError:continue
    if 'method' in value:
     if 'id' in value:threading.Thread(target=self.on_request,args=(value,),daemon=True).start()
     else:
      try:self.on_event(value)
      except Exception:pass
    else:
     q=self.pending.get(value.get('id'))
     if q:q.put(value)
  finally:
   for q in list(self.pending.values()):q.put({'error':{'message':'Codex-Verbindung beendet'}})
   self.on_event({'method':'central/disconnected','params':{}})
 def close(self):
  self.process.terminate()
  try:self.process.wait(timeout=5)
  except subprocess.TimeoutExpired:self.process.kill()
