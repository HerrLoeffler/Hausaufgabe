"use strict";

// Firestore is confined to this adapter. Domain and application code use keys,
// plain records and a transaction contract, and do not import a Google SDK.
function createFirestoreBillingStore(db) {
  function unit(tx) {
    return {
      get: async key => { const s = await tx.get(db.doc(key)); return s.exists ? s.data() : null; },
      find: async (collection, filters, limit = 50) => {
        let query = db.collection(collection);
        for (const [field, op, value] of filters) query = query.where(field, op, value);
        const result = await tx.get(query.limit(limit));
        return result.docs.map(s => ({ ...s.data(), id: s.id }));
      },
      create: (key, data) => tx.create(db.doc(key), data),
      put: (key, data) => tx.set(db.doc(key), data),
      patch: (key, data) => tx.update(db.doc(key), data)
    };
  }
  return { transaction: work => db.runTransaction(tx => work(unit(tx))), unit };
}

module.exports = { createFirestoreBillingStore };
