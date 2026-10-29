"""Optional shared desktop transport. No daemon bootstrap and no thread takeover."""
import threading
from .rpc import RPC
class DesktopHost:
 def __init__(self,cwd,binary):
  self.cwd=cwd;self.binary=binary;self.ready=False;self.error='Desktop-Steueranschluss wird geprüft.';self.rpc=None;self.connecting=False;self.connect()
 def connect(self):
  if self.connecting or self.ready:return False
  self.connecting=True
  def run():
   try:
    self.rpc=RPC(self.cwd,self.event,lambda request:None,self.binary,proxy=True);self.ready=True;self.error=''
   except Exception:
    self.ready=False;self.error='Der gemeinsame Codex-Desktopanschluss ist nicht erreichbar. Kein Fachchat wurde gestartet. Bestehende Chats lassen sich weiterhin öffnen und ihre Meldungen lesen.'
   finally:self.connecting=False
  threading.Thread(target=run,daemon=True).start();return True
 def event(self,event):
  if event.get('method')=='central/disconnected':self.ready=False;self.error='Desktop-Steueranschluss unterbrochen. Unklare Übermittlungen zuerst im Chat prüfen.'
 def call(self,*args,**kwargs):
  if not self.ready or not self.rpc:raise ValueError(self.error)
  return self.rpc.call(*args,**kwargs)
 def close(self):
  if self.rpc:self.rpc.close()
