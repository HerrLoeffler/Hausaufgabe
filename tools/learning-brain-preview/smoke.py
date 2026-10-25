#!/usr/bin/env python3
"""Real, non-personal staging smoke checks. Ordinary test Auth accounts only.
Never emit credentials/tokens. Generated examples and outcome receipts are safe test evidence.
"""
import argparse,json,pathlib,uuid,time,urllib.request,urllib.error,secrets,os
import server as bridge
PROJECT=bridge.PROJECT

def raw(url,data=None,token=None,method=None):
    headers={'Content-Type':'application/json'}
    if token:headers['Authorization']='Bearer '+token
    req=urllib.request.Request(url,data=json.dumps(data).encode() if data is not None else None,headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=125) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as e:
        try:d=json.load(e)
        except Exception:d={}
        return e.code,d

def call(method,data,token=None):
    status,body=raw(f'https://europe-west1-{PROJECT}.cloudfunctions.net/{method}',{'data':data},token or bridge.token())
    if status!=200:raise RuntimeError(f'{method}: HTTP{status} '+str({k:body.get('error',{}).get(k) for k in ['status','message','details']}))
    return body.get('result',body.get('data'))

def entries():
    catalog=call('learningBrainCatalog',{});results=json.loads(ARGS.output.read_text()) if ARGS.output.exists() else []
    for grade in range(5,11):
        for subject in ['math','german']:
            if any(r['grade']==grade and r['subject']==subject for r in results):continue
            topic=next(t for t in catalog['topics'] if t['grade']==grade and t['subject']==subject and t['track']==('M' if grade==10 else 'R') and t['modality']=='text')
            result=call('learningBrainStart',{'topicId':topic['id'],'minutes':20,'eventId':str(uuid.uuid4())})
            assert result['phase']=='practice' and result['task']['prompt'] and not result['explanation']
            assert not any(k in result['task'] for k in ['answer','rubric','acceptedAnswers'])
            receipt={'grade':grade,'subject':subject,'topicId':topic['id'],'title':topic['title'],'prompt':result['task']['prompt'],'hasContext':bool(result['task'].get('contextText')),'result':'generated-and-second-AI-reviewed'}
            results.append(receipt);print(json.dumps(receipt,ensure_ascii=False),flush=True)
            call('learningBrainTurn',{'sessionId':result['id'],'revision':result['revision'],'eventId':str(uuid.uuid4()),'action':'finish'})
            ARGS.output.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    call('learningBrainProfile',{'grade':6,'track':'R'})

def isolation():
    accountA=json.loads(ARGS.credentials.read_text());fileB=ARGS.credentials.with_name('isolation-account.json')
    if fileB.exists():
        b=json.loads(fileB.read_text());status,auth=raw(f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={bridge.API_KEY}',{'email':b['email'],'password':b['password'],'returnSecureToken':True})
    else:
        b={'email':'learning-isolation-'+secrets.token_hex(6)+'@staging.gradecrew.test','password':secrets.token_urlsafe(32),'createdIn':PROJECT}
        status,auth=raw(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={bridge.API_KEY}',{'email':b['email'],'password':b['password'],'returnSecureToken':True})
        if status==200:
            b['uid']=auth['localId'];fd=os.open(fileB,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
            with os.fdopen(fd,'w') as f:json.dump(b,f)
    assert status==200 and auth.get('localId')==b['uid'] and b['createdIn']==PROJECT
    tokenB=auth['idToken'];uidA=accountA['uid']
    # Normal own teacher-test profile, same contract as existing registration; no admin/role override.
    profileUrl=f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents/users/{b["uid"]}'
    status,_=raw(profileUrl,None,tokenB)
    if status==404:
        fields={'displayName':{'stringValue':'Lerngehirn Isolationstest'},'email':{'stringValue':b['email']},'role':{'stringValue':'teacher'},'status':{'stringValue':'active'}}
        status,_=raw(profileUrl,{'fields':fields},tokenB,'PATCH')
        assert status==200
    profileA=call('learningBrainProfile',{});profileB=call('learningBrainProfile',{},tokenB)
    assert profileA['learner']['id']!=profileB['learner']['id'] and profileB['skills']==[]
    session=json.loads(ARGS.session.read_text())
    status,body=raw(f'https://europe-west1-{PROJECT}.cloudfunctions.net/learningBrainTurn',{'data':{'sessionId':session['id'],'revision':session['revision'],'eventId':str(uuid.uuid4()),'action':'answer','answer':'2'}},tokenB)
    assert status==404 and body['error']['status']=='NOT_FOUND'
    outcomes={'separateAuthenticatedProfiles':True,'foreignSessionDenied':True}
    for label,token in [('ownPrivateDirectReadDenied',bridge.token()),('foreignPrivateDirectReadDenied',tokenB)]:
        status,_=raw(f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents/users/{uidA}/aiRuntime/learningBrain',None,token)
        assert status==403;outcomes[label]=True
    status,body=raw(f'https://europe-west1-{PROJECT}.cloudfunctions.net/learningBrainProfile',{'data':{'uid':uidA}},tokenB)
    assert status==400;outcomes['clientOwnerOverrideDenied']=True
    status,_=raw(f'https://europe-west1-{PROJECT}.cloudfunctions.net/learningBrainProfile',{'data':{}})
    assert status==401;outcomes['unauthenticatedDenied']=True
    ARGS.output.write_text(json.dumps(outcomes,indent=2)+'\n');print(json.dumps(outcomes),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('scenario',choices=['entries','isolation']);parser.add_argument('--credentials',type=pathlib.Path,required=True);parser.add_argument('--output',type=pathlib.Path,required=True);parser.add_argument('--session',type=pathlib.Path,default=pathlib.Path('/private/tmp/gc-learning-expansion-session.json'));ARGS=parser.parse_args();bridge.ARGS=ARGS
    {'entries':entries,'isolation':isolation}[ARGS.scenario]()
