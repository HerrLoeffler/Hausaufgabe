// Existing editor remains the sole authoring surface. Server verifies owner on return.
const editor=document.getElementById('editorView');
function update(){if(!editor)return;let link=document.getElementById('testRallyeEditorLink');if(!link){link=document.createElement('a');link.id='testRallyeEditorLink';link.className='button secondary';link.textContent='Als Test-Rallye spielen';link.title='Test zuerst speichern, danach in Test-Rallye auswählen';editor.prepend(link)}link.href='../test-rallye/?test='+encodeURIComponent(editor.dataset.quizId||'');link.hidden=!editor.dataset.quizId;}
if(editor){new MutationObserver(update).observe(editor,{attributes:true,attributeFilter:['data-quiz-id']});update()}
