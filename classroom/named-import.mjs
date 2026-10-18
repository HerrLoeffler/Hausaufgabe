const normal=value=>String(value).trim().toLocaleLowerCase('de').replace(/[\s_.-]/g,'');
export function suggestNamedMapping(headers){
 const aliases={firstName:['vorname','vornamen','firstname'],lastName:['nachname','familienname','lastname','surname'],className:['klasse','klassenname','klassenbezeichnung','class','classname']};
 const result={firstName:'',lastName:'',className:'',sourceId:''};
 for(const [key,names] of Object.entries(aliases)){const index=headers.findIndex(h=>names.includes(normal(h)));if(index>=0)result[key]=index;}
 return result;
}
export function mapNamedStudents(parsed,mapping,{fixedClassName=''}={}){
 const rows=[],errors=[],width=parsed.headers.length,used=[];
 for(const key of ['firstName','lastName','className','sourceId']){
  const value=mapping[key];if(value===undefined||value===''){if(['firstName','lastName'].includes(key))errors.push({line:0,message:'Bitte Vorname und Nachname unterschiedlichen Spalten zuordnen.'});continue;}
  const index=Number(value);if(!Number.isSafeInteger(index)||index<0||index>=width||used.includes(index))errors.push({line:0,message:'Jedes Feld braucht eine eigene gültige Spalte.'});used.push(index);
 }
 if(!fixedClassName&&(mapping.className===undefined||mapping.className===''))errors.push({line:0,message:'Bitte eine Klassenspalte oder eine feste Zielklasse wählen.'});
 const data=parsed.rows.slice(parsed.header?1:0);if(!data.length||data.length>2000)errors.push({line:0,message:'Bitte eine Datei mit 1 bis 2000 Schüler:innen verwenden.'});
 if(errors.length)return {rows,errors};
 const seen=new Set(),value=(record,key)=>mapping[key]===undefined||mapping[key]===''?'':String(record[Number(mapping[key])]??'').trim();
 for(let i=parsed.header?1:0;i<parsed.rows.length;i++){
  const record=parsed.rows[i],line=parsed.lines[i],row={line,firstName:value(record,'firstName'),lastName:value(record,'lastName'),className:fixedClassName||value(record,'className'),sourceId:value(record,'sourceId')};
  if(!row.firstName||!row.lastName||!row.className)errors.push({line,message:'Vorname, Nachname und Klasse sind erforderlich.'});
  else if(row.firstName.length>100||row.lastName.length>100||row.className.length>40||row.sourceId.length>200||Object.values(row).some(v=>typeof v==='string'&&/[\p{Cc}\p{Cf}]/u.test(v)))errors.push({line,message:'Ein Feld ist zu lang oder enthält unzulässige Steuerzeichen.'});
  else if(mapping.sourceId!==undefined&&mapping.sourceId!==''&&!row.sourceId)errors.push({line,message:'Die ausgewählte Kennung fehlt.'});
  else if(row.sourceId&&seen.has(row.sourceId))errors.push({line,message:'Diese Kennung kommt mehrfach vor.'});
  else rows.push(row);
  if(row.sourceId)seen.add(row.sourceId);
 }
 return {rows,errors};
}
