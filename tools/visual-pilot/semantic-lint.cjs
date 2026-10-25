'use strict';
function scan(question){const t=JSON.parse(question.visualTask),text=t.prompt+' '+(t.hint||''),risks=[];
if(['table','correction'].includes(t.format)&&t.spec.answerMode==='text'&&/\b(formuliere|begründe|erkläre|in eigenen Worten|write (?:a|your|an) |explain|justify)\b/i.test(text))risks.push('open_prose_exact_grader');
if(t.format==='chart'&&/Linien(diagramm|graph)|line graph/i.test(text))risks.push('line_chart_bar_renderer');
if(t.format==='correction'&&/Großschreibung|Kleinschreibung|capitalization/i.test(text)&&t.spec.caseSensitive!==true)risks.push('case_goal_casefolded');
if(t.format==='connections'&&t.spec.nodes.some(n=>n.label.length>65))risks.push('long_connection_label_visual_check');
return risks;}
module.exports={scan};
