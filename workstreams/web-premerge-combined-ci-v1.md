# Web Pre-Merge Combined CI

Task GC-RELEASE-02. Branch fix/web-premerge-combined-ci-v1 → feature/gradecrew-app-integration.
Basis 8aba2a7ce70c75842fbe4b81c4e6491136366768. Main AGENTS/START_HERE und Development Status 37053274929 geprüft; Web-Branch besitzt keine eigene AGENTS.md.

Die vorhandene AI Staging Checks prüfte nur Push/Dispatch. Neuer pull_request-Trigger testet GitHubs Merge-Result für jeden PR auf den Web-Integrationsbranch. Keine Pfadfilter, keine Cloud-Zugangsdaten, kein Deploy. Checkout persistiert keine Credentials. Concurrency trennt PRs voneinander und von Pushes.

Der Combined-Job umfasst bereits AI-Functions, Secure-Backend, Firestore-Emulator, Browser, i18n und Build. Neu laufen zusätzlich Crew-Core/Emmi, Admin-Steuerung, Short-Login und Tutorial-Choice, die vorher nur in separaten Branch-Workflows geprüft wurden. Bestehender Staging-Deploy bleibt ausschließlich nach erfolgreichem Push aktiv; PR-CI startet keinen Deploy.

PR #51, Code 1985673476606b9222f08a014f657b7579910891: CI 37074747781 auf dem tatsächlichen PR-Merge-Result vollständig grün, inklusive Firestore-Emulator und ergänzter Crew/Emmi/Admin/Login/Tutorial-Prüfungen. Branchschutz bleibt separat: GitHub meldet Tarifgrenze, kein erforderlicher Check kann allein durch diese YAML erzwungen werden. Nicht ohne grünen Combined-Lauf integrieren. Eine Integration auf Web löst vorhandene Staging-Pipelines aus; dieser Review-Auftrag gibt keinen Deploy frei.

