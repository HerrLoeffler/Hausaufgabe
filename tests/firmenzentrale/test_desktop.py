"""Desktop transport boundaries: do not adopt another service or duplicate work."""
import importlib.util, sys, tempfile, unittest, json, threading
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))

class DesktopTests(unittest.TestCase):
 def module(self):
  spec=importlib.util.find_spec('central_desktop')
  self.assertIsNotNone(spec, 'Desktop lifecycle is not implemented')
  return importlib.import_module('central_desktop')
 def test_identity_is_bound_to_data_directory(self):
  d=self.module()
  with tempfile.TemporaryDirectory() as tmp:
   identity=d.identity(Path(tmp));self.assertTrue(d.matches(identity,Path(tmp)))
   self.assertFalse(d.matches(identity,Path(tmp)/'other'))
   self.assertFalse(d.matches({'app':'unrelated'},Path(tmp)))
   self.assertNotIn(tmp,json.dumps(identity))
 def test_wrong_or_redirecting_service_is_never_adopted(self):
  d=self.module()
  class Handler(BaseHTTPRequestHandler):
   def do_GET(self):self.send_response(302);self.send_header('Location','https://example.com');self.end_headers()
   def log_message(self,*args):pass
  server=ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
  try:
   with self.assertRaises(d.StartError):d.probe(server.server_port,Path('/tmp/expected'))
  finally:server.shutdown();server.server_close()
 def test_existing_service_reuses_without_starting_process(self):
  d=self.module()
  with tempfile.TemporaryDirectory() as tmp, patch.object(d,'probe',return_value={'app':'gradecrew-central','pid':123}), patch.object(d.subprocess,'Popen') as start:
   result=d.ensure({'dataDirectory':tmp,'port':8796},Path(tmp))
   self.assertEqual(result['url'],'http://127.0.0.1:8796');start.assert_not_called()
 def test_occupied_port_does_not_launch_or_kill(self):
  d=self.module()
  with tempfile.TemporaryDirectory() as tmp, patch.object(d,'probe',side_effect=d.StartError('fremd')), patch.object(d.subprocess,'Popen') as start:
   with self.assertRaises(d.StartError):d.ensure({'dataDirectory':tmp,'port':8796},Path(tmp))
   start.assert_not_called()
 def test_environment_does_not_inherit_python_injection(self):
  d=self.module()
  with patch.dict(d.os.environ,{'PYTHONPATH':'/untrusted','PYTHONSTARTUP':'/untrusted','HTTP_PROXY':'http://untrusted'}):
   env=d.environment(Path('/bundle/Python'))
   self.assertNotIn('PYTHONPATH',env);self.assertNotIn('PYTHONSTARTUP',env)
   self.assertEqual(env['PYTHONHOME'],'/bundle/Python');self.assertEqual(env['NO_PROXY'],'127.0.0.1,localhost')


class RealLifecycleTests(unittest.TestCase):
 def test_two_concurrent_openings_start_one_service_and_keep_journal(self):
  import central_desktop as d
  import concurrent.futures, socket, subprocess, os
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);resources=root/'Resources';data=root/'data';data.mkdir()
   journal=data/'existing-result.txt';journal.write_text('preserve existing evidence')
   (resources/'Python/bin').mkdir(parents=True);(resources/'Python/bin/python3.12').symlink_to(sys.executable)
   tools=resources/'Workspace/tools';tools.mkdir(parents=True)
   # Isolated no-model service fixture exercises real sockets, subprocesses and flock.
   (tools/'serve_firmenzentrale.py').write_text('''import argparse,sys,json,hashlib,os
from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--data-dir');p.add_argument('--port',type=int);a=p.parse_args()
class H(BaseHTTPRequestHandler):
 def do_GET(self):
  b=json.dumps({'app':'gradecrew-central','protocol':1,'dataId':hashlib.sha256(str(Path(a.data_dir).resolve()).encode()).hexdigest(),'pid':os.getpid()}).encode()
  self.send_response(200);self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
 def log_message(self,*args):pass
HTTPServer(('127.0.0.1',a.port),H).serve_forever()
''')
   with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
   children=[];real_start=subprocess.Popen
   def tracked(*args,**kwargs):
    child=real_start(*args,**kwargs);children.append(child);return child
   try:
    with patch.object(d,'environment',return_value=dict(os.environ)),patch.object(d.subprocess,'Popen',side_effect=tracked),concurrent.futures.ThreadPoolExecutor(2) as pool:
     results=list(pool.map(lambda _:d.ensure({'dataDirectory':str(data),'port':port},resources),range(2)))
    self.assertEqual(len(children),1);self.assertEqual(results[0]['pid'],results[1]['pid'])
    self.assertEqual(sorted(r['reused'] for r in results),[False,True]);self.assertEqual(journal.read_text(),'preserve existing evidence')
   finally:
    for child in children:child.terminate();child.wait(timeout=5)

 def test_package_copy_excludes_third_party_modules_and_bytecode(self):
  from build_firmenzentrale_mac import copy_tree
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);source=root/'source';source.mkdir()
   (source/'site-packages').mkdir();(source/'site-packages/private.py').write_text('private')
   (source/'__pycache__').mkdir();(source/'__pycache__/example.pyc').write_bytes(b'cache')
   (source/'_tkinter.cpython-312-darwin.so').write_bytes(b'unused external dependency')
   (source/'sqlite3.py').write_text('runtime')
   copy_tree(source,root/'bundle')
   self.assertEqual([p.name for p in (root/'bundle').iterdir()],['sqlite3.py'])

if __name__=='__main__':unittest.main()
