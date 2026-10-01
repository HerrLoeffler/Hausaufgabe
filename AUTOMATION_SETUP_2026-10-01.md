# GradeCrew GitHub → Firebase Staging Automation

Stand: 01.10.2026

Verifiziert eingerichtet:
- GitHub OIDC / Workload Identity Federation für `HerrLoeffler/Hausaufgabe`;
- Google-Cloud-Projekt ausschließlich `hausaufgabe-staging`;
- Servicekonto `gradecrew-github-staging@hausaufgabe-staging.iam.gserviceaccount.com`;
- Workload-Identity-Pool `github-actions`;
- Provider `gradecrew-secure-preview`;
- Branchbindung `feature/secure-assessment-v1`;
- GitHub-Variablen `GCP_WIF_PROVIDER`, `GCP_STAGING_SERVICE_ACCOUNT`, `FIREBASE_STAGING_PROJECT` gesetzt;
- keine dauerhaften Service-Account-Schlüssel erzeugt;
- Production `hausaufgabe-40294` wurde nicht konfiguriert.

Der Workflow `.github/workflows/ai-staging-check.yml` darf einen Secure-Assessment-Preview nur nach erfolgreichem Testjob auf diesem Branch ausführen. Der Deploy bleibt auf `functions:assessment` plus Firebase Hosting Preview Channel begrenzt; Firestore-Regeln und Production werden dabei nicht deployed.

Diese Datei dokumentiert die einmalige Infrastruktur-Einrichtung und erzeugt zugleich einen neuen Branch-Push, damit der automatische Preview-Pfad erstmals mit gesetzten OIDC-Variablen geprüft wird.
