import {suggestNamedMapping} from './named-import.mjs';
const normal=v=>String(v).trim().toLocaleLowerCase('de').replace(/[\s_.-]/g,'');
export function suggestTeacherMapping(headers){
 const result={...suggestNamedMapping(headers),shortCode:'',subject:''};
 for(const [key,aliases]of [['shortCode',['kürzel','kuerzel','lehrerkürzel','lehrerkuerzel','shortcode']],['subject',['fach','unterrichtsfach','subject']]]){const i=headers.findIndex(h=>aliases.includes(normal(h)));if(i>=0)result[key]=i;}
 return result;
}
export function mapNamedTeachers(parsed,mapping){
 const rows=[],errors=[],used=new Set(),fields=['firstName','lastName','shortCode','sourceId','className','subject'];
 for(const key of fields){const v=mapping[key];if(v===undefined||v===''){if(['firstName','lastName'].includes(key))errors.push({line:0,message:'Bitte Vorname und Nachname zuordnen.'});continue;}
  const i=Number(v);if(!Number.isSafeInteger(i)||i<0||i>=parsed.headers.length||used.has(i))errors.push({line:0,message:'Jedes Feld braucht eine eigene gültige Spalte.'});used.add(i);
 }
 if(Boolean(mapping.className!==undefined&&mapping.className!=='')!==Boolean(mapping.subject!==undefined&&mapping.subject!==''))errors.push({line:0,message:'Klasse und Fach bitte gemeinsam zuordnen oder beide weglassen.'});
 const data=parsed.rows.slice(parsed.header?1:0);if(!data.length||data.length>2000)errors.push({line:0,message:'Bitte eine Datei mit 1 bis 2000 Datenzeilen verwenden.'});if(errors.length)return {rows,errors};
 for(let i=parsed.header?1:0;i<parsed.rows.length;i++){
  const row={line:parsed.lines[i]};for(const key of fields)row[key]=mapping[key]===undefined||mapping[key]===''?'':String(parsed.rows[i][Number(mapping[key])]??'').trim();
  if(!row.firstName||!row.lastName)errors.push({line:row.line,message:'Vorname und Nachname sind erforderlich.'});
  else if(Boolean(row.className)!==Boolean(row.subject))errors.push({line:row.line,message:'Klasse und Fach müssen als Paar ausgefüllt sein.'});
  else if(mapping.sourceId!==undefined&&mapping.sourceId!==''&&!row.sourceId)errors.push({line:row.line,message:'Die ausgewählte Kennung fehlt.'});
  else if(fields.some(key=>row[key].length>({className:40,subject:80,shortCode:40,sourceId:200}[key]||100)||/[\p{Cc}\p{Cf}]/u.test(row[key])))errors.push({line:row.line,message:'Ein Feld ist zu lang oder enthält unzulässige Steuerzeichen.'});
  else {if(mapping.shortCode===undefined||mapping.shortCode==='')delete row.shortCode;rows.push(row);}
 }
 return {rows,errors};
}
