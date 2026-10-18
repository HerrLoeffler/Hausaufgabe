import test from 'node:test';import assert from 'node:assert/strict';
import {parseCsv} from './csv.mjs';import {suggestTeacherMapping,mapNamedTeachers} from './named-teacher-import.mjs';
test('teacher mapping keeps staff references explicit and accepts repeated identifiers for teaching pairs',()=>{
 const p=parseCsv('Personal-ID;Vorname;Nachname;Kürzel;Klasse;Fach\n0001;Ada;Beispiel;AB;8b;Deutsch\n0001;Ada;Beispiel;AB;9b;Englisch',{header:true});const m=suggestTeacherMapping(p.headers);assert.equal(m.sourceId,'');m.sourceId=0;
 const out=mapNamedTeachers(p,m);assert.deepEqual(out.errors,[]);assert.equal(out.rows.length,2);assert.equal(out.rows[0].sourceId,'0001');assert.equal(out.rows[1].subject,'Englisch');
});
test('staff-only CSV needs names; half teaching pairs and reused columns cannot pass',()=>{
 const p=parseCsv('Vorname;Nachname\nAda;Beispiel',{header:true});assert.equal(mapNamedTeachers(p,suggestTeacherMapping(p.headers)).rows.length,1);
 const half=parseCsv('Vorname;Nachname;Klasse\nAda;Beispiel;8b',{header:true});assert.ok(mapNamedTeachers(half,suggestTeacherMapping(half.headers)).errors.length);
 assert.ok(mapNamedTeachers(p,{firstName:0,lastName:0}).errors.length);
});
