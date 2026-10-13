/* Native fields delegate to the existing web handlers and persistent Firebase session. */
function createNativeAuthController({ document, getSession, readState, restoredAccount, recordLogin,
  now = Date.now, tick = () => new Promise(resolve => setTimeout(resolve, 100)), timeout = 30000 }) {
  let busy = false;
  const byId = id => document.getElementById(id);
  async function waitUntil(check) {
    const deadline = now() + timeout;
    do { const value = await check(); if (value) return value; await tick(); } while (now() < deadline);
    throw new Error('Die Anmeldung konnte gerade nicht bestätigt werden. Bitte erneut versuchen.');
  }
  async function ready() {
    return waitUntil(async () => {
      if (!byId('loginForm') || !byId('registerForm') || !byId('resetForm') || !readState()) return null;
      try { return await getSession(); } catch { return null; }
    });
  }
  async function perform(action, payload = {}) {
    if (!['authPrepare', 'authLogin', 'authRegister', 'authReset'].includes(action)) throw new Error('Diese Anmeldung ist nicht verfügbar.');
    if (busy) throw new Error('Die Anmeldung läuft bereits. Bitte kurz warten.');
    if (action === 'authPrepare') { await ready(); return { status: 'ready' }; }
    const email = String(payload.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Bitte eine gültige E-Mail-Adresse eingeben.');
    const password = String(payload.password || '');
    const name = String(payload.name || '').trim();
    if (action !== 'authReset' && !password) throw new Error('Bitte dein Passwort eingeben.');
    if (action === 'authRegister' && !name) throw new Error('Bitte deinen Namen eingeben.');
    if (action === 'authRegister' && password.length < 6) throw new Error('Das Passwort braucht mindestens 6 Zeichen.');
    busy = true;
    try {
      const session = await ready();
      if (session.getUser()) throw new Error('Du bist bereits angemeldet. Bitte die Anmeldung neu laden.');
      const mode = action === 'authRegister' ? 'register' : action === 'authReset' ? 'reset' : 'login';
      byId('gcEntryLoginOpen')?.click();
      if (mode === 'register') byId('gcEntrySwitchRegister')?.click();
      if (mode === 'reset') byId('forgotBtn')?.click();
      const fields = mode === 'register'
        ? { registerName: name, registerEmail: email, registerPassword: password, registerPassword2: password }
        : mode === 'reset' ? { resetEmail: email } : { loginEmail: email, loginPassword: password };
      for (const [id, value] of Object.entries(fields)) {
        const input = byId(id);
        if (!input) throw new Error('Das Anmeldeformular ist gerade nicht bereit. Bitte erneut verbinden.');
        if (id.endsWith('Email')) input.type = 'email';
        input.value = value;
      }
      const form = byId(mode + 'Form');
      if (!form.checkValidity()) throw new Error('Bitte E-Mail und Passwort prüfen.');
      const toast = byId('toast');
      if (toast) { toast.textContent = ''; toast.className = 'toast'; }
      if (mode === 'reset') byId('resetStatus').textContent = '';
      // requestSubmit invokes the existing synchronous argument capture, then the
      // shared async SDK/profile work. Do not retain passwords in hidden DOM.
      try { form.requestSubmit(); }
      finally { for (const id of ['loginPassword', 'registerPassword', 'registerPassword2']) if (byId(id)) byId(id).value = ''; }
      if (mode === 'reset') {
        return await waitUntil(() => {
          const message = byId('resetStatus')?.textContent?.trim() || '';
          if (byId('resetSubmit')?.disabled || !message || message === 'Link wird angefordert …') return null;
          if (!message.startsWith('Falls ein Konto')) throw new Error(message);
          return { status: 'resetSent', message };
        });
      }
      const expectedToast = mode === 'register' ? 'Account erstellt.' : 'Erfolgreich angemeldet.';
      return await waitUntil(() => {
        if (toast?.classList.contains('error') && toast.classList.contains('show')) throw new Error(toast.textContent.trim() || 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.');
        const user = session.getUser();
        if (user && String(user.email || '').toLowerCase() !== email.toLowerCase()) throw new Error('Das Konto wurde inzwischen gewechselt. Bitte erneut anmelden.');
        if (toast?.textContent?.trim() !== expectedToast || readState()?.state !== 'signedIn' || !user) return null;
        restoredAccount(user.uid);
        recordLogin(user.uid);
        // Firebase identity and credentials stay in the web session, never Swift.
        return { status: 'signedIn' };
      });
    } finally { busy = false; }
  }
  return Object.freeze({ perform });
}
if (typeof module !== 'undefined') module.exports = { createNativeAuthController };
if (typeof window !== 'undefined') {
  const config = __GRADECREW_CONFIG__;
  if (window.webkit?.messageHandlers?.gradecrewNative && window.top === window.self && location.origin === config.origin) {
    let sessionPromise;
    async function getSession() {
      if (!sessionPromise) sessionPromise = (async () => {
        const { getApp } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js');
        const app = getApp();
        if (app.options.projectId !== 'hausaufgabe-staging') throw new Error('Die Staging-Verbindung konnte nicht bestätigt werden.');
        const auth = getAuth(app);
        onAuthStateChanged(auth, user => window.GradeCrewNativeWorkspace?.restoredAccount(user?.uid || null));
        window.GradeCrewNativeWorkspace?.restoredAccount(auth.currentUser?.uid || null);
        return { getUser: () => auth.currentUser };
      })().catch(error => { sessionPromise = null; throw error; });
      return sessionPromise;
    }
    const controller = createNativeAuthController({ document, getSession,
      readState: () => window.GradeCrewNative?.readAuthState?.(),
      restoredAccount: uid => window.GradeCrewNativeWorkspace?.restoredAccount(uid),
      recordLogin: uid => window.GradeCrewNativeWorkspace?.recordLogin(uid) });
    Object.defineProperty(window, 'GradeCrewNativeAuth', { configurable: false, writable: false,
      value: Object.freeze({ perform: controller.perform, syncAccount: async () => {
        const session = await getSession(); window.GradeCrewNativeWorkspace?.restoredAccount(session.getUser()?.uid || null);
      } }) });
  }
}
