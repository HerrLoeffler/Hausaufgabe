// Additive navigation only: authentication, quiz data and mutations stay in app.js.
import './i18n.mjs';

export function installAccountWorkspace({document:doc=globalThis.document,port}) {
  const main=doc.getElementById('mainContent');
  if(!main||!port)return null;
  const make=(tag,text,attributes={})=>{
    const el=doc.createElement(tag);
    if(text!==undefined)el.textContent=text;
    for(const [key,value]of Object.entries(attributes))el.setAttribute(key,value);
    return el;
  };
  const button=(text,action,attributes={})=>{
    const el=make('button',text,{type:'button',class:'button ghost',...attributes});
    el.addEventListener('click',action);return el;
  };
  const nav=make('nav',undefined,{id:'accountWorkspaceNav',class:'classroomNav hidden','aria-label':'Arbeitsbereich'});
  nav.append(make('span','Mein Arbeitsbereich',{class:'classroomNavLabel'}));
  let active='tests',selectedClass='',accountId=null;
  const classes=make('section',undefined,{id:'accountClassesView',class:'view hidden',tabindex:'-1'});
  const pupils=make('section',undefined,{id:'accountPupilsView',class:'view hidden',tabindex:'-1'});
  for(const view of [classes,pupils]){main.append(view);port.registerView(view.id);}
  function open(page){
    if(!port.getSession())return;
    active=page;selectedClass='';
    if(page==='tests')port.showTests();
    else{render();port.showView(page==='classes'?classes.id:pupils.id);}
    refresh();
  }
  for(const [key,label]of [['tests','Meine Tests'],['classes','Klassen'],['pupils','Schüler:innen']])nav.append(button(label,()=>open(key),{'data-account-nav':key}));
  main.prepend(nav);
  function heading(view,title,copy){
    const head=make('div',undefined,{class:'pageHead'}),body=make('div');
    body.append(make('h1',title),make('p',copy));head.append(body);view.append(head);
  }
  function render(){
    classes.replaceChildren();pupils.replaceChildren();
    if(!port.getSession())return;
    const tests=port.listTests();
    heading(classes,'Klassen','Deine vorhandenen Tests, nach ihren gespeicherten Klassenangaben geordnet.');
    const groupNames=[...new Set(tests.map(q=>String(q.grade||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de',{numeric:true}));
    if(selectedClass){
      classes.append(button('Alle Klassen',()=>{selectedClass='';render();}));
      const box=make('section',undefined,{class:'card classroomSection'});
      box.append(make('h2',`Klasse ${selectedClass}`));
      for(const q of tests.filter(q=>String(q.grade||'').trim()===selectedClass)){
        const row=make('div',undefined,{class:'classroomRow'});
        row.append(make('span',`${q.title||'Unbenannter Test'} · ${q.subject||'Ohne Fach'}`),button('Bearbeiten',()=>port.openQuiz(q.id),{'data-account-edit':q.id}),button('Ergebnisse',()=>port.openResults(q.id)));
        box.append(row);
      }
      classes.append(box);
    }else if(groupNames.length){
      const grid=make('div',undefined,{class:'classroomGrid'});
      for(const name of groupNames){
        const own=tests.filter(q=>String(q.grade||'').trim()===name),card=make('article',undefined,{class:'card classroomClassCard'});
        card.append(make('h2',name),make('p',`${own.length} ${own.length===1?'Test':'Tests'}`),make('p',[...new Set(own.map(q=>q.subject).filter(Boolean))].join(' · ')),button('Klasse öffnen',()=>{selectedClass=name;render();},{'data-account-class':name}));
        grid.append(card);
      }
      classes.append(grid);
    }else{
      const empty=make('section',undefined,{class:'card empty'});
      empty.append(make('h2','Noch keine Klassenangaben'),make('p','Wenn du in deinen Tests eine Klasse oder Klassenstufe hinterlegst, erscheinen die Tests hier gemeinsam.'),button('Zu meinen Tests',()=>open('tests')));
      classes.append(empty);
    }
    classes.append(make('p','Diese Ansicht verwendet deine Testangaben. Ein gemeinsamer schulischer Klassenbestand mit Mitgliedschaften wird zusätzlich angebunden.',{class:'hint'}));
    heading(pupils,'Schüler:innen','Der zusätzliche Bereich für Klassenmitglieder und persönliche Schülerzugänge.');
    const empty=make('section',undefined,{class:'card empty'});
    empty.append(make('h2','Noch kein Schülerbestand verknüpft'),make('p','Die dauerhafte Schüler- und ASV-Anbindung ist für diesen Account noch nicht eingerichtet. Deine vorhandenen Tests und Auswertungen bleiben über „Meine Tests“ erreichbar.'),button('Zu meinen Tests',()=>open('tests')));
    pupils.append(empty);
  }
  function refresh(){
    const session=port.getSession(),uid=session?.uid||null;
    if(uid!==accountId){accountId=uid;selectedClass='';active='tests';render();}
    const visible=port.currentView();
    if(visible==='dashboardView')active='tests';
    const show=Boolean(uid)&&visible!=='authView';
    nav.classList.toggle('hidden',!show);doc.body.classList.toggle('classroomSignedIn',show);
    nav.querySelectorAll('[data-account-nav]').forEach(b=>b.setAttribute('aria-current',b.dataset.accountNav===active?'page':'false'));
    if(uid&&(visible===classes.id||visible===pupils.id))render();
  }
  const unsubscribe=port.subscribe(refresh);refresh();
  return {destroy(){unsubscribe();nav.remove();classes.remove();pupils.remove();doc.body.classList.remove('classroomSignedIn');}};
}
