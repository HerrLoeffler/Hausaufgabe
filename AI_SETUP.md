# Testify AI staging setup

Run these commands only from `feature/ai-integration` and only against the staging project.

## 1. Preconditions

```bash
git branch --show-current
git status --short
firebase use
```

Expected branch: `feature/ai-integration`. Expected active Firebase project: `default (hausaufgabe-staging)`.

Cloud Functions requires a Firebase project with billing enabled. Confirm billing/budgets before the first Functions deployment.

## 2. Install Functions dependencies

```bash
cd functions
npm install
npm test
npm run check
cd ..
```

## 3. Store the OpenAI key server-side

```bash
firebase functions:secrets:set OPENAI_API_KEY --project hausaufgabe-staging
```

Paste the key only into the Firebase CLI secret prompt. Do not put it in any `.js`, `.json`, `.env` committed to Git, browser console, or Firestore document.

## 4. Deploy staging

```bash
./deploy-staging.sh
```

The script deploys only to `hausaufgabe-staging`: Firestore rules, Storage rules, Functions and Hosting. It intentionally does not deploy Firestore indexes.

## 5. First smoke test

1. Open `https://hausaufgabe-staging.web.app`.
2. Sign in with an active Firestore user whose `role` is `admin`.
3. Open `+ Neuer Test -> Mit KI erstellen`.
4. Start with images disabled and no upload: Mathematics / class 9 / percentage calculation / 5 questions / 10 points.
5. Verify the generated draft opens in the normal editor and can be saved/previewed.
6. Test `✨ KI bearbeiten` and `↻ Neue Variante` on one question and verify `↶` undo appears.
7. Only after text generation works, test one small PDF/image upload.
8. Set "Aufgaben mit einem Bild" to 1 and verify exactly one image appears; then set "Aufgaben mit Bildantworten" to 1 and verify all choices have images. These calls use the staging API key and incur image costs.

## 6. Known beta boundaries

- App Check enforcement is not yet enabled; server-side Auth, active-account, admin-beta and quota checks are active.
- Deterministic cropping of a region from uploaded material is not part of the first smoke test. The AI is instructed not to rely on this path yet.
- Generated images reuse Testify's existing embedded image representation for compatibility during the beta.

## 7. Rollback

Staging can be reset to the pre-AI branch state without touching production. Production stays on the existing verified release unless a separate production deploy is explicitly initiated.
