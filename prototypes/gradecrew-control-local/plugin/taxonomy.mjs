export function classify(task){
 const s=(task.id+' '+task.title).toLowerCase();
 let functionName=task.area??'Noch zuordnen';
 if(/i18n|international|übersetz/.test(s))functionName='Internationalisierung';
 else if(/audio|sprach|voice|hörauf/.test(s))functionName='Audio & Sprache';
 else if(/classroom|schüler|klassen|asv/.test(s))functionName='Schüler, Klassen & ASV';
 else if(/analytics|telemetry|posthog|statistik/.test(s))functionName='Statistik & Nutzung';
 else if(/games|escape|spiel/.test(s))functionName='Games';
 else if(/tutorial|hilfe/.test(s))functionName='Tutorial & Hilfe';
 else if(/design|crew-asset|startscreen/.test(s))functionName='Design & Navigation';
 else if(/remy|coco|emmi|wilma|assistant/.test(s))functionName='Crew & KI-Assistenten';
 else if(/account|login|rollen|rights/.test(s))functionName='Konten & Rollen';
 else if(task.area==='Kernfunktionen')functionName='Prüfungen & Bewertung';
 const applications=[];
 if(/ios|ipad|iphone|swift/.test(s))applications.push('iPhone & iPad');
 if(/web|hosting|browser/.test(s))applications.push('Web');
 if(!applications.length)applications.push('Übergreifend / offen');
 let responsibility='Produktentwicklung';
 if(/security|rules|datenschutz|rechte|account|roles/.test(s))responsibility='Rechte & Datenschutz';
 else if(/automation|guardian|deploy|release|integration|backup|restore/.test(s))responsibility='Betrieb & Veröffentlichung';
 else if(/brain|planning|plugins|handoff|strategie/.test(s))responsibility='Wissen & Planung';
 else if(/bugops|qa|audit/.test(s))responsibility='Qualität & Rückmeldungen';
 return {...task,functionName,applications,responsibility,classificationSource:'Vorgeschlagene Zuordnung aus Aufgaben-ID und Titel'};
}
