# Quellen und Codebelege

Frisch gelesen13.10.2026; Quellbeleg ist kein neuer Runtime-/Sicherheits-/Gerätetest. Koordinationsbasis [main@a0f16f9](https://github.com/HerrLoeffler/Hausaufgabe/tree/a0f16f9cf64c74dcdacefa489d2e7a1da1b58881); tatsächliche Produktbasis [Integrationsstand44ab6540](https://github.com/HerrLoeffler/Hausaufgabe/tree/44ab6540a9ac0cd4a144dd25eb84a7198d22498b). Sourceblobs wurden aus frisch gefetchten Gitrefs gelesen, nicht aus alten Handoffaussagen abgeleitet.

## Bestehender Assessment-Code

Alle folgenden Zeilen am unveränderlichen44ab-SHA:

| Beleg | Aussage |
| --- | --- |
| [main.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/assessment-functions/main.js#L3) | maßgebliche Exporte secure-lifecycle+cleanup, nicht legacy handler |
| [constants.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/functions/lib/constants.js#L11) | elf Aufgabentypen; bestehender Generatorvertrag |
| [assessment-core.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/assessment-functions/lib/assessment-core.js#L44) | opaqueId; ab169 öffentliche Projektion, ab247 privater Schlüssel, ab398 Bewertung, ab517 Antwortsanitizer |
| [secure-lifecycle.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/assessment-functions/lib/secure-lifecycle.js#L403) | Authoringfingerprint beim Resume;420Info/427Start/538Resume/605Submit/704Receipt;31Region, kein erzwungenes AppCheck im Source |
| [Submittransaktion](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/assessment-functions/lib/secure-lifecycle.js#L623) | Tokenprüfung vor idempotenter Quittung;650Sanitizer/651Serverbewertung,690private Schlüsseldaten entfernen |
| [Client](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/secure-assessment-client.js#L88) | reale Callablebindung;186Submit,167Resume; kein nativer C++-Adapter |
| [Rules](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/firestore.secure-assessment.rules#L175) | Authoringfragen nicht öffentlich lesbar;232assessmentPrivate gesperrt |

[Lerninsel-Regeln am aktuellen PR220-Checkpoint](https://github.com/HerrLoeffler/Hausaufgabe/blob/ee994cbc8e61134d3daa72dd46f1a589205ec6a5/games/lerninsel-unreal/Source/Lerninsel/Core/IslandRules.h#L25): lokale Lösungen/3/10-Prüfung, ausdrücklich keine unveränderte summative Zielarchitektur. Level1 wird durch diesen Auftrag nicht verändert.

Verwandte Quellen: [Gamesworkflow](../../GREAT_GAMES_WORKFLOW.md), [PR185 gemeinsame Grundlage](https://github.com/HerrLoeffler/Hausaufgabe/pull/185), [PR218 Aufgabenpool](https://github.com/HerrLoeffler/Hausaufgabe/pull/218), [PR228 Generatorhinweise](https://github.com/HerrLoeffler/Hausaufgabe/pull/228), [PR229 Übungsfreigabe nur vormerken](https://github.com/HerrLoeffler/Hausaufgabe/pull/229). Vor Umsetzung aktueller Status erneut prüfen; keine Aktivierung aus Dokumentation ableiten.

## Primärquellen Plattform

[Epic UE5.8 Packaging](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project): native/mobil unterstützte Targets, kein belastbarer aktueller HTML5-Exportbeleg. [Pixel-Streaming-Übersicht](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-pixel-streaming-in-unreal-engine): Remote-CPU/GPUrendering und Medienstream. [Hosting/Networking](https://dev.epicgames.com/documentation/en-us/unreal-engine/hosting-and-networking-guide-for-pixel-streaming-in-unreal-engine): unabhängige Kapazität/Skalierung, ICE/STUN/TURN. Der ältere HTML5-Satz in der Übersicht wird nicht als aktuelle UE5-Exportfreigabe benutzt.

## Primärquellen Kosten

[Classic Hosting Transfer](https://firebase.google.com/docs/hosting/usage-quotas-pricing): globaler Blaze-CDNtarif und geteilte Freiquota, Clientcache vs CDNtransfer. [Firestore Preise](https://cloud.google.com/firestore/pricing): regions-/operationsabhängige Preise; im Kostenblatt ausdrücklich Iowa-Default-Einheitenbeispiel, tatsächliche EU-Datenbankregion unbekannt. [Cloud Run Preise](https://cloud.google.com/run/pricing): Compute/Requests/Memory/Egress sind separate Einheiten; kein heutiger GPUhost gestartet oder pauschaler EU-GPUtarif zugesagt. USD, Stand des Abrufs13.10.2026, ohne Steuern; spätere Betreiberentscheidung benötigt aktuellen Service-/Regionsabgleich.
