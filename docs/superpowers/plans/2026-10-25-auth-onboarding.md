# Auth onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Bestehenden Einstieg um Konto-CTA, siebenmalige Tutorial-Einladung und servergeprüften E-Mail-Code ergänzen.

**Architecture:** Bestehende Entry-Ansichten und Crew-Tour weiterverwenden. Separates UI-Modul und isolierter Server-Service mit injizierten Firestore/Auth/Mail-Abhängigkeiten; `pending_verification` nutzt bestehende aktive Kontogrenzen.

**Tech Stack:** Vanilla ES modules, Firebase Auth/Firestore/Functions, Node.js, Resend HTTP API.

**Spec:** docs/superpowers/specs/2026-10-25-auth-onboarding-design.md

## Global Constraints

Bestehende Konten behalten Zugang. Neue Konten `pending_verification`. Sechs Ziffern, zehn Minuten, fünf Versuche, 60 Sekunden Versandpause. Erste sieben echte Anmeldungen zeigen Einladung/Kopfbutton, danach nur Einstellungen. Kein Production-Deploy. Maildienst ist noch nicht eingerichtet.

## Review Focus

Gleichzeitige Auth-/Registrierungsrückrufe; Kontowechsel während Codeanfrage; Code- und Versandrennen; E-Mail-Änderung während Bestätigung; deaktivierte oder gelöschte Konten und fehlender Maildienst.

### Task 1: Tutorial und Einstieg

Files: `tutorial-signins.mjs`, `dashboard-tutorial-entry.mjs`, `gradecrew-tour-v7.js`, `gradecrew-entry-flow.js`, zugehörige Tests, `gradecrew-hero-scene.css`, lokaler Homepage-Header.

- [x] Grenztests für Anmeldung 7/8 und wiederholten Dashboard-Besuch schreiben, vorher fehlschlagen sehen.
- [x] Gemeinsame Grenze acht als gespeicherte Sättigung; Einladung je echter Auth-Sitzung, Kopfbutton nur bis sieben, Einstellungen dauerhaft. Konto-CTA öffnet vorhandenes Registerformular.
- [x] Verhaltenstests und Entry-Tests prüfen und committen.

### Task 2: E-Mail-Code auf dem Server

Files: `functions/lib/email-verification.js`, `functions/lib/verification-mail.js`, `functions/email-verification-callables.js`, `functions/main.js`, Server-Tests, beide Firestore-Regeldateien und Emulator-Test.

- [x] Auth-Bindung, Ablauf, Fehlversuche, paralleles Bestätigen/Neusenden, Kontolöschung, Limits und Versandfehler testen; RED vor Code.
- [x] Server-Service mit privaten Transaktionen und HMAC, sichere Empfängerbindung und Resend-Adapter implementieren. Bestehende Profile unverändert, neue Profile serverseitig wartend anlegen.
- [x] Neue Self-Profile nur wartend erlauben, Aktivierung/Code-Daten clientseitig sperren. Regeln und gezielte Funktionen prüfen und committen.

### Task 3: Verifizierungsoberfläche und Anbindung

Files: `email-verification.mjs`, `app.js`, `ai-client.js`, `gradecrew-entry-flow.js`, CSS, `tools/build-staging.mjs`, UI-Tests und Setup-Dokument.

- [x] UI-Rennfälle, Einfügen des Codes, erneuten Versand und falschen Code testen.
- [x] Registrierung und Auth-Observer abstimmen; wartende Konten ausschließlich zur Codeansicht führen; Bestätigung aktualisiert Token und lädt den bestehenden Einstieg neu.
- [x] Build und relevante Tests ausführen, Browser-Sichtprüfung speichern, unabhängige Schlussprüfung, Übergabe/TODO und Draft-PR sichern. Mail-Setup und echte Empfangsabnahme ausdrücklich offen lassen.

Erledigt und auf GitHub als Entwurfs-PR303 gesichert. Maildienst, echter Versand, Integration und Deploy bleiben die dokumentierten Auslieferungsgates; diese waren nicht als in dieser Vorbereitung erfolgreich zu behaupten.
