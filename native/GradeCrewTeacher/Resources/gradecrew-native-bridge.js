/* Bundled with the iOS app; ordinary browsers keep their existing download path. */
(() => {
  'use strict';
  const config = __GRADECREW_CONFIG__;
  const handler = window.webkit?.messageHandlers?.gradecrewNative;
  if (!handler || window.top !== window.self || location.origin !== config.origin) return;
  const maximumFileBytes = 12 * 1024 * 1024;
  let sharing = false;
  const fallbackAnchors = new WeakSet();
  const types = { csv: 'text/csv', pdf: 'application/pdf', txt: 'text/plain', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

  async function request(action, payload = {}) {
    const reply = await handler.postMessage({ version: 1, id: crypto.randomUUID(), action, payload });
    if (!reply?.ok) {
      const error = new Error(reply?.error?.message || 'Die native Aktion konnte nicht ausgeführt werden.');
      error.code = reply?.error?.code || 'unavailable';
      throw error;
    }
    return reply.result;
  }

  async function shareFile(blob, filename) {
    if (!(blob instanceof Blob) || !blob.size) throw new Error('Die Datei ist leer oder ungültig.');
    if (blob.size > maximumFileBytes) throw new Error('Die Datei ist zu groß. Maximal 12 MB können direkt geteilt werden.');
    if (sharing) throw new Error('Bitte zuerst das Teilen-Menü schließen.');
    sharing = true;
    try {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const chunks = [];
      for (let offset = 0; offset < bytes.length; offset += 32768) {
        chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
      }
      return await request('shareFile', { filename, mimeType: blob.type, base64: btoa(chunks.join('')) });
    } finally { sharing = false; }
  }

  async function diagnostics() {
    const native = await request('diagnostics');
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 5000);
    let webManifestCommit = null;
    try {
      const response = await fetch(new URL('/release.json', config.origin), { cache: 'no-store', signal: abort.signal });
      const manifest = response.ok ? await response.json() : null;
      if (location.origin === config.origin && manifest?.project === 'hausaufgabe-staging' && /^[a-f0-9]{40}$/.test(manifest.commit)) {
        webManifestCommit = manifest.commit;
      }
    } catch { /* Missing evidence stays explicit; never substitute a configured SHA. */ }
    finally { clearTimeout(timeout); }
    return { ...native, webManifestCommit };
  }

  Object.defineProperty(window, 'GradeCrewNative', { configurable: false, writable: false,
    value: Object.freeze({ version: 1, capabilities: () => request('capabilities'), diagnostics, shareFile }) });

  function isBlobDownload(anchor) {
    if (!anchor?.download || fallbackAnchors.has(anchor) || !anchor.href?.startsWith('blob:')) return false;
    if (!types[anchor.download.split('.').pop().toLowerCase()]) return false;
    try { return new URL(anchor.href).origin === config.origin; } catch { return false; }
  }

  function exportBlob(anchor) {
    // Fetch starts synchronously, before existing exporters revoke their object URL.
    const filename = anchor.download;
    const response = fetch(anchor.href);
    response.then(r => r.blob()).then(blob => {
      const mime = blob.type.split(';')[0].trim().toLowerCase();
      if (mime === types[filename.split('.').pop().toLowerCase()]) return shareFile(blob, filename);
      // Recreate the URL: the web exporter may already have revoked its original.
      const previousHref = anchor.href;
      const previousName = anchor.download;
      const replacement = URL.createObjectURL(blob);
      fallbackAnchors.add(anchor);
      try { anchor.href = replacement; anchor.download = filename; originalClick.call(anchor); }
      finally {
        anchor.href = previousHref; anchor.download = previousName; fallbackAnchors.delete(anchor);
        setTimeout(() => URL.revokeObjectURL(replacement), 5000);
      }
    })
      .catch(error => window.alert(error.message || 'Die Datei konnte nicht geteilt werden. Bitte versuche es erneut.'));
  }

  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (isBlobDownload(this)) { exportBlob(this); return; }
    return originalClick.call(this);
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0) return;
    const anchor = event.target?.closest?.('a[download]');
    if (!isBlobDownload(anchor)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exportBlob(anchor);
  }, true);
})();
