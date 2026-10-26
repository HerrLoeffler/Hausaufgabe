import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const workspace='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4';
const base=path.join(workspace,'outputs/gradecrew-kollegium-20261028/revision-v6');
const skill='/Users/martin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22136/skills/presentations';
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const finalPath=path.join(base,'files/GradeCrew_Kollegium_20261028_v6_Tutorial.pptx');
const result=await finalizePresentation({workspaceDir:workspace,candidatePath:path.join(base,'build/candidate-animated.pptx'),finalPath,pythonExecutable:'/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:12,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'reference',families:['Arial'],referencePath:'/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/outputs/gradecrew-kollegium-20261028/revision-v4/files/GradeCrew_Kollegium_20261028_v4_final.pptx',referenceSha256:'1dc4185caccbe9cb3031ce1c7abbf78edb39e33a404bb1146990397e695290c5'},verifyArtifactToolImport:true,receiptPath:path.join(base,'build/validation-v6.json')});
console.log(JSON.stringify({finalPath:result.finalPath,sha256:result.finalSha256,bytes:result.byteCount,findings:result.presentationLayout.findingCount}));
const p=await PresentationFile.importPptx(await FileBlob.load(finalPath));
for(let i=0;i<12;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(base,'preview',`final-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));console.log('final-rendered',i+1);}
