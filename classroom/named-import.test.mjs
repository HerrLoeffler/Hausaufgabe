import test from 'node:test';import assert from 'node:assert/strict';
import {parseCsv} from './csv.mjs';
import {mapNamedStudents,suggestNamedMapping} from './named-import.mjs';
test('ordinary named CSV needs no ID; minimal mapped fields only; fallback class is explicit',()=>{
 const parsed=parseCsv('\uFEFFVorname;Nachname;Klasse;Adresse\nMila Marie;von Beispiel;8b;IGNORIEREN\n');
 const map=suggestNamedMapping(parsed.headers);assert.equal(map.firstName,0);assert.equal(map.lastName,1);assert.equal(map.className,2);assert.equal(map.sourceId,'');
 const result=mapNamedStudents(parsed,map);assert.equal(result.errors.length,0);assert.deepEqual(result.rows,[{line:2,firstName:'Mila Marie',lastName:'von Beispiel',className:'8b',sourceId:''}]);
 assert.doesNotMatch(JSON.stringify(result.rows),/IGNORIEREN/);
 const fixed=mapNamedStudents(parseCsv('Vorname;Nachname\nAda;Beispiel\n'),{firstName:0,lastName:1,className:'',sourceId:''},{fixedClassName:'9b'});assert.equal(fixed.rows[0].className,'9b');
});
test('headerless ASV pipe keeps first row, textual IDs and multiword names; malformed mapping blocks',()=>{
 const parsed=parseCsv('0010|0001|von Beispiel|Ada|||w|8b||\n0010|0002|Übung|Léo|||m|8b||\n',{header:false,delimiter:'|'});
 const result=mapNamedStudents(parsed,{sourceId:1,lastName:2,firstName:3,className:7});assert.equal(result.rows[0].sourceId,'0001');assert.equal(result.rows[0].line,1);assert.equal(result.rows.length,2);
 assert.ok(mapNamedStudents(parsed,{sourceId:1,lastName:2,firstName:2,className:7}).errors.length);
 const bad=mapNamedStudents(parseCsv('Vorname;Nachname;Klasse;ID\n;Beispiel;8b;001\nAda;Beispiel;8b;001\n'),{sourceId:3,lastName:1,firstName:0,className:2});assert.ok(bad.errors.length);assert.equal(bad.errors[0].line,2);
});
