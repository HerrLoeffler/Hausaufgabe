import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, decodeCsv, mapImportRows, sampleCsv } from './csv.mjs';
test('CSV preserves textual IDs, BOM, delimiters, quotes, multiline and trailing empty columns', () => {
 const r=parseCsv('\uFEFFid;name;class;extra\r\n001;"Müller;Test";9b;\r\n002;"von\nBeispiel ""Zwei""";5a;');
 assert.equal(r.delimiter,';'); assert.equal(r.rows[1][0],'001'); assert.equal(r.rows[1][1],'Müller;Test'); assert.equal(r.rows[2][1],'von\nBeispiel "Zwei"'); assert.equal(r.rows[1].length,4);
});
test('headerless ten-column pipe profile keeps first record and multiword names',()=>{
 const r=parseCsv(sampleCsv('pupils-pipe'),{header:false,delimiter:'|'});
 assert.equal(r.rows.length,3); assert.equal(r.rows[0].length,10); assert.equal(r.rows[0][0],'0010'); assert.equal(r.rows[0][2],'von Beispiel');
 const m=mapImportRows(r,{id:1,lastName:2,firstName:3,className:7},{kind:'pupils',header:false});
 assert.equal(m.records.length,3); assert.equal(m.records[0].sourceId,'0001'); assert.ok(!('gender' in m.records[0]));
});
test('malformed quotes, duplicate IDs and missing IDs return actionable line errors',()=>{
 assert.throws(()=>parseCsv('id,name\n1,"bad'),/Zeile 2/);
 const r=parseCsv('id;class\n001;9b\n001;9c\n;5a'); const m=mapImportRows(r,{id:0,className:1},{kind:'pupils',header:true});
 assert.deepEqual(m.errors.map(e=>e.line),[3,4]);
});
test('UTF8 is strict and legacy encoding is explicit',()=>{
 assert.throws(()=>decodeCsv(new Uint8Array([0xfc])) ,/UTF/); assert.equal(decodeCsv(new Uint8Array([0xfc]),'windows-1252'),'ü');
});
