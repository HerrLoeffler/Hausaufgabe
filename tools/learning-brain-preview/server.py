#!/usr/bin/env python3
"""Loopback bridge to the SAME staging callable backend as the hosted learner UI.
Ordinary own test account only; credentials and provider keys never reach the client.
"""
import argparse,http.server,json,secrets,time,urllib.request,urllib.error,threading
from pathlib import Path
from http.cookies import SimpleCookie
PROJECT='gradecrew-staging-2026'
API_KEY='AIzaSyDDbQoVjx3HLJa5fxtLJ94PhnaWVcM6bSQ'
METHODS={'learningBrainCatalog','learningBrainProfile','learningBrainStart','learningBrainTurn'}
STATE={'token':None,'expires':0,'cookie':secrets.token_urlsafe(32)}
LOCK=threading.Lock()

def request_json(url,data,headers=None):
    req=urllib.request.Request(url,data=json.dumps(data).encode(),headers={'Content-Type':'application/json',**(headers or {})})
    try:
        with urllib.request.urlopen(req,timeout=125) as response:return json.load(response)
    except urllib.error.HTTPError as error:
        try:body=json.load(error)
        except Exception:body={}
        code=body.get('error',{}).get('status','UNAVAILABLE')
        allowed={'UNAUTHENTICATED','PERMISSION_DENIED','ABORTED','INVALID_ARGUMENT','FAILED_PRECONDITION','UNAVAILABLE','RESOURCE_EXHAUSTED','NOT_FOUND','ALREADY_EXISTS'}
        raise RuntimeError(code if code in allowed else 'UNAVAILABLE') from None

def token():
    with LOCK:
        if not STATE['token'] or time.time()>STATE['expires']:
            account=json.loads(ARGS.credentials.read_text())
            if account.get('createdIn')!=PROJECT or not account.get('uid'):raise RuntimeError('UNAUTHENTICATED')
            auth=request_json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+API_KEY,{'email':account['email'],'password':account['password'],'returnSecureToken':True})
            if auth.get('localId')!=account['uid']:raise RuntimeError('UNAUTHENTICATED')
            STATE.update(token=auth['idToken'],expires=time.time()+int(auth.get('expiresIn',3600))-90,uid=auth['localId'])
        return STATE['token']

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ARGS.root),**kw)
    def log_message(self,*args):pass
    def end_headers(self):
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    def output(self,status,body,cookie=False):
        data=json.dumps(body).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)))
        if cookie:self.send_header('Set-Cookie',f'gc_learning={STATE["cookie"]}; HttpOnly; SameSite=Strict; Path=/')
        self.end_headers();self.wfile.write(data)
    def do_GET(self):
        path=self.path.split('?')[0]
        if path=='/':self.send_response(302);self.send_header('Location','/lerngehirn/');self.end_headers();return
        allowed={'/lerngehirn/','/lerngehirn/index.html','/lerngehirn/app.mjs','/lerngehirn/api.mjs','/lerngehirn/model.mjs','/lerngehirn/brain.mjs','/lerngehirn/styles.css','/firebase-config.js','/shared/math-display.mjs'}
        if path not in allowed:self.send_error(404);return
        super().do_GET()
    def do_POST(self):
        if self.headers.get('Host')!=f'127.0.0.1:{ARGS.port}' or self.headers.get('Origin')!=f'http://127.0.0.1:{ARGS.port}':return self.output(403,{'error':{'code':'permission-denied'}})
        size=int(self.headers.get('Content-Length','0'))
        if size>12000:return self.output(413,{'error':{'code':'invalid-argument'}})
        try:
            data=json.loads(self.rfile.read(size) or b'{}')
            if self.path=='/api/session':
                token();return self.output(200,{'authenticated':True,'user':{'uid':STATE['uid']},'mode':'test'},cookie=True)
            cookie=SimpleCookie(self.headers.get('Cookie',''))
            if self.path!='/api/learning' or cookie.get('gc_learning') is None or not secrets.compare_digest(cookie['gc_learning'].value,STATE['cookie']):return self.output(403,{'error':{'code':'unauthenticated'}})
            method=data.get('method')
            if method not in METHODS:return self.output(400,{'error':{'code':'invalid-argument'}})
            result=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/{method}',{'data':data.get('data',{})},{'Authorization':'Bearer '+token()})
            self.output(200,{'data':result.get('result',result.get('data'))})
        except Exception as error:
            code=str(error).lower().replace('_','-') if isinstance(error,RuntimeError) else 'unavailable'
            self.output(503,{'error':{'code':code}})

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--credentials',type=Path,required=True);parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]);parser.add_argument('--port',type=int,default=8773);ARGS=parser.parse_args()
    print(f'Lerngehirn-Testvorschau: http://127.0.0.1:{ARGS.port}/lerngehirn/',flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1',ARGS.port),Handler).serve_forever()
