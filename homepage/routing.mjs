// Preserve existing root entry links without moving any assessment/auth logic here.
export function legacyDestination(href) {
  const url = new URL(href);
  if (!['/', '/index.html', '/homepage/', '/homepage/index.html'].includes(url.pathname)) return null;
  const keys = ['test', 'template', 'firstGuide', 'preview', 'intent', 'mode', 'oobCode', 'apiKey', 'continueUrl'];
  if (!keys.some(key => url.searchParams.has(key))) return null;
  url.pathname = '/workspace.html';
  return url.href;
}
