const chosenVisual = doc => !!doc.querySelector('#aiTypeChecks input[value="visual"]:checked');
export function syncInteractiveFormatChoices(doc=document) {
  const group=doc.getElementById('aiInteractiveFormats');if(group)group.disabled=!chosenVisual(doc);
}
export function resetInteractiveFormatChoices(doc=document) {
  for(const input of doc.querySelectorAll('[data-interactive-formats]'))input.checked=true;
  syncInteractiveFormatChoices(doc);
}
export function collectInteractiveFormats(doc=document) {
  if(!chosenVisual(doc))return [];
  const formats=[...new Set([...doc.querySelectorAll('[data-interactive-formats]:checked')].flatMap(el=>el.dataset.interactiveFormats.split(',')))];
  if(!formats.length)throw new Error('Bitte mindestens ein interaktives Format auswählen.');
  return formats;
}
