// A local checkpoint can hold incomplete questions and image data that cannot
// yet pass server validation. Keys include the signed-in user's UID.
const DATABASE = "testify-editor-drafts";
const STORE = "drafts";

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error("Lokale Speicherung ist in diesem Browser nicht verfügbar."));
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withDraftStore(mode, action) {
  const db = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Lokale Sicherung abgebrochen.")); };
  });
}

export function draftKey(uid, quizId) { return `${uid}:${quizId}`; }
let writeChain = Promise.resolve();
function queueMutation(action) {
  const pending = writeChain.then(action, action);
  writeChain = pending.catch(() => {});
  return pending;
}
export function saveEditorDraft(draft) { return queueMutation(() => withDraftStore("readwrite", store => store.put(draft))); }
export function readEditorDraft(uid, quizId) { return withDraftStore("readonly", store => store.get(draftKey(uid, quizId))); }
export function removeEditorDraft(uid, quizId) { return queueMutation(() => withDraftStore("readwrite", store => store.delete(draftKey(uid, quizId)))); }
export async function listEditorDrafts(uid) {
  const drafts = await withDraftStore("readonly", store => store.getAll());
  return drafts.filter(draft => draft.ownerId === uid).sort((a, b) => b.savedAt - a.savedAt);
}
