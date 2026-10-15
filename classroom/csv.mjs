export function decodeCsv(bytes, encoding='utf-8') {
 if(bytes.byteLength>2*1024*1024) throw Error('Datei zu groß. Höchstens 2 MB im lokalen Import.');
 try { return new TextDecoder(encoding,{fatal:true}).decode(bytes); } catch { throw Error('Die Datei ist kein gültiges UTF-8. Wähle die tatsächliche Zeichenkodierung ausdrücklich aus.'); }
}
export function parseCsv(input,{delimiter,header=true}={}) {
 const text=String(input).replace(/^\uFEFF/,'');
 if(!text.trim()) throw Error('Die Datei ist leer.');
 if(!delimiter){const first=text.split(/\r?\n/)[0]; delimiter=[';','|','\t',','].sort((a,b)=>first.split(b).length-first.split(a).length)[0];}
 if(![';','|','\t',','].includes(delimiter)) throw Error('Unbekanntes Trennzeichen.');
 const rows=[],lines=[]; let row=[],field='',quoted=false,closed=false,line=1,startLine=1;
 const cell=()=>{row.push(field);field='';closed=false;};
 const finish=()=>{cell();if(row.some(v=>v!=='')){rows.push(row);lines.push(startLine);}row=[];startLine=line+1;};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else{field+=c;if(c==='\n')line++;}continue;}
  if(c==='"'){if(field||closed)throw Error(`Zeile ${line}: Anführungszeichen innerhalb eines ungeschützten Felds.`);quoted=true;continue;}
  if(c===delimiter){cell();continue;}
  if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;finish();line++;continue;}
  if(closed)throw Error(`Zeile ${line}: Unerwarteter Text nach geschlossenem Anführungszeichen.`);
  field+=c;
 }
 if(quoted)throw Error(`Zeile ${startLine}: Anführungszeichen nicht geschlossen.`);
 if(field||row.length||closed)finish();
 if(!rows.length)throw Error('Die Datei enthält keine Datensätze.');
 const width=rows[0].length;
 if(width<2)throw Error('Keine getrennten Spalten erkannt. Nutze die echte Datei mit Zeilenumbrüchen.');
 for(let i=0;i<rows.length;i++)if(rows[i].length!==width)throw Error(`Zeile ${lines[i]}: ${rows[i].length} statt ${width} Spalten. Zeilenumbrüche und Trennzeichen prüfen.`);
 if(!header&&width===10&&rows.length===1&&/\s[^|]+\|/.test(text)&&text.split('|').length>10)throw Error('Zusammengefügter Einzeiler: echte Datei mit Zeilenumbrüchen auswählen.');
 return {rows,lines,delimiter,headers:header?rows[0]:Array.from({length:width},(_,i)=>`Spalte ${i+1}`),header};
}
export function mapImportRows(parsed,mapping,{kind='pupils',header=parsed.header}={}) {
 const records=[],errors=[],seen=new Set(),start=header?1:0;
 const value=(r,key)=>mapping[key]===undefined||mapping[key]===''?'':String(r[Number(mapping[key])]??'').trim();
 for(let i=start;i<parsed.rows.length;i++){
  const row=parsed.rows[i],sourceId=value(row,'id'),line=parsed.lines[i];
  if(!sourceId){errors.push({line,message:'Stabile Kennung fehlt.'});continue;}
  if(seen.has(sourceId)){errors.push({line,message:'Kennung kommt mehrfach vor.'});continue;}seen.add(sourceId);
  const record={sourceId,line};
  for(const key of ['firstName','lastName','className','subject','teacherId','year'])if(mapping[key]!==undefined)record[key]=value(row,key);
  if(kind==='pupils'&&!record.className){errors.push({line,message:'Klasse fehlt.'});continue;}
  if(kind==='teaching'&&(!record.teacherId||!record.className||!record.subject)){errors.push({line,message:'Lehrkraftkennung, Klasse und Fach sind erforderlich.'});continue;}
  records.push(record);
 }
 return {records,errors};
}
export function sampleCsv(kind='pupils') {
 const samples={
  pupils:'id;nachname;vorname;klasse\n0001;Beispiel;Ada;9b\n0002;Muster;Léo;9b\n0003;Übung;Mila;5a\n',
  'pupils-pipe':'0010|0001|von Beispiel|Ada|Zusatz||||9b||',
  teachers:'id;nachname;vorname\nT001;Beispiel;Toni\nT002;Muster;Kim\n',
  teaching:'id;teacherId;klasse;fach\nU001;T001;9b;Technik\nU002;T002;9b;Englisch\n'
 };
 if(kind==='pupils-pipe')return ['0010|0001|von Beispiel|Ada|Zusatz||w|9b||','0010|0002|Müller Test|Léo|||m|9b||','0010|0003|Übung|Mila|||d|5a||'].join('\n')+'\n';
 return samples[kind]||samples.pupils;
}
