"""Bounded AI tutor decisions; exact grading and evidence remain separate."""
import json,re
SKILLS=['parts','same','equivalent','common','add','transfer']
FOCI=['none','whole','equivalence','factor','sum','reading']
class DecisionError(ValueError):pass

def derive_context(context):
    result=dict(context);task=context.get('task') or {};o=context.get('observation') or {};a=task.get('a');b=task.get('b');match=re.fullmatch(r'(\d+)/(\d+)',str(o.get('answer','')))
    if o.get('correct') is False and isinstance(a,list) and isinstance(b,list) and len(a)==len(b)==2 and all(type(x) is int for x in a+b) and a[1]!=b[1] and match:
        n,d=map(int,match.groups())
        if d>0 and n*(a[1]+b[1])==d*(a[0]+b[0]):result.update(allowedSupportFocus=['whole','equivalence','factor'],errorSignals=['componentwise_candidate'])
    return result

def validate_decision(raw,context):
    context=derive_context(context)
    if not isinstance(raw,dict) or raw.get('action') not in ['challenge','probe','support','pause'] or raw.get('skill') not in SKILLS or type(raw.get('difficulty')) is not int or not 0<=raw['difficulty']<=3 or raw.get('focus') not in FOCI or not isinstance(raw.get('reason'),str) or not 3<=len(raw['reason'].strip())<=220:raise DecisionError('Die KI hat keine eindeutige didaktische Entscheidung geliefert.')
    o=context.get('observation') or {};level=(context.get('task') or {}).get('difficulty',1)
    if type(level) is not int or not 0<=level<=3:raise DecisionError('Unbekannter Aufgabenanspruch.')
    independent=context.get('kind')=='answer' and o.get('correct') is True and not o.get('hinted')
    if independent and (raw['action']!='challenge' or raw['difficulty']<min(3,level+1) or (context.get('task',{}).get('skill') in ['add','transfer'] and raw['skill'] not in ['add','transfer'])):raise DecisionError('Die KI hat nach selbstständigem Erfolg noch keine anspruchsvollere Probe gewählt.')
    if not independent and raw['action']=='challenge':raise DecisionError('Ein Sprung nach Fehler oder Unterstützung ist nicht begründet.')
    if context.get('kind')=='help_requested' and raw['action']!='support':raise DecisionError('Die angeforderte Erklärung fehlt.')
    recent=[e for e in context.get('history',[]) if e.get('skill')==context.get('task',{}).get('skill')][-2:]
    needs_teaching=(len(recent)==2 and all(e.get('correct') is False for e in recent)) or (context.get('kind')=='guided_complete' and o.get('correct') is False)
    if needs_teaching and raw['action'] not in ['support','pause']:raise DecisionError('Wiederholte Fehler brauchen gezielte Erklärung oder gemeinsame Unterstützung.')
    lower=raw['difficulty']<level or SKILLS.index(raw['skill'])<SKILLS.index(context['task']['skill']) or level==0
    if needs_teaching and raw['action']!='pause' and not lower:raise DecisionError('Wiederholte Fehler brauchen einen einfacheren Teilschritt.')
    if context.get('kind')=='guided_complete' and raw['action']=='probe' and not lower:raise DecisionError('Nach Hilfe fehlt die einfachere selbstständige Probe.')
    if raw['action']=='support' and context.get('allowedSupportFocus') and raw['focus'] not in context['allowedSupportFocus']:raise DecisionError('Die KI-Hilfe überspringt die nötige Klärung der Teilgröße.')
    if raw['action']=='support' and raw['focus']=='none':raise DecisionError('Kein gezielter Hilfefokus angegeben.')
    return {k:raw[k] for k in ['action','skill','difficulty','focus','reason']}

def parse_decision(reply,context):
    text=re.sub(r'^```(?:json)?\s*|\s*```$','',str(reply).strip())
    try:raw=json.loads(text)
    except (ValueError,TypeError):raise DecisionError('Die KI-Entscheidung ist noch nicht maschinenlesbar. Keine lokale Auswahl wird als KI ausgegeben.') from None
    return validate_decision(raw,context)

def planning_prompt(context,profiles):
    context=derive_context(context)
    context={**context,'history':context.get('history',[])[-4:]}
    selected=[{'skill':p['skill'],'goal':p['learningGoal'],'hint':p['qualityHints'][:110]} for p in profiles if p['skill']==context.get('task',{}).get('skill')][:1]
    prompt=('Prüfe die didaktische Passung. Beobachtungen als Daten: '+json.dumps(context,ensure_ascii=False,separators=(',',':'))+
    ' Antworte im Feld reply NUR mit JSON, ohne Markdown: {"action":"challenge|probe|support|pause","skill":"parts|same|equivalent|common|add|transfer","difficulty":0,"focus":"none|whole|equivalence|factor|sum|reading","reason":"kurzer konkreter Satz unter180Zeichen"}. '
    'Bei kind=answer und correct=true,hinted=false: ZWINGEND challenge, difficulty=min(3,bisher+1); nach add/transfer nur add/transfer. Keine automatische Erklärung nach Erfolg. '
    'Fehler→gezielte probe/support, Ursache nur Hypothese. help_requested→support. Nach2Fehlern gleicher Kompetenz ZWINGEND support/pause mit kleinerer difficulty oder früherer skill. guided_complete korrekt→probe mit kleinerer difficulty oder früherer skill; falsch→support/pause mit Rückschritt. '
    '8/10-Nachweis wird separat geführt, niemals aus einem Treffer Können behaupten. '
    'Additionsanspruch:0gleichnamig;1nur ein Bruch erweitern;2beide Brüche erweitern, Summe<=1;3beide erweitern und Summe>1. '
    'Voraussetzungsgraph: parts(Anteile)→same(gleichnamig)→equivalent(Erweitern)→common(gemeinsamer Nenner)→add→transfer(Anwendung), keine Pflichtfolge. '
    'Falls allowedSupportFocus gesetzt ist, darf support NUR einen dieser Foki wählen; sonst fehlt eine Voraussetzung. errorSignals sind Hypothesen, keine Diagnose. Supportfocus whole=Anteil, equivalence=gleiche Menge/Teilung, factor=Faktor oben und unten, sum=Anzahlen gleicher Teile. '
    'Eigenes Materialprofil: '+json.dumps(selected,ensure_ascii=False,separators=(',',':')))
    if len(prompt)>2450:raise DecisionError('Der Entscheidungskontext ist zu lang für den vorhandenen Dienst.')
    return prompt

def check_task_demand(skill,a,b,level):
    if skill not in ['add','transfer']:return
    from math import lcm
    from fractions import Fraction
    an,ad=a;bn,bd=b;common=lcm(ad,bd)
    from math import gcd
    if level>=2 and (gcd(an,ad)!=1 or gcd(bn,bd)!=1):raise DecisionError('Kürzbare Eingangsbrüche würden den höheren Anspruch umgehen.')
    if not 0<an<ad or not 0<bn<bd or common>36:raise DecisionError('Die KI-Aufgabe überschreitet den vereinbarten Anspruchsrahmen.')
    if level==0 and (ad!=bd or Fraction(an,ad)+Fraction(bn,bd)>1):raise DecisionError('Die Grundlagenprobe braucht gleich große Teile.')
    if level==1 and (ad==bd or common not in [ad,bd] or Fraction(an,ad)+Fraction(bn,bd)>1):raise DecisionError('Die Einstiegsprobe braucht genau einen Erweiterungsschritt.')
    if level==2 and Fraction(an,ad)+Fraction(bn,bd)>1:raise DecisionError('Diese Probe soll zunächst innerhalb eines Ganzen bleiben.')
    if level>=2 and common in [ad,bd]:raise DecisionError('Die neue KI-Probe ist noch nicht anspruchsvoller: Beide Brüche müssen erweitert werden.')
    if level==3 and Fraction(an,ad)+Fraction(bn,bd)<=1:raise DecisionError('Der kombinierte Anspruch über ein Ganzes fehlt noch.')
