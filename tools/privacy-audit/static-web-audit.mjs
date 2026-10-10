// Read-only source evidence, never browser storage or customer documents.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('../ui/node_modules/jsdom');
const read=path=>readFileSync(path,'utf8');
const document=new JSDOM(read('index.html')).window.document;
const sourceFiles=['app.js','crew-assistant-ui.js','secure-assessment-client.js','secure-student.js','secure-draft-persistence.js','editor-drafts.js','student-attempt-guard.js','review-store.mjs','shared/i18n/browser-runtime.mjs'];
const storageEvidence=sourceFiles.flatMap(path=>read(path).split('\n').flatMap((line,i)=>/localStorage|sessionStorage|indexedDB\.open/.test(line)?[{path,line:i+1,kind:line.includes('localStorage')?'localStorage':line.includes('sessionStorage')?'sessionStorage':'IndexedDB'}]:[]));
const names=[...document.querySelectorAll('a')].map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')}));
const report={scope:'Static web source only; no runtime, account data or legal certification',
 missingLabels:[...document.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(e=>!e.closest('label')&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({id:e.id,type:e.type})),
 missingImageAlt:[...document.querySelectorAll('img:not([alt])')].map(e=>({src:e.getAttribute('src')})),
 emptyButtonNames:[...document.querySelectorAll('button')].filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({id:e.id})),
 legalLinks:names.filter(x=>/privacy|datenschutz|impressum|terms|agb|refund|widerruf/i.test(x.text+' '+x.href)),
 storageEvidence,
 publicDependencies:JSON.parse(read('functions/package.json')).dependencies,
 assetRegistryHasLicenseMetadata:/"(?:license|licence|copyright|attribution)"/.test(read('shared/gradecrew-design/assets.json')),
 newMemoryPanelInSettings:Boolean(document.querySelector('#settingsView #cocoAccountPrivacy')),
 noAutoBrowserAnalyticsInSelectedFiles:!sourceFiles.some(path=>/gtag\(|posthog\.init|clarity\(/.test(read(path)))};
mkdirSync('docs/assurance/audits',{recursive:true});
writeFileSync('docs/assurance/audits/privacy-web-source-20261010.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({missingLabels:report.missingLabels.length,missingImageAlt:report.missingImageAlt.length,emptyButtonNames:report.emptyButtonNames.length,legalLinks:report.legalLinks.length,storageEvidence:report.storageEvidence.length,assetRegistryHasLicenseMetadata:report.assetRegistryHasLicenseMetadata}));
