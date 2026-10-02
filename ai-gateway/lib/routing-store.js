'use strict';
const { digest, fail, int, id } = require('./routing-policy');

/** Server-only Firestore adapter. API calls MUST run outside transaction callbacks. */
function createRoutingStore(db, { namespace = 'aiRouting', retentionDays = 30 } = {}) {
  if (!['aiRouting', 'aiRoutingTest'].includes(namespace) || !int(retentionDays, 1, 30)) fail('INVALID_STORE_CONFIG');
  const root = db.collection(namespace);
  const opRef = operationId => root.doc('operations').collection('items').doc(digest(operationId));
  async function reserve({ operationId, fingerprint, policyId, profileId, bucket, currency, amount, calls, budget, now }) {
    if (!id(operationId) || !['production', 'evaluation'].includes(bucket) || !int(amount, 1) || !int(calls, 1, 2)) fail('INVALID_RESERVATION');
    const date = new Date(now).toISOString(), day = date.slice(0, 10), month = date.slice(0, 7);
    const op = opRef(operationId);
    // Across profile/policy versions: changing a model must never reset the account's spend cap.
    const daily = root.doc(`budget-${currency}-${bucket}-${day}`), monthly = root.doc(`budget-${currency}-${bucket}-${month}`);
    return db.runTransaction(async tx => {
      const [existing, d, m] = await Promise.all([tx.get(op), tx.get(daily), tx.get(monthly)]);
      if (existing.exists) fail(existing.data().fingerprint === fingerprint ? 'OPERATION_ALREADY_CLAIMED' : 'OPERATION_ID_CONFLICT');
      const dayData = d.data() || {}, monthData = m.data() || {};
      if (dayData.paused || monthData.paused) fail('PRICE_BOUND_EXCEEDED');
      const dailyHeld = dayData.heldMicros || 0, monthlyHeld = monthData.heldMicros || 0, dailyCalls = dayData.calls || 0;
      if (dailyHeld + amount > budget.dailyMicros || monthlyHeld + amount > budget.monthlyMicros
        || dailyCalls + calls > budget.dailyCalls) fail('BUDGET_EXHAUSTED');
      tx.set(daily, { heldMicros: dailyHeld + amount, calls: dailyCalls + calls });
      tx.set(monthly, { heldMicros: monthlyHeld + amount });
      const record = { fingerprint, policyId, profileId, bucket, currency, reservedMicros: amount, reservedCalls: calls,
        dailyPath: daily.path, monthlyPath: monthly.path, state: 'reserved', createdAt: now,
        // Field is a TTL proposal until the controlled activation enables actual deletion.
        expiresAt: new Date(now + retentionDays * 86400000) };
      tx.create(op, record); return { operationId, reservedMicros: amount };
    });
  }

  async function settle(operationId, receipt) {
    const op = opRef(operationId);
    return db.runTransaction(async tx => {
      const snap = await tx.get(op); if (!snap.exists) fail('RESERVATION_NOT_FOUND');
      const data = snap.data(); if (data.state === 'settled') return;
      const daily = db.doc(data.dailyPath), monthly = db.doc(data.monthlyPath);
      const [d, m] = await Promise.all([tx.get(daily), tx.get(monthly)]);
      const known = int(receipt.actualMicros);
      // Unknown provider bill => keep the full reservation. Never pretend failure was free.
      const charged = known ? receipt.actualMicros : data.reservedMicros;
      const adjustment = charged - data.reservedMicros;
      const overReservation = known && charged > data.reservedMicros;
      tx.set(daily, { ...d.data(), heldMicros: Math.max(0, d.data().heldMicros + adjustment), paused: Boolean(d.data().paused || overReservation) });
      tx.set(monthly, { ...m.data(), heldMicros: Math.max(0, m.data().heldMicros + adjustment), paused: Boolean(m.data().paused || overReservation) });
      tx.update(op, { state: 'settled', ...receipt, chargedMicros: charged, costKnown: known,
        overReservation: known && charged > data.reservedMicros });
    });
  }
  async function listRecent({ since, limit = 500 } = {}) {
    if (!Number.isFinite(since) || !int(limit, 1, 1000)) fail('INVALID_QUERY');
    const rows = await root.doc('operations').collection('items').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(limit + 1).get();
    return { rows: rows.docs.slice(0, limit).map(d => d.data()), truncated: rows.docs.length > limit };
  }
  return { reserve, settle, listRecent };
}
module.exports = { createRoutingStore };
