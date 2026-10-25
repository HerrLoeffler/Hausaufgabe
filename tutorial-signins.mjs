// Onboarding preference only: never authorizes account or test access.
const LIMIT = 8;
const count = value => Number.isFinite(Number(value)) ? Math.min(LIMIT, Math.max(0, Math.trunc(Number(value)))) : 0;

export function tutorialSignInPatch(profile, sessionHash) {
  if (!/^[a-f0-9]{64}$/.test(sessionHash || '')) return null;
  const current = count(profile?.crewTourSignInCount);
  const sessions = [...new Set((Array.isArray(profile?.crewTourSignInSessions) ? profile.crewTourSignInSessions : [])
    .filter(value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)))].slice(0, LIMIT);
  if (current >= LIMIT || sessions.includes(sessionHash)) return null;
  return { crewTourSignInCount: Math.min(LIMIT, current + 1), crewTourSignInSessions: [...sessions, sessionHash].slice(-LIMIT) };
}

export async function tutorialSessionHash(user) {
  const time = Date.parse(user?.metadata?.lastSignInTime || '');
  if (!user?.uid || !Number.isFinite(time)) return null;
  const bytes = new TextEncoder().encode(JSON.stringify([user.uid, time]));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

export async function recordTutorialSignIn({ user, db, ref, runTransaction, isCurrent = () => true, hash = tutorialSessionHash }) {
  if (!user?.uid || !Number.isFinite(Date.parse(user.metadata?.lastSignInTime || '')) || !isCurrent()) return null;
  try {
    const key = await hash(user);
    if (!key || !isCurrent()) return null;
    return await runTransaction(db, async transaction => {
      if (!isCurrent()) return null;
      const snapshot = await transaction.get(ref);
      if (!isCurrent() || !snapshot.exists()) return null;
      const profile = snapshot.data();
      if ((profile.status && profile.status !== 'active') || profile.accountDeletionId) return null;
      const patch = tutorialSignInPatch(profile, key);
      if (patch) transaction.update(ref, patch);
      return { ...profile, ...patch };
    });
  } catch {
    // Optional preference: offline/permission/hash failures never block sign-in.
    return null;
  }
}
