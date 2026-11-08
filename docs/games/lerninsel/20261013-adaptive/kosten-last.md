# Illustrative Kosten- und Lastrechnung

13.10.2026. **Annahmen, keine Messwerte:** Basispaket B=50–150MB; textlastiges Szenario M=30–100KB. Referenz B=100MB, M=60KB. Das ist ein Zielbudget für eine ausgewählte schlanke Runtime, nicht die heutige Größe des Unreal-Prototyps. Dezimal:1MB=1.000.000Bytes,1GB=1.000MB; GiB-Preise nicht gleichsetzen. N=Starts, c=Anteil mit fehlendem/verworfenem Gerätecache. Transfer=N×(c×B+M); Runtimeupdate kann c wieder auf1 setzen.

| Angenommener Fall | Assettransfer B | Szenariotransfer M | Gesamtes Datenvolumen |
| --- | ---: | ---: | ---: |
| 1.000 ColdLoads, Referenz | 100GB | 0,06GB | 100,06GB |
| 1.000 ColdLoads, Budgetband | 50–150GB | 0,03–0,10GB | 50,03–150,10GB |
| 30.000 Monatsstarts, alle kalt | 3.000GB | 1,8GB | 3.001,8GB |
| 30.000 Starts,90% Assetcachetreffer | 300GB | 1,8GB | 301,8GB |
| 30.000 Starts,99% Assetcachetreffer | 30GB | 1,8GB | 31,8GB |

1.000 gleichzeitig ist keine Monatszahl. 1.000 neue ColdLoads täglich ergeben bei angenommenen30Tagen30.000 ColdLoads; dieselben Geräte täglich können warm starten. Ein CDNcachetreffer spart keinen Schülertransfer, ein Browser-/Gerätecachetreffer schon. Bilder, Audio, Updates, Fehlversuche und Header sind zusätzlich; ein angenommenes2MB-Audio je Monatsstart wären weitere60GB. Das heutige Paper kann Medien inline enthalten:30–100KB gilt deshalb ausdrücklich nur ohne größere Medien, nicht für jede bestehende Audio-/Bildaufgabe.

## Offizielle Preisbasis und Dienstgrenzen

[Classic Firebase Hosting](https://firebase.google.com/docs/hosting/usage-quotas-pricing), abgerufen13.10.2026: globaler CDNtarif, Blaze10GB/Monat Transferfreiquota, danach0,15USD/GB. Verfügbare Freiquota wird mit der Website geteilt. Nur wenn B tatsächlich dort ausgeliefert wird, lautet die Assetkostenformel C_H=max(0,N×c×B/1000−Q_rest)×0,15. Bei vollständig verfügbarem Q_rest=10GB ergeben die Referenzfälle13,50USD,448,50USD,43,50USD beziehungsweise3,00USD für **Assets allein**. Ohne Restquota:15USD,450USD,45USD beziehungsweise4,50USD. Keine Steuern, Storage-, API-, Logging- oder AI-Kosten enthalten. App-Store-/Storage-Distribution hat andere Tarife.

Das Attempt-Paper/gebundene Manifest kommt über einen geschützten APIweg, nicht als weltweit geteilter CDNcacheeintrag. Seine1,8GB sind daher separat nach tatsächlichem Backend-Egress zu bepreisen. Öffentliche generische Assets und private personenbezogene/prüfungsbezogene Antworten erhalten unterschiedliche Cachepolicies. CDN ist keine Zusage einer EU-Speicherregion.

[Firestore-Preistabelle](https://cloud.google.com/firestore/pricing), abgerufen13.10.2026, Standard/Default-SKU, **angezeigte Region Iowa us-central1**:0,03USD/100.000 Reads,0,09USD/100.000 Writes. Dies ist ein Einheitenbeispiel, **kein übernommener EU-Projekttarif**; die Datenbankregion ist hier nicht festgestellt, Functions-Code nennt europe-west1. Aktuelle tatsächliche Regionspreise vor Budgetfreigabe einsetzen. Operationen inklusive Index-/Listener-/Retryeffekten zählen; tägliche Freiquota nicht pauschal als Monatsguthaben verrechnen.

Gesamtformel: C=C_Assets+C_API_Egress+(Reads/100.000)×p_R+(Writes/100.000)×p_W+C_Compute+C_Storage+C_Logs+C_AI. AI: Zahl deduplizierter Lehrerjobs×(Inputtokens×p_In+Outputtokens×p_Out)/1.000.000 plus Bild-/Audiojobs und qualifizierte Retries. Keine Provider-/GPUrate ohne konkrete Auswahl erfinden. Der deterministische Mapper braucht keinen AI-Call pro Schüler; vorhandene Generatorjobs/Budgets werden nicht doppelt gezählt.

## Last: Durchschnitt und Peak getrennt

1.000 Starts in60s bedeuten16,67Startrequests/s; 1.000 Abgaben in15min durchschnittlich1,11/s, eine gebündelte10s-Abgabewelle100/s. Transaktionsreads und Writes pro Request sind ein Multiplikator, nicht diese Requestzahl selbst. Vorgeschlagene spätere Lastprobe umfasst diese Peaks und wiederholte identische Abgaben. Keine Kapazitätsmessung heute.

Bei angenommenen25Reads und6Writes pro Start/Abgabe zusammen ergeben30.000 Attempts750.000Reads und180.000Writes vor zusätzlichem Polling/Review/Retry. Das ist keine Messung des heutigen Gesamtsystems. Ein5s-Poll über15min erzeugt180Requests je Spieler und5,4Millionen zusätzliche Monatsrequests. 60FPS-Bewegungen von1.000 Spielern über15min würden54Millionen Events erzeugen: ausdrücklich lokal halten. Optionale fachliche Checkpoints bündeln; Teacherdashboards nach Klassen aggregieren. Netzwerkvolumen sagt nichts über Peak-RAM, FPS oder Wärmeentwicklung am iPad.

## Pixel Streaming ist ein anderes Kostenmodell

[Epic-Übersicht](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-pixel-streaming-in-unreal-engine) beschreibt Hostrendering; [Skalierung](https://dev.epicgames.com/documentation/en-us/unreal-engine/hosting-and-networking-guide-for-pixel-streaming-in-unreal-engine) benötigt eigene Kapazitätsplanung. Annahme8Mbit/s Video,15min:8×900/8=900MB pro Sitzung; 1.000 unabhängige Sitzungen900GB bei8Gbit/s Spitzenstreambandbreite;30.000 Monatsstarts27.000GB und7.500Spielerstunden. Audio/Protokoll/TURN zusätzlich. GPUkosten=(Spielerstunden/k_effektiv)×GPUhostpreis plusCPU/RAM/Idle/Orchestrierung. k_effektiv ist erst am realen Build zu messen. Cloud-/TURN-Egress ist nicht automatisch Classic-Hostingtransfer. Kein konkreter GPUanbieter gestartet, kein Tarif zugesagt; Zuschauer desselben Streams sind keine unabhängigen Spielersitzungen.
