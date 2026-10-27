"use strict";
module.exports = function database() {
  const docs = new Map();
  const doc = path => ({ path,
    create: async data => { if (docs.has(path)) throw Object.assign(new Error("exists"), { code: 6 }); docs.set(path, structuredClone(data)); },
    get: async () => ({ exists: docs.has(path), data: () => structuredClone(docs.get(path)) }),
    set: async data => { docs.set(path, structuredClone(data)); }
  });
  let tail = Promise.resolve();
  return { doc, runTransaction: callback => {
    const result = tail.then(() => callback({ get: ref => ref.get(), set: (ref, data) => docs.set(ref.path, structuredClone(data)) }));
    tail = result.catch(() => {}); return result;
  } };
};
