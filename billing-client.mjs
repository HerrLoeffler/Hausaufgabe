const money = minor => new Intl.NumberFormat('de-DE', {style:'currency',currency:'EUR',minimumFractionDigits:minor % 100 ? 2 : 0}).format(minor / 100);

export function describePlan(plan) {
  if (!plan || !['month','year'].includes(plan.interval) || plan.currency !== 'eur' || !Number.isSafeInteger(plan.amountMinor) || plan.amountMinor <= 0) throw new TypeError('Ungültiger Tarif');
  const monthlyEquivalentMinor = plan.interval === 'year' ? Math.round(plan.amountMinor / 12) : plan.amountMinor;
  return {
    code: plan.code, payNowMinor: plan.amountMinor, monthlyEquivalentMinor,
    title: plan.interval === 'year' ? 'Jährlich' : 'Monatlich',
    summary: plan.interval === 'year'
      ? `${money(plan.amountMinor)} jährlich im Voraus · entspricht ${money(monthlyEquivalentMinor)} pro Monat`
      : `${money(plan.amountMinor)} pro Monat`
  };
}

export function describeAccess(access) {
  const features = Array.isArray(access?.featureCodes) ? access.featureCodes : [];
  const titles = { trial:'Kostenlose Testphase', personal_premium:'Premium', complimentary:'Kostenlose Premium-Freigabe', school:'Premium über deine Schule', free:'Kostenloses Konto' };
  let description = '';
  if (access?.tier === 'trial') description = `${access.freeCreationsRemaining} von 5 neuen Tests übrig. Bearbeiten verbraucht keinen weiteren Test.`;
  else if (access?.reasonCode === 'trial_ended') description = 'Deine Testphase ist beendet. Vorhandene Tests kannst du weiterhin ansehen und exportieren.';
  else if (access?.reasonCode === 'email_verification_required') description = 'Bestätige deine E-Mail-Adresse, um Tests zu erstellen.';
  else if (access?.tier === 'complimentary') description = 'Dein Premium-Zugang wurde kostenlos freigegeben. Es erfolgt keine Abbuchung.';
  else if (access?.tier === 'school') description = 'Dein Zugang gehört zur gemeinsamen Lizenz deiner Schule.';
  return { title: titles[access?.tier] || 'Zugang wird geprüft', description,
    canCreate: features.includes('test.create'), canEdit: features.includes('test.edit'), canExport: features.includes('test.export'),
    validUntil: access?.validUntil ?? null, trialEndsAtMs: access?.trialEndsAtMs ?? null };
}

export function createBillingClient({call, getUid, onChange = () => {}}) {
  let generation = 0, value = null;
  function reset() { generation++; value = null; onChange(null); }
  function same(uid, ticket) { return getUid() === uid && ticket === generation; }
  async function refresh() {
    const uid = getUid(), ticket = ++generation;
    value = null;
    if (!uid) { onChange(null); return null; }
    onChange(null, {loading:true});
    try {
      const result = await call({action:'access'});
      if (!same(uid,ticket)) return null;
      value = result;
      onChange(result);
      return result;
    } catch (error) {
      if (same(uid,ticket)) { value = null; onChange(null,{error}); }
      throw error;
    }
  }
  async function request(action,data = {}) {
    const uid = getUid();
    if (!uid) throw new Error('Bitte zuerst anmelden.');
    const result = await call({...data,action});
    if (getUid() !== uid) throw new Error('Das Konto wurde gewechselt. Bitte neu laden.');
    return result;
  }
  async function assertFeature(feature) {
    const result = await refresh();
    if (!result?.enforced || !result.featureCodes?.includes(feature)) {
      const error = new Error(result?.reasonCode === 'quota_exhausted' ? 'Alle fünf kostenlosen Tests sind erstellt. Bestehende Tests kannst du während der Testphase weiter bearbeiten.' : 'Für diese Aktion brauchst du einen gültigen Zugang.');
      error.details = {reasonCode:result?.reasonCode || 'access_unavailable'};
      throw error;
    }
    return result;
  }
  async function createQuiz({requestId,kind,quiz,scope}) {
    const uid = getUid();
    const result = await request('createQuiz',{requestId,kind,quiz,...(scope ? {scope} : {})});
    // The creation is already persisted. An unavailable status read must not
    // encourage a second purchase/creation, but account changes still abort.
    await refresh().catch(() => null);
    if (getUid() !== uid) throw new Error('Das Konto wurde gewechselt. Bitte neu laden.');
    return result;
  }
  return {refresh,reset,request,assertFeature,createQuiz,snapshot:() => value ? structuredClone(value) : null};
}
