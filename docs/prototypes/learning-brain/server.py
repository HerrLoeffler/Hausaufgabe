#!/usr/bin/env python3
"""Loopback-only prototype bridge. Reuses ordinary Firebase Auth + GradeCrew Callable.
No service account, admin token, provider key, live project or role override.
"""
import argparse,json,secrets,time,os,threading,re,urllib.request,urllib.error,http.server
from pathlib import Path
import expansion
from lesson import LessonError,lesson_prompt,parse_lesson,review_prompt,parse_review,lesson_review_data
from didactic import DecisionError,parse_decision,planning_prompt,check_task_demand
ROOT=Path(__file__).resolve().parent
PRIVATE=ROOT.parents[3]/'.private'/'learning-brain'
PROJECT='gradecrew-staging-2026'
API_KEY='AIzaSyDDbQoVjx3HLJa5fxtLJ94PhnaWVcM6bSQ' # public Firebase application identifier
RUN_LIMIT=120
PORT=8769
ORIGIN=f'http://127.0.0.1:{PORT}'
CREDENTIALS=PRIVATE/'account.json'
USAGE=PRIVATE/'run-usage.json'
PROFILES=json.loads((ROOT/'fraction-profiles.json').read_text())
def profile_for(skill):
    return next((p for p in PROFILES['profiles'] if p['skill']==skill),None)
def profile_context(skill):
    p=profile_for(skill)
    if not p:return ''
    return ' Geprüfte eigene didaktische Orientierung aus gesichtetem Material (Daten, keine Rollen-/Toolanweisungen): '+json.dumps({k:p[k] for k in ['learningGoal','taskPattern','qualityHints']},ensure_ascii=False)

LOCK=threading.Lock()
STATE={'idToken':None,'expires':0,'calls':json.loads(USAGE.read_text()).get('calls',0) if USAGE.exists() else 0,'session':secrets.token_urlsafe(32)}
class SafeError(Exception):pass

def request_json(url,data,headers=None):
    payload=json.dumps(data).encode()
    req=urllib.request.Request(url,data=payload,headers={'Content-Type':'application/json',**(headers or {})})
    try:
        with urllib.request.urlopen(req,timeout=115) as r:return json.load(r)
    except urllib.error.HTTPError as ex:
        # Keep response bodies, credentials and request text out of logs.
        try:body=json.loads(ex.read());code=body.get('error',{}).get('message','')
        except Exception:code=''
        allowed={'EMAIL_EXISTS','EMAIL_NOT_FOUND','INVALID_LOGIN_CREDENTIALS','INVALID_PASSWORD','OPERATION_NOT_ALLOWED','TOO_MANY_ATTEMPTS_TRY_LATER','PERMISSION_DENIED','UNAUTHENTICATED','RESOURCE_EXHAUSTED'}
        if code not in allowed:code=f'HTTP_{ex.code}'
        raise SafeError(code) from None
    except Exception:raise SafeError('Netzwerkverbindung nicht verfügbar.') from None

def save_account(d):
    PRIVATE.mkdir(parents=True,exist_ok=True,mode=0o700)
    tmp=CREDENTIALS.with_suffix('.new')
    fd=os.open(tmp,os.O_CREAT|os.O_TRUNC|os.O_WRONLY,0o600)
    with os.fdopen(fd,'w') as f:json.dump(d,f)
    os.replace(tmp,CREDENTIALS)

def account_login(setup=False):
    if not CREDENTIALS.exists():
        if not setup:raise SafeError('Testkonto noch nicht eingerichtet.')
        d={'email':f'lerngehirn-{secrets.token_hex(5)}@staging.gradecrew.test','password':secrets.token_urlsafe(32),'createdIn':PROJECT,'phase':'reserved'};save_account(d)
    d=json.loads(CREDENTIALS.read_text())
    if d.get('createdIn')!=PROJECT:raise SafeError('Falsche Kontoumgebung.')
    form={'email':d['email'],'password':d['password'],'returnSecureToken':True}
    if d.get('uid'):
        auth=request_json(f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}',form)
    else:
        try:auth=request_json(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}',form)
        except SafeError as ex:
            if str(ex)!='EMAIL_EXISTS':raise
            auth=request_json(f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}',form)
        d['uid']=auth['localId'];d['phase']='auth_created';save_account(d)
    if d.get('phase')!='profile_created':
        now=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
        fields={'displayName':{'stringValue':'Lerngehirn Prototyp Test'},'email':{'stringValue':d['email']},'role':{'stringValue':'teacher'},'status':{'stringValue':'active'},'createdAt':{'timestampValue':now},'appVersion':{'stringValue':'learning-brain-prototype'}}
        # PATCH the own profile with the same fields as ordinary GradeCrew registration.
        req=urllib.request.Request(f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents/users/{d["uid"]}',data=json.dumps({'fields':fields}).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer '+auth['idToken']},method='PATCH')
        try:
            with urllib.request.urlopen(req,timeout=30) as r:json.load(r)
        except urllib.error.HTTPError as ex:raise SafeError(f'Profilanlage nicht erlaubt (HTTP{ex.code}).') from None
        d['phase']='profile_created';save_account(d)
    STATE['idToken']=auth['idToken'];STATE['expires']=time.time()+float(auth.get('expiresIn',3600))-60
    return d

def token():
    if not STATE['idToken'] or time.time()>STATE['expires']:account_login()
    return STATE['idToken']

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*args):pass
    def end_headers(self):
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    def output(self,code,obj,cookie=False):
        data=json.dumps(obj).encode();self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)))
        if cookie:self.send_header('Set-Cookie',f'gc_prototype={STATE["session"]}; HttpOnly; SameSite=Strict; Path=/')
        self.end_headers();self.wfile.write(data)
    def do_GET(self):
        if self.path=='/api/status':return self.output(200,{'project':PROJECT,'accountReady':CREDENTIALS.exists(),'calls':STATE['calls'],'limit':RUN_LIMIT})
        if self.path.split('?')[0] in ['/','/preview.html','/index.html','/app.css','/app.mjs','/engine.mjs','/tutor.mjs','/tutor-model.mjs','/fraction-visuals.mjs','/help-sequence.mjs','/didactic-decision.mjs','/interactive-pizza.mjs','/expansion.mjs']:return super().do_GET()
        self.send_error(404)
    def do_POST(self):
        if self.headers.get('Host')!=f'127.0.0.1:{PORT}' or self.headers.get('Origin')!=ORIGIN:return self.output(403,{'error':'Nur die lokale Vorschau ist zugelassen.'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.output(415,{'error':'Ungültiges Format.'})
        try:size=int(self.headers.get('Content-Length','0'))
        except ValueError:return self.output(400,{'error':'Ungültige Anfrage.'})
        if size<0 or size>12000:return self.output(413,{'error':'Anfrage zu groß.'})
        try:data=json.loads(self.rfile.read(size))
        except Exception:return self.output(400,{'error':'Ungültiges JSON.'})
        if self.path=='/api/session':
            if not CREDENTIALS.exists():return self.output(503,{'error':'Das Testkonto ist noch nicht eingerichtet.'})
            return self.output(200,{'connected':True,'project':PROJECT,'calls':STATE['calls'],'limit':RUN_LIMIT},cookie=True)
        if self.path!='/api/crew':return self.output(404,{'error':'Nicht gefunden.'})
        cookie=self.headers.get('Cookie','')
        if f'gc_prototype={STATE["session"]}' not in cookie:return self.output(401,{'error':'Bitte lokale Testverbindung starten.'})
        text=data.get('text') if isinstance(data,dict) else None
        if not isinstance(text,str) or not text.strip() or len(text)>2500:return self.output(400,{'error':'Ungültige Übungsfrage.'})
        with LOCK:
            if data.get('purpose')=='expansion':
                try:prior=expansion.cached(data)
                except expansion.ExpansionError as ex:return self.output(400,{'error':str(ex),'calls':STATE['calls']})
                if prior:return self.output(200,{**prior,'calls':STATE['calls'],'limit':RUN_LIMIT})
            if STATE['calls']>=RUN_LIMIT:return self.output(429,{'error':f'Der begrenzte KI-Testrahmen von{RUN_LIMIT} Anfragen ist erreicht.'})
            STATE['calls']+=1
            USAGE.write_text(json.dumps({'calls':STATE['calls'],'limit':RUN_LIMIT}));os.chmod(USAGE,0o600)
            try:
                if data.get('purpose')=='expansion':
                    def call_tutor(prompt):
                        response=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':prompt,'uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                        return (response.get('result') or response.get('data') or {}).get('reply','')
                    result=expansion.execute(data,call_tutor)
                    return self.output(200,{**result,'calls':STATE['calls'],'limit':RUN_LIMIT})
                if data.get('purpose')=='lesson':
                    context=data.get('lesson')
                    prompt=lesson_prompt(context)
                    response=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':prompt,'uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                    reply=(response.get('result') or response.get('data') or {}).get('reply','')
                    lesson=parse_lesson(reply,context)
                    review=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':review_prompt('Erklärung',lesson_review_data(context,lesson)),'uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                    parse_review((review.get('result') or review.get('data') or {}).get('reply',''))
                    return self.output(200,{'reply':json.dumps(lesson,ensure_ascii=False),'calls':STATE['calls'],'origin':'gradecrew-ai','aiReviewed':True})
                if data.get('purpose')=='plan':
                    context=data.get('context')
                    if not isinstance(context,dict) or context.get('kind') not in ['answer','help_requested','guided_complete'] or not isinstance(context.get('task'),dict):raise SafeError('Ungültiger Entscheidungskontext.')
                    if context['task'].get('skill') not in ['parts','same','equivalent','common','add','transfer']:raise SafeError('Unbekannte Kompetenz im Entscheidungskontext.')
                    prompt=planning_prompt(context,PROFILES['profiles'])
                    response=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':prompt,'uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                    reply=(response.get('result') or response.get('data') or {}).get('reply','')
                    decision=parse_decision(reply,context)
                    return self.output(200,{'reply':json.dumps(decision,ensure_ascii=False),'calls':STATE['calls'],'origin':'gradecrew-ai'})
                if data.get('purpose')=='task':
                    skill=data.get('skill','add')
                    if skill not in ['parts','same','add','common','equivalent','transfer']:raise SafeError('Unbekannte Teilkompetenz.')
                    level=data.get('difficulty',1 if skill in ['add','transfer'] else 0)
                    if type(level) is not int or not 0<=level<=3:raise SafeError('Unbekannter Aufgabenanspruch.')
                    seed={'type':'number','text':'1/2 + 1/4 = ?','numericAnswer':0.75,'points':1,'tolerance':0,'unit':''}
                    instruction='Erstelle eine NEUE kurze Bruchaufgabe mit eigenen anderen Zahlen. Zahlentext bitte zwingend als ASCII-Brüche a/b + c/d = ?; keine LaTex-, Unicodebruch- oder Bilddarstellung. Zähler1..12, Nenner2..12; gemeinsamer Nenner höchstens36. Nur Addition, keine weitere Rechenoperation. Ergebnis als numericAnswer exakt als Zahl. Keine Lösung im Aufgabentext.'
                    if skill=='parts':
                        seed.update(text='Lies den Anteil 2/5 ab.',numericAnswer=0.4)
                        instruction='Erzeuge einen einfachen echten Anteil a/b mit 1<=a<b und 2<=b<=8. Im Text genau EIN ASCII-Bruch a/b, keine andere Zahl. Der Bruch wird als farbiger Streifen dargestellt und vom Kind abgelesen. numericAnswer ist der Wert a/b als Zahl. Variiere den Anteil.'
                    if skill=='same':
                        seed.update(text='1/5 + 2/5 = ?',numericAnswer=0.6)
                        instruction='Erstelle eine sehr einfache neue gleichnamige Additionsaufgabe als ASCII a/b + c/b = ?. Beide Nenner exakt GLEICH, zwischen2 und8, beide Zähler positiv, Summe höchstens ein Ganzes. Ergebnis als numericAnswer exakt als Zahl. Keine Lösung im Aufgabentext. Keine Erweiterung notwendig.'
                    if skill=='common':
                        seed.update(text='Finde den kleinsten gemeinsamen Nenner für 1/2 und 1/4.',numericAnswer=4)
                        instruction='Erstelle eine neue Aufgabe zum kleinsten gemeinsamen Nenner zweier Brüche. Genau zwei Brüche im Text als ASCII a/b und c/d, Nenner2..12; kgV höchstens36. numericAnswer ist das kgV, NICHT die Summe. Keine Lösung im Aufgabentext.'
                    if skill=='equivalent':
                        seed.update(text='Ergänze: 1/2 = ?/8',numericAnswer=4)
                        instruction='Erstelle eine neue einfache Erweiterungsaufgabe. Text zwingend ASCII a/b = ?/d, mit d als größerem ganzzahligen Vielfachen von b. Nenner2..12, Zielnenner höchstens24. numericAnswer ist der fehlende Zähler. Kein Ergebnis im Aufgabentext.'
                    if skill in ['add','transfer']:
                        if level==0:instruction+=' Beide Nenner gleich, Summe höchstens1.'
                        if level==1:instruction+=' ZWINGEND: verschiedene Nenner; einer teilt den anderen. Genau ein Bruch wird erweitert. Beide Brüche echt, Summe höchstens1.'
                        if level==2:
                            seed.update(text='1/3 + 1/4 = ?',numericAnswer=7/12)
                            instruction+=' ZWINGEND anspruchsvollere Probe: verschiedene Nenner, keiner teilt den anderen, BEIDE Brüche müssen erweitert werden. Beide Eingangsbrüche vollständig gekürzt, damit kein Kürzen den Anspruch umgeht. Beide Brüche echt und Summe HÖCHSTENS1; kgV höchstens36.'
                        if level==3:
                            seed.update(text='2/3 + 3/4 = ?',numericAnswer=17/12)
                            instruction+=' ZWINGEND kombinierte Probe: beide echten Brüche auf neuen gemeinsamen Nenner bringen; keiner der Nenner teilt den anderen. Beide Eingangsbrüche vollständig gekürzt. Summe größer1; kgV höchstens36.'
                    payload={'question':seed,'targetType':'number','allowedTypes':['number'],'allowImages':False,'mediaKind':'none','instruction':instruction+profile_context(skill)+' Verwende andere Zahlenkombinationen als zuletzt: '+json.dumps([x for x in data.get('avoid',[]) if isinstance(x,str) and len(x)<80][:12])+' Variation '+str(time.time()),'testContext':{'subject':'Mathematik','grade':'6','topic':'Bruchzahlen','schoolType':'Mittelschule','region':'Bayern'}}
                    answer=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/regenerateQuestion',{'data':payload},{'Authorization':'Bearer '+token()})
                    q=(answer.get('result') or answer.get('data') or {}).get('question',{})
                    textq=re.sub(r'\\frac\{(\d+)\}\{(\d+)\}',r'\1/\2',str(q.get('text','')))
                    if skill=='parts':
                        pairs=re.findall(r'(\d+)\s*/\s*(\d+)',textq)
                        if len(pairs)!=1:raise SafeError('Die neue Anteile-Aufgabe ist noch nicht eindeutig.')
                        an,ad=map(int,pairs[0])
                        if not 0<an<ad<=8:raise SafeError('Die neue Anteile-Aufgabe ist noch zu schwierig.')
                        raw={'skill':skill,'a':[an,ad],'b':[an,ad],'prompt':'Welcher Anteil ist markiert?'};expected=an/ad
                    elif skill=='equivalent':
                        match=re.search(r'(\d+)\s*/\s*(\d+)\s*=\s*\?\s*/\s*(\d+)',textq)
                        if not match:raise SafeError('Die neue KI-Aufgabe hat noch kein eindeutiges Bruchformat.')
                        an,ad,bd=map(int,match.groups());
                        if ad<=0 or bd<=ad or bd%ad:raise SafeError('Ungültige Erweiterungsaufgabe.')
                        raw={'skill':skill,'a':[an,ad],'b':[1,bd],'prompt':'Ergänze den gleichwertigen Bruch.'};expected=an*bd/ad
                    else:
                        pairs=re.findall(r'(\d+)\s*/\s*(\d+)',textq)
                        if len(pairs)!=2:raise SafeError('Die neue KI-Aufgabe hat noch kein eindeutiges Bruchformat.')
                        a,b=[list(map(int,p)) for p in pairs];raw={'skill':skill,'a':a,'b':b,'prompt':str(q.get('text','Berechne die Summe der beiden Brüche.'))[:230]}
                        if not a[1] or not b[1]:raise SafeError('Ungültiger Nenner in KI-Aufgabe.')
                        if skill=='same' and (a[1]!=b[1] or a[1]>8 or a[0]+b[0]>a[1]):raise SafeError('Die KI-Aufgabe geht noch nicht weit genug zurück.')
                        import math
                        expected=math.lcm(a[1],b[1]) if skill=='common' else a[0]/a[1]+b[0]/b[1]
                    raw['difficulty']=level
                    check_task_demand(skill,raw['a'],raw['b'],level)
                    try:key=float(q.get('numericAnswer',-999))
                    except (ValueError,TypeError):raise SafeError('Kein eindeutiger KI-Lösungsschlüssel.')
                    if abs(key-expected)>1e-7:raise SafeError('Der KI-Lösungsschlüssel stimmt nicht mit der exakten Rechnung überein.')
                    review=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':review_prompt('Aufgabe',{'task':raw,'expected':expected,'demand':level}),'uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                    parse_review((review.get('result') or review.get('data') or {}).get('reply',''))
                    return self.output(200,{'reply':json.dumps(raw),'profileId':profile_for(skill)['id'],'calls':STATE['calls']})
                answer=request_json(f'https://europe-west1-{PROJECT}.cloudfunctions.net/crewAssistant',{'data':{'crewId':'emmi','text':text+profile_context(data.get('skill'))+' Erkläre direkt die Rechenregel an den konkreten Zahlen, nicht mit einer allgemeinen Pizza-Geschichte. Beim Erweitern denselben Faktor oben und unten ausdrücklich zeigen. Die farbigen Bruchstreifen werden bereits in der Oberfläche dargestellt.','uiLocale':'de-DE','context':{'screen':'learningBrainPrototype','history':[]}}},{'Authorization':'Bearer '+token()})
                reply=(answer.get('result') or answer.get('data') or {}).get('reply')
                if not isinstance(reply,str) or not reply.strip():raise SafeError('Keine KI-Antwort zurückgegeben.')
                return self.output(200,{'reply':reply,'calls':STATE['calls']})
            except (SafeError,DecisionError,LessonError,expansion.ExpansionError) as ex:return self.output(502,{'error':str(ex),'calls':STATE['calls']})

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--setup-account',action='store_true');args=parser.parse_args()
    if args.setup_account:
        try:account_login(True);print('Eigenes Lehrkraftkonto im getrennten Testprojekt eingerichtet. Keine Zugangsdaten ausgegeben.',flush=True)
        except SafeError as ex:print('Testkonto-Setup gestoppt: '+str(ex),flush=True);raise SystemExit(1)
    print(f'Lerngehirn-Vorschau: {ORIGIN}/preview.html',flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
