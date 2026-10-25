import {areaStatus} from './company-status.mjs';
import {domains} from './portfolio.mjs';
const layout={
 strategy:[190,125,'Firma & Finanzierung'],governance:[580,75,'Recht & Datenschutz'],
 customers:[965,130,'Kunden & Piloten'],design:[100,350,'Marke & Crew'],
 central:[575,365,'Firmenzentrale'],classroom:[1035,365,'Klassen & ASV'],
 operations:[150,590,'Technik & Betrieb'],learning:[985,610,'Lernen & Aufgaben'],
 games:[750,730,'Games & Lernwelten'],web:[535,650,'Web · Remy · Wilma'],
 native:[385,800,'iPhone · iPad · Secure']
};
const blockers={

 learning:{status:'Engpass gemeldet',title:'Lernpilot wieder betriebsfähig machen',problem:'Der adaptive Fachchat meldet Serverfehler in der isolierten Vorschau. Die Wiederverwendung des Aufgabenfundus ist noch nicht abschließend geprüft.',next:'Dienststart reparieren und den Lernpfad einschließlich Fundus-Wiederverwendung erneut prüfen.',source:'GC · Adaptives Lernen – Konzept & Realisierung · Bericht23.10.2026'},
 central:{status:'Ausführungsprofil begrenzt',title:'Codearbeit gesondert qualifizieren',problem:'Eingabe, Chatbearbeitung, Rückfrage und Bericht funktionieren lokal. Das geprüfte Profil verändert keine Produktdateien. Ein ausführendes Codeprofil fehlt.',next:'Analyseprofil abnehmen; Codearbeit mit isoliertem Checkout, Umfang und Reviewgates qualifizieren.',source:'GC-BRAIN-01 · echter Diagnoseauftrag25.10.2026'}
};
const stages={web:'Web-Kern dokumentiert',native:'Store-Abnahme offen',games:'Spielbare Prototypen',design:'Markenquelle vorhanden',operations:'Releases dokumentiert',customers:'Analytics-Kandidat offen',strategy:'Konzept & Gespräche',governance:'Klärungen offen'};
export const nodes=domains.map(d=>({...d,x:layout[d.id][0],y:layout[d.id][1],label:layout[d.id][2],status:blockers[d.id]?.status||areaStatus[d.id].status,blocker:blockers[d.id]||null,built:areaStatus[d.id].built,next:[areaStatus[d.id].next]}));
// Relations are explicit editorial projections with bounded scopes. They do not
// propagate whole-product red/green status or represent measured live traffic.
export const connections=[
 {id:'classroom-native',from:'classroom',to:'native',kind:'requires',scope:'Secure-Geräteabnahme',reason:'Classroom ist auf2026 testbereit; Secure1221 wurde hochgeladen. Apple-Verarbeitung und vollständiger Ablauf auf echtem iPad sind noch zu prüfen.',source:'GC-CLASSROOM-01 · Fachabgleich25.10.2026 / Uploadlauf40186256526'},
 {id:'learning-web',from:'learning',to:'web',kind:'blocker',scope:'Freigabe des adaptiven Lernpiloten',reason:'Die gestörte isolierte Lernvorschau verhindert den aktuellen Nachweis der Lernpfade und des Fundus. Die bestehende normale Web-Testerstellung ist damit nicht pauschal blockiert.',source:'GC-ADAPTIVE-PRACTICE-01 · Fachbericht23.10.2026'},
 {id:'central-operations',from:'central',to:'operations',kind:'blocker',scope:'Automatische Code-Aufträge',reason:'Der lokale Chatweg liefert bereits Analysen und Berichte. Automatische Produktcodearbeit braucht zusätzlich ein qualifiziertes Schreib-/Reviewprofil; sie ist noch nicht freigegeben.',source:'GC-BRAIN-01 · Analyseprofil25.10.2026'},
 {id:'operations-classroom',from:'operations',to:'classroom',kind:'requires',scope:'2026-Testabnahme',reason:'Der frühere Startfehler ist laut aktuellem Fachbericht behoben. Der nächste Nachweis ist die durchgängige persönliche Zuweisung bis zur quittierten iPad-Abgabe.',source:'GC-CLASSROOM-01 · Fachabgleich25.10.2026'},
 {id:'operations-learning',from:'operations',to:'learning',kind:'requires',scope:'Isolierter Lernserver',reason:'Für die erneute Pilotprüfung muss der Lernserver erreichbar sein. Eine neue Produktfreigabe folgt daraus noch nicht.',source:'GC-ADAPTIVE-PRACTICE-01 · Fachbericht23.10.2026'},
 {id:'learning-games',from:'learning',to:'games',kind:'requires',scope:'Geprüfte Aufgaben für Lernspiele',reason:'Der geplante Unterrichtseinsatz der Spiele braucht fachlich geeignete Aufgaben und eine begrenzte Abnahme je Spiel. Keine aktuelle pauschale Blockade aller Prototypen behauptet.',source:'Portfolio Games/Lernen · Synthese23.10.2026'},
 {id:'web-classroom',from:'web',to:'classroom',kind:'flow',scope:'Test → Klasse → Schüler',reason:'Erstellte Prüfungen sollen über Klassen und persönliche Schülerzugänge zugewiesen werden.',source:'GC-CLASSROOM-01 · Konzept und Aufgabenakte'},
 {id:'native-web',from:'native',to:'web',kind:'flow',scope:'Abgabe → Ergebnisse & Bewertung',reason:'Der Secure-Prüfungsclient und die Lehrkraftauswertung müssen denselben Prüfungs-/Ergebnisvertrag erfüllen. Offlineabgabe und spätere Synchronisation werden separat abgenommen.',source:'Native/Classroom-Portfolio · Synthese23.10.2026'},
 {id:'customers-web',from:'customers',to:'web',kind:'flow',scope:'Lehrkräftefeedback → Produktarbeit',reason:'Rückmeldungen aus Piloten und Support liefern Anforderungen und Qualitätsfälle für die Produktarbeit. Diese Ansicht ruft keine privaten Rückmeldungen ab.',source:'Feedback/BugOps und Analytics-Register ·23.10.2026'},
 {id:'web-customers',from:'web',to:'customers',kind:'flow',scope:'Freigegebene Funktionen → Pilotbetrieb',reason:'Schulen benötigen einen konkret freigegebenen Produktumfang und Onboarding. Ein Codekandidat ersetzt keine Pilotabnahme.',source:'Kunden/Web-Portfolio · Synthese23.10.2026'},
 {id:'governance-customers',from:'governance',to:'customers',kind:'requires',scope:'Datenwege und Vereinbarungen für Schulen',reason:'Für konkrete Schuleinsätze müssen Zweck, Datenwege und zuständige vertragliche Klärungen passen. Rechtsfreigaben sind hier noch nicht nachgewiesen.',source:'Assurance-/Datenschutz-Register ·23.10.2026'},
 {id:'governance-native',from:'governance',to:'native',kind:'requires',scope:'Store- und Datenschutzanforderungen',reason:'Öffentliche App-Veröffentlichung und Schulbetrieb benötigen die jeweils zutreffenden Apple-/Datenschutzangaben. Der aktuelle Einzelfall ist gesondert zu prüfen.',source:'GC · iPhone & iPad / Governance-Portfolio ·23.10.2026'},
 {id:'strategy-customers',from:'strategy',to:'customers',kind:'flow',scope:'Angebot und Pilotumfang',reason:'Geschäftsmodell, Pilotangebot und Verantwortlichkeiten bestimmen den konkreten Kundeneinsatz.',source:'Investment-/Kunden-Portfolio · Synthese23.10.2026'},
 {id:'customers-strategy',from:'customers',to:'strategy',kind:'flow',scope:'Nutzungserkenntnisse → Entscheidungen',reason:'Belegte Pilot- und Nutzungsergebnisse sollen Unternehmensentscheidungen informieren. Eine Wirksamkeit oder ein Umsatz wird hier nicht vorausgesetzt.',source:'Analytics-/Investment-Portfolio · Synthese23.10.2026'},
 {id:'design-web',from:'design',to:'web',kind:'relation',scope:'Gemeinsame Bedien- und Markenverträge',reason:'Web, Crew und Tutorial verwenden die gemeinsame Marke und müssen auf Zielgeräten verständlich bedienbar sein.',source:'GradeCrew BRAND_CORE / Design-Register'},
 {id:'design-games',from:'design',to:'games',kind:'relation',scope:'Marke und Interaktionsqualität',reason:'Games behalten die gemeinsame GradeCrew-Marke; konkrete Spielinteraktionen und Geräteabnahmen bleiben eigenständig.',source:'GradeCrew BRAND_CORE / Games-Portfolio'},
 {id:'design-native',from:'design',to:'native',kind:'relation',scope:'Gemeinsame Marke auf Apple-Geräten',reason:'Die Markenfamilie und das Designsystem verbinden die App-Oberflächen; Secure kann eine explizite Variante benötigen.',source:'GradeCrew BRAND_CORE'},
 {id:'strategy-central',from:'strategy',to:'central',kind:'relation',scope:'Ziele, Prioritäten und Entscheidungen',reason:'Die Zentrale soll vereinbarte Unternehmensziele in nachvollziehbare Arbeit übersetzen. Die aktuelle Projektpriorisierung ist noch zu bestätigen.',source:'GC-BRAIN-01 · Masterplan und Portfolio'},
 {id:'governance-central',from:'governance',to:'central',kind:'relation',scope:'Rechte und erlaubte Aktionen',reason:'Künftige Aufträge und Eingangskanäle benötigen passende Rollen, Zugriff und Freigaben.',source:'GC-BRAIN-01 · Masterplan'},
 {id:'central-design',from:'central',to:'design',kind:'relation',scope:'UX-Review der Zentrale',reason:'Diese Netzansicht benötigt noch eine unabhängige Gestaltungs- und Bedienabnahme.',source:'GC-BRAIN-01 · Humanauftrag23.10.2026'},
 {id:'web-games',from:'web',to:'games',kind:'flow',scope:'Eigene Tests als Spielinhalt',reason:'Test-Rallye, Wissensreise und weitere Spielvorhaben verwenden eigene Tests als Inhaltsquelle; pro Spiel sind unterschiedliche Integrationsstände dokumentiert.',source:'Games-PRs236/238/240 und Portfolio'}
];
export function affectedBy(id){return connections.filter(e=>e.from===id&&e.kind==='blocker');}
export function clampZoom(value){return Math.min(1.8,Math.max(0.6,Number.isFinite(value)?value:1));}
export function matchNodes(query){const q=query.trim().toLocaleLowerCase('de');return nodes.filter(n=>JSON.stringify([n.label,n.name,n.pieces,n.blocker]).toLocaleLowerCase('de').includes(q));}
export function edgesFor(id){return connections.filter(e=>e.from===id||e.to===id);}
