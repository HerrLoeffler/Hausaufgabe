import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { previewCallable, PROJECT, AI_NAMES, ASSESSMENT_NAMES,previewAccountAllowed,PREVIEW_TEST_UID } from './visual-preview255-contract.mjs';
test('all preview endpoint names isolate the task and preserve other functions',()=>{assert.equal(PROJECT,'gradecrew-staging-2026');assert.equal(previewCallable('generateTest'),'visual255GenerateTest');assert.equal(previewCallable('submitAssessmentAttempt'),'visual255SubmitAssessmentAttempt');assert.equal(previewCallable('generateQuestionAudio'),'generateQuestionAudio');assert.ok(AI_NAMES.includes('processAiTestJob'));assert.equal(previewCallable('crewAssistant'),'visual255CrewAssistant');assert.equal(ASSESSMENT_NAMES.length,6)});
test('browser source stays on existing endpoints outside explicit preview builds', async()=>{const s=await readFile(new URL('../visual-preview255.mjs',import.meta.url),'utf8');assert.match(s,/ENABLED = false/);});

test('self-editable profile flags cannot grant preview access',()=>{assert.equal(previewAccountAllowed('other-teacher',{role:'teacher',visualPreview255:true}),false);assert.equal(previewAccountAllowed(PREVIEW_TEST_UID,{role:'teacher'}),true);assert.equal(previewAccountAllowed('existing-admin',{role:'admin'}),true);});
