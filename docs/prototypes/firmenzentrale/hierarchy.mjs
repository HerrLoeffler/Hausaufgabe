import {childrenFor} from './focus.mjs';
const groups={
 web:[['Erstellen',['remy','emmi','formate-audio']],['Durchführen & auswerten',['pruefung','wilma','drucken']]],
 classroom:[['Schulbestand',['klassen','asv','lehrkraefte']],['Unterricht',['zuweisungen','monitoring']]],
 native:[['Apps',['lehrer-app','secure']],['Zuverlässigkeit & Veröffentlichung',['offline','web-vertrag','store']]],
 games:[['Spielwelten',['pizza','lerninsel','escape']],['Weitere Lernspiele',['mathe','reise-rallye']],['Gemeinsame Anbindung',['integration']]],
 learning:[['Lernsteuerung',['adaptiv','kapitel','kompetenzen']],['Inhalte',['medien','sprachen']],['Qualität & Erneuerung',['fundus','erneuerungen']]],
 design:[['Marke & Figuren',['marke','crew']],['Bedienung',['dashboard','tutorial','designsystem']]],
 operations:[['Plattform',['hosting','backend','gateway']],['Verlässlicher Betrieb',['release','bugops','restore']]],
 customers:[['Kontakt & Betreuung',['piloten','support','feedback']],['Wirkung messen',['analytics','evaluation']]],
 strategy:[['Ausrichtung & Angebot',['ziele','angebot','partner']],['Finanzen & Aufbau',['finanzierung','finanzen','aufbau']]],
 governance:[['Verträge & Rechte',['vertraege','anbieter','rechte']],['Daten & Sicherheit',['datenfluesse','zugriff','sicherheit']]],
 central:[['Überblick & Entscheidungen',['landkarte','entscheidungen']],['Arbeit & Wissen',['chat','wissen','eingang']]]
};
export function groupsFor(id){const children=childrenFor(id);return (groups[id]||[]).map(([title,ids])=>({title,children:ids.map(id=>children.find(c=>c.id===id)).filter(Boolean)}));}
export function summarizeWork(children){return {total:children.length,blocked:children.filter(c=>c.state==='blocker').length,review:children.filter(c=>c.state==='review').length,clarify:children.filter(c=>c.state==='clarify').length,documented:children.filter(c=>c.state==='documented').length,progress:null};}
export function taskBucket(status){return status==='completed'?'results':status==='waiting_user'?'questions':['queued','starting','running'].includes(status)?'active':'attention';}
