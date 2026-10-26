// Assistance annotates the current source. It never creates or changes a model.
import {mathText} from './brain.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sourceTask(session){if(session?.pendingNext&&session.originalTask)return session.originalTask;return session?.assistance?.anchorTaskId&&session.originalTask?.id===session.assistance.anchorTaskId?session.originalTask:session?.task||{};}
export function sourceKey(session){const task=sourceTask(session);return JSON.stringify([session?.id,session?.assistance?.anchorTaskId||task.id,task.contextText,task.diagram,task.workshop,task.media]);}
export function focusAttributes(assistance,...ids){return ids.some(id=>assistance?.focusIds?.includes(id))?' data-help-focus="true"':'';}
export function renderSourceText(text,assistance){
 let index=0;return String(text||'').split(/(\s+)/).map(token=>/^\s+$/.test(token)?token:`<span data-source-token="${index}"${focusAttributes(assistance,'token:'+index++)}>${mathText(token)}</span>`).join('');
}
export function renderFocusLabels(assistance){if(!assistance?.focusIds?.length)return '';const labels=assistance.focusIds.map(id=>assistance.regions?.find(r=>r.id===id)?.label).filter(Boolean);return labels.length?`<p class="help-focus-label"><strong>Schau hierhin:</strong> ${labels.map(esc).join(' · ')}</p>`:'';}
export function decorateWorkshop(html,assistance){
 // The workshop already owns interaction and values. Only decorate existing controls.
 let part=0;return html.replace(/<(button|span)\b[^>]*>/g,tag=>{
  const token=tag.match(/data-workshop-action="toggle-token"[^>]*data-value="(\d+)"/);
  if(token)return tag.replace(/>$/,focusAttributes(assistance,'token:'+token[1])+'>');
  const cell=tag.match(/data-workshop-part="(\d+)"/);
  if(cell)return tag.replace(/>$/,focusAttributes(assistance,'part:'+cell[1])+'>');
  if(/class="workshop-piece/.test(tag))return tag.replace(/>$/,focusAttributes(assistance,'part:'+part++)+'>');
  return tag;
 });
}
